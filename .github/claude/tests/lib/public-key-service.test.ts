import { PublicKeyService } from '@/lib/public-key-service';

// Mock viem functions
const mockHashMessage = jest.fn();
const mockRecoverPublicKey = jest.fn();
const mockGetAddress = jest.fn();
const mockRecoverAddress = jest.fn();

jest.mock('viem', () => ({
  hashMessage: mockHashMessage,
  recoverPublicKey: mockRecoverPublicKey,
  getAddress: mockGetAddress,
  recoverAddress: mockRecoverAddress,
}));

describe('PublicKeyService', () => {
  let service: PublicKeyService;
  const mockSignMessageAsync = jest.fn();
  const testAddress = '0x1234567890123456789012345678901234567890';
  const testPublicKey = '0x04abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

  beforeEach(() => {
    service = new PublicKeyService();
    jest.clearAllMocks();
    localStorage.clear();

    // Default mock implementations
    mockSignMessageAsync.mockResolvedValue('0xsignature123');
    mockHashMessage.mockReturnValue('0xhash123');
    mockRecoverPublicKey.mockResolvedValue(testPublicKey);
    mockGetAddress.mockReturnValue(testAddress);
    mockRecoverAddress.mockResolvedValue(testAddress);
  });

  describe('discoverPublicKey', () => {
    it('returns cached key if available and valid', async () => {
      // Set up cached key
      const cacheEntry = {
        publicKey: testPublicKey,
        timestamp: Date.now(),
        verified: true,
      };
      localStorage.setItem('filosign_public_keys', JSON.stringify({
        [testAddress.toLowerCase()]: cacheEntry,
      }));

      const result = await service.discoverPublicKey(testAddress, mockSignMessageAsync);

      expect(result).toBe(testPublicKey);
      expect(mockSignMessageAsync).not.toHaveBeenCalled();
    });

    it('discovers new key when no cached key exists', async () => {
      const result = await service.discoverPublicKey(testAddress, mockSignMessageAsync);

      expect(mockSignMessageAsync).toHaveBeenCalledWith({
        message: expect.stringContaining('FiloSign Public Key Discovery'),
      });
      expect(mockRecoverPublicKey).toHaveBeenCalled();
      expect(result).toBe(testPublicKey);
    });

    it('validates signature matches wallet address', async () => {
      await service.discoverPublicKey(testAddress, mockSignMessageAsync);

      expect(mockRecoverAddress).toHaveBeenCalled();
    });

    it('throws error when signature validation fails', async () => {
      mockRecoverAddress.mockResolvedValue('0xdifferentaddress');

      await expect(service.discoverPublicKey(testAddress, mockSignMessageAsync))
        .rejects.toThrow('Signature validation failed');
    });

    it('caches successfully discovered key', async () => {
      await service.discoverPublicKey(testAddress, mockSignMessageAsync);

      const cached = localStorage.getItem('filosign_public_keys');
      const parsedCache = JSON.parse(cached!);
      
      expect(parsedCache[testAddress.toLowerCase()]).toEqual({
        publicKey: testPublicKey,
        timestamp: expect.any(Number),
        verified: true,
      });
    });

    it('handles signing errors gracefully', async () => {
      mockSignMessageAsync.mockRejectedValue(new Error('User rejected signing'));

      await expect(service.discoverPublicKey(testAddress, mockSignMessageAsync))
        .rejects.toThrow('Public key discovery failed: User rejected signing');
    });
  });

  describe('getPublicKey', () => {
    it('returns cached key when valid', async () => {
      const cacheEntry = {
        publicKey: testPublicKey,
        timestamp: Date.now(),
        verified: true,
      };
      localStorage.setItem('filosign_public_keys', JSON.stringify({
        [testAddress.toLowerCase()]: cacheEntry,
      }));

      const result = await service.getPublicKey(testAddress);

      expect(result).toBe(testPublicKey);
    });

    it('returns null when no cached key exists', async () => {
      const result = await service.getPublicKey(testAddress);

      expect(result).toBeNull();
    });

    it('removes and returns null for expired keys', async () => {
      const expiredTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago
      const cacheEntry = {
        publicKey: testPublicKey,
        timestamp: expiredTimestamp,
        verified: true,
      };
      localStorage.setItem('filosign_public_keys', JSON.stringify({
        [testAddress.toLowerCase()]: cacheEntry,
      }));

      const result = await service.getPublicKey(testAddress);

      expect(result).toBeNull();
      
      const cached = localStorage.getItem('filosign_public_keys');
      const parsedCache = JSON.parse(cached!);
      expect(parsedCache[testAddress.toLowerCase()]).toBeUndefined();
    });

    it('removes and returns null for unverified keys', async () => {
      const cacheEntry = {
        publicKey: testPublicKey,
        timestamp: Date.now(),
        verified: false,
      };
      localStorage.setItem('filosign_public_keys', JSON.stringify({
        [testAddress.toLowerCase()]: cacheEntry,
      }));

      const result = await service.getPublicKey(testAddress);

      expect(result).toBeNull();
    });

    it('handles localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await service.getPublicKey(testAddress);

      expect(result).toBeNull();
      
      // Restore original method
      localStorage.getItem = originalGetItem;
    });
  });

  describe('cachePublicKey', () => {
    it('stores public key with correct format', async () => {
      await service.cachePublicKey(testAddress, testPublicKey);

      const cached = localStorage.getItem('filosign_public_keys');
      const parsedCache = JSON.parse(cached!);
      
      expect(parsedCache[testAddress.toLowerCase()]).toEqual({
        publicKey: testPublicKey,
        timestamp: expect.any(Number),
        verified: true,
      });
    });

    it('overwrites existing cache entry', async () => {
      const oldKey = '0x04oldkey';
      const newKey = '0x04newkey';

      await service.cachePublicKey(testAddress, oldKey);
      await service.cachePublicKey(testAddress, newKey);

      const cached = localStorage.getItem('filosign_public_keys');
      const parsedCache = JSON.parse(cached!);
      
      expect(parsedCache[testAddress.toLowerCase()].publicKey).toBe(newKey);
    });

    it('preserves other cached entries', async () => {
      const otherAddress = '0x9876543210987654321098765432109876543210';
      const otherKey = '0x04otherkey';

      await service.cachePublicKey(otherAddress, otherKey);
      await service.cachePublicKey(testAddress, testPublicKey);

      const cached = localStorage.getItem('filosign_public_keys');
      const parsedCache = JSON.parse(cached!);
      
      expect(parsedCache[testAddress.toLowerCase()].publicKey).toBe(testPublicKey);
      expect(parsedCache[otherAddress.toLowerCase()].publicKey).toBe(otherKey);
    });
  });

  describe('removeCachedKey', () => {
    it('removes specific key from cache', async () => {
      await service.cachePublicKey(testAddress, testPublicKey);
      await service.removeCachedKey(testAddress);

      const result = await service.getPublicKey(testAddress);
      expect(result).toBeNull();
    });

    it('preserves other keys when removing specific key', async () => {
      const otherAddress = '0x9876543210987654321098765432109876543210';
      const otherKey = '0x04otherkey';

      await service.cachePublicKey(testAddress, testPublicKey);
      await service.cachePublicKey(otherAddress, otherKey);
      
      await service.removeCachedKey(testAddress);

      expect(await service.getPublicKey(testAddress)).toBeNull();
      expect(await service.getPublicKey(otherAddress)).toBe(otherKey);
    });
  });

  describe('clearAllCachedKeys', () => {
    it('removes all cached keys', async () => {
      await service.cachePublicKey(testAddress, testPublicKey);
      await service.cachePublicKey('0x9876543210987654321098765432109876543210', '0x04otherkey');
      
      await service.clearAllCachedKeys();

      expect(await service.getPublicKey(testAddress)).toBeNull();
      expect(await service.getPublicKey('0x9876543210987654321098765432109876543210')).toBeNull();
    });
  });

  describe('Message Generation', () => {
    it('generates standard message with correct format', () => {
      const message = service['generateStandardMessage'](testAddress);
      
      expect(message).toContain('FiloSign Public Key Discovery');
      expect(message).toContain(testAddress);
      expect(message).toContain('timestamp');
    });

    it('generates unique messages for different addresses', () => {
      const message1 = service['generateStandardMessage'](testAddress);
      const message2 = service['generateStandardMessage']('0x9876543210987654321098765432109876543210');
      
      expect(message1).not.toBe(message2);
    });
  });

  describe('Key Validation', () => {
    it('validates public key format', () => {
      const validKey = testPublicKey;
      const invalidKey = '0xinvalidkey';

      expect(service['validatePublicKeyFormat'](validKey)).toBe(true);
      expect(service['validatePublicKeyFormat'](invalidKey)).toBe(false);
    });

    it('validates address format', () => {
      const validAddress = testAddress;
      const invalidAddress = '0xinvalidaddress';

      expect(service['validateAddressFormat'](validAddress)).toBe(true);
      expect(service['validateAddressFormat'](invalidAddress)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid wallet address', async () => {
      await expect(service.discoverPublicKey('invalid', mockSignMessageAsync))
        .rejects.toThrow();
    });

    it('handles signature recovery failure', async () => {
      mockRecoverPublicKey.mockRejectedValue(new Error('Recovery failed'));

      await expect(service.discoverPublicKey(testAddress, mockSignMessageAsync))
        .rejects.toThrow('Public key discovery failed');
    });

    it('handles localStorage unavailability', async () => {
      // Mock localStorage methods to throw errors
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      await expect(service.cachePublicKey(testAddress, testPublicKey))
        .rejects.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });
});
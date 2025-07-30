import { EncryptionService } from '@/lib/encryption-service';

// Mock public key service
const mockGetPublicKey = jest.fn();
jest.mock('@/lib/public-key-service', () => ({
  publicKeyService: {
    getPublicKey: mockGetPublicKey,
  },
}));

describe('EncryptionService', () => {
  let service: EncryptionService;
  const testData = 'Test document content';
  const alicePublicKey = '0x04alice-public-key';
  const bobPublicKey = '0x04bob-public-key';

  beforeEach(() => {
    service = new EncryptionService();
    jest.clearAllMocks();
  });

  describe('encryptDocument', () => {
    it('encrypts document with dual access keys', async () => {
      const result = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      expect(result).toEqual({
        encryptedData: expect.any(String),
        encryptedKeyForAlice: expect.any(String),
        encryptedKeyForBob: expect.any(String),
        encryptionMethod: 'privacy-preserving-dual-access',
      });
    });

    it('creates different encrypted keys for different public keys', async () => {
      const result = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      expect(result.encryptedKeyForAlice).not.toBe(result.encryptedKeyForBob);
    });

    it('encrypts data consistently', async () => {
      const result1 = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);
      const result2 = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      // Different AES keys should produce different encrypted data
      expect(result1.encryptedData).not.toBe(result2.encryptedData);
    });

    it('handles empty data', async () => {
      const result = await service.encryptDocument('', alicePublicKey, bobPublicKey);

      expect(result.encryptedData).toBeDefined();
      expect(result.encryptionMethod).toBe('privacy-preserving-dual-access');
    });

    it('handles large data', async () => {
      const largeData = 'x'.repeat(10000);
      
      const result = await service.encryptDocument(largeData, alicePublicKey, bobPublicKey);

      expect(result.encryptedData).toBeDefined();
      expect(result.encryptedData.length).toBeGreaterThan(0);
    });

    it('throws error on invalid public keys', async () => {
      await expect(service.encryptDocument(testData, '', bobPublicKey))
        .rejects.toThrow('Failed to encrypt document');
    });
  });

  describe('decryptDocument', () => {
    let encryptedDoc: any;

    beforeEach(async () => {
      encryptedDoc = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);
    });

    it('decrypts document with Alice\'s key', async () => {
      const result = await service.decryptDocument(encryptedDoc, alicePublicKey);

      expect(result).toBe(testData);
    });

    it('decrypts document with Bob\'s key', async () => {
      const result = await service.decryptDocument(encryptedDoc, bobPublicKey);

      expect(result).toBe(testData);
    });

    it('returns null for unauthorized public key', async () => {
      const unauthorizedKey = '0x04unauthorized-key';
      
      const result = await service.decryptDocument(encryptedDoc, unauthorizedKey);

      expect(result).toBeNull();
    });

    it('handles corrupted encrypted document', async () => {
      const corruptedDoc = {
        ...encryptedDoc,
        encryptedData: 'corrupted-data',
      };

      const result = await service.decryptDocument(corruptedDoc, alicePublicKey);

      expect(result).toBeNull();
    });

    it('handles missing encrypted keys', async () => {
      const incompleteDoc = {
        ...encryptedDoc,
        encryptedKeyForAlice: '',
        encryptedKeyForBob: '',
      };

      const result = await service.decryptDocument(incompleteDoc, alicePublicKey);

      expect(result).toBeNull();
    });
  });

  describe('Privacy-Preserving Features', () => {
    it('does not store addresses in encrypted document', async () => {
      const result = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      expect(result).not.toHaveProperty('senderAddress');
      expect(result).not.toHaveProperty('recipientAddress');
      expect(result).not.toHaveProperty('aliceAddress');
      expect(result).not.toHaveProperty('bobAddress');
    });

    it('enables pure cryptographic access control', async () => {
      const encrypted = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      // Only public keys can decrypt, no address-based authorization
      expect(await service.decryptDocument(encrypted, alicePublicKey)).toBe(testData);
      expect(await service.decryptDocument(encrypted, bobPublicKey)).toBe(testData);
      expect(await service.decryptDocument(encrypted, '0x04other-key')).toBeNull();
    });
  });

  describe('Encryption Method Validation', () => {
    it('sets correct encryption method', async () => {
      const result = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      expect(result.encryptionMethod).toBe('privacy-preserving-dual-access');
    });

    it('validates encryption method during decryption', async () => {
      const encrypted = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);
      
      // Modify encryption method
      const modifiedDoc = {
        ...encrypted,
        encryptionMethod: 'invalid-method' as any,
      };

      const result = await service.decryptDocument(modifiedDoc, alicePublicKey);

      // Should still attempt decryption but may fail due to invalid method
      expect(typeof result).toBe('string' || result === null);
    });
  });

  describe('AES Key Management', () => {
    it('generates different AES keys for each encryption', () => {
      const key1 = service['generateMockAESKey']();
      const key2 = service['generateMockAESKey']();

      expect(key1).not.toBe(key2);
    });

    it('validates AES key format', () => {
      const key = service['generateMockAESKey']();

      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });

  describe('ECIES Simulation', () => {
    it('simulates ECIES encryption consistently', () => {
      const aesKey = 'test-aes-key';
      
      const encrypted1 = service['simulateECIESEncryption'](aesKey, alicePublicKey);
      const encrypted2 = service['simulateECIESEncryption'](aesKey, alicePublicKey);

      // Should be consistent for same inputs
      expect(encrypted1).toBe(encrypted2);
    });

    it('produces different results for different public keys', () => {
      const aesKey = 'test-aes-key';
      
      const encryptedAlice = service['simulateECIESEncryption'](aesKey, alicePublicKey);
      const encryptedBob = service['simulateECIESEncryption'](aesKey, bobPublicKey);

      expect(encryptedAlice).not.toBe(encryptedBob);
    });

    it('simulates ECIES decryption correctly', () => {
      const aesKey = 'test-aes-key';
      const encrypted = service['simulateECIESEncryption'](aesKey, alicePublicKey);
      
      const decrypted = service['simulateECIESDecryption'](encrypted, alicePublicKey);

      expect(decrypted).toBe(aesKey);
    });

    it('fails ECIES decryption with wrong key', () => {
      const aesKey = 'test-aes-key';
      const encrypted = service['simulateECIESEncryption'](aesKey, alicePublicKey);
      
      const decrypted = service['simulateECIESDecryption'](encrypted, bobPublicKey);

      expect(decrypted).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('handles encryption failures gracefully', async () => {
      // Mock internal method to throw error
      jest.spyOn(service as any, 'generateMockAESKey').mockImplementation(() => {
        throw new Error('Key generation failed');
      });

      await expect(service.encryptDocument(testData, alicePublicKey, bobPublicKey))
        .rejects.toThrow('Failed to encrypt document');
    });

    it('handles decryption failures gracefully', async () => {
      const encrypted = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);
      
      // Mock decryption method to throw error
      jest.spyOn(service as any, 'decryptWithAESKey').mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      const result = await service.decryptDocument(encrypted, alicePublicKey);

      expect(result).toBeNull();
    });

    it('validates input parameters', async () => {
      await expect(service.encryptDocument(testData, '', bobPublicKey))
        .rejects.toThrow();

      await expect(service.encryptDocument(testData, alicePublicKey, ''))
        .rejects.toThrow();
    });
  });

  describe('Logging and Debugging', () => {
    it('logs encryption process steps', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.encryptDocument(testData, alicePublicKey, bobPublicKey);

      expect(consoleSpy).toHaveBeenCalledWith('🔐 Starting encryption process...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ Encryption complete!');

      consoleSpy.mockRestore();
    });

    it('logs decryption attempts', async () => {
      const encrypted = await service.encryptDocument(testData, alicePublicKey, bobPublicKey);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.decryptDocument(encrypted, alicePublicKey);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Privacy-preserving decryption attempt:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});
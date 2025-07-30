import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnection } from '@/components/wallet-connection';

// Mock wagmi hooks
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockSignMessageAsync = jest.fn();

jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chain: { id: 1, name: 'Ethereum' },
  }),
  useConnect: () => ({
    connect: mockConnect,
    connectors: [
      { id: 'metaMask', name: 'MetaMask' },
      { id: 'walletConnect', name: 'WalletConnect' },
    ],
    isPending: false,
  }),
  useDisconnect: () => ({
    disconnect: mockDisconnect,
  }),
  useSignMessage: () => ({
    signMessageAsync: mockSignMessageAsync,
  }),
}));

// Mock public key service
const mockGetPublicKey = jest.fn();
const mockDiscoverPublicKey = jest.fn();

jest.mock('@/lib/public-key-service', () => ({
  publicKeyService: {
    getPublicKey: mockGetPublicKey,
    discoverPublicKey: mockDiscoverPublicKey,
  },
}));

// Mock wagmi config
jest.mock('@/lib/wagmi-config', () => ({
  formatAddress: (address: string) => `${address.substring(0, 6)}...${address.substring(38)}`,
  getChainName: (chainId: number) => chainId === 1 ? 'Ethereum' : 'Unknown',
}));

describe('WalletConnection Component', () => {
  const mockOnWalletConnected = jest.fn();
  const mockOnWalletDisconnected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPublicKey.mockResolvedValue(null);
    mockDiscoverPublicKey.mockResolvedValue('0x04test-public-key');
    mockSignMessageAsync.mockResolvedValue('0xtest-signature');
  });

  describe('Connected State', () => {
    it('displays wallet connection info when connected', () => {
      render(<WalletConnection />);

      expect(screen.getByText('Wallet Connected')).toBeInTheDocument();
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      expect(screen.getByText(/on Ethereum/)).toBeInTheDocument();
      expect(screen.getByText('Disconnect')).toBeInTheDocument();
    });

    it('calls disconnect when disconnect button is clicked', () => {
      render(<WalletConnection onWalletDisconnected={mockOnWalletDisconnected} />);

      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockOnWalletDisconnected).toHaveBeenCalled();
    });

    it('shows public key discovery UI when no cached key exists', async () => {
      mockGetPublicKey.mockResolvedValue(null);

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText(/To use FiloSign, we need to discover your public key/)).toBeInTheDocument();
      });
    });

    it('shows encryption ready status when public key exists', async () => {
      mockGetPublicKey.mockResolvedValue('0x04existing-public-key');

      render(<WalletConnection onWalletConnected={mockOnWalletConnected} />);

      await waitFor(() => {
        expect(mockOnWalletConnected).toHaveBeenCalledWith(
          '0x1234567890123456789012345678901234567890',
          '0x04existing-public-key'
        );
      });
    });
  });

  describe('Public Key Discovery', () => {
    it('discovers public key when setup button is clicked', async () => {
      mockGetPublicKey.mockResolvedValue(null);

      render(<WalletConnection onWalletConnected={mockOnWalletConnected} />);

      // Wait for the component to check for cached key
      await waitFor(() => {
        expect(screen.getByText(/discover your public key/)).toBeInTheDocument();
      });

      const setupButton = screen.getByText('Setup Encryption Key');
      fireEvent.click(setupButton);

      expect(mockDiscoverPublicKey).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        mockSignMessageAsync
      );

      await waitFor(() => {
        expect(mockOnWalletConnected).toHaveBeenCalledWith(
          '0x1234567890123456789012345678901234567890',
          '0x04test-public-key'
        );
      });
    });

    it('shows loading state during key discovery', async () => {
      mockGetPublicKey.mockResolvedValue(null);
      mockDiscoverPublicKey.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('0x04key'), 100)));

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText('Setup Encryption Key')).toBeInTheDocument();
      });

      const setupButton = screen.getByText('Setup Encryption Key');
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByText('Setting up...')).toBeInTheDocument();
      });
    });

    it('handles key discovery errors', async () => {
      mockGetPublicKey.mockResolvedValue(null);
      mockDiscoverPublicKey.mockRejectedValue(new Error('Key discovery failed'));

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText('Setup Encryption Key')).toBeInTheDocument();
      });

      const setupButton = screen.getByText('Setup Encryption Key');
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByText(/Key discovery failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when key discovery fails', async () => {
      mockGetPublicKey.mockResolvedValue(null);
      mockDiscoverPublicKey.mockRejectedValue(new Error('Network error'));

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText('Setup Encryption Key')).toBeInTheDocument();
      });

      const setupButton = screen.getByText('Setup Encryption Key');
      fireEvent.click(setupButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('clears error when trying again', async () => {
      mockGetPublicKey.mockResolvedValue(null);
      mockDiscoverPublicKey
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('0x04success-key');

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText('Setup Encryption Key')).toBeInTheDocument();
      });

      const setupButton = screen.getByText('Setup Encryption Key');
      
      // First attempt - error
      fireEvent.click(setupButton);
      await waitFor(() => {
        expect(screen.getByText(/First error/)).toBeInTheDocument();
      });

      // Second attempt - success
      fireEvent.click(setupButton);
      await waitFor(() => {
        expect(screen.queryByText(/First error/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Encryption Status', () => {
    it('shows encryption ready status when key is available', async () => {
      mockGetPublicKey.mockResolvedValue('0x04cached-key');

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText(/✅ Encryption Ready/)).toBeInTheDocument();
      });
    });

    it('shows public key information when available', async () => {
      mockGetPublicKey.mockResolvedValue('0x04test-public-key-12345678');

      render(<WalletConnection />);

      await waitFor(() => {
        expect(screen.getByText(/0x04test-public-key.../)).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('calls onWalletDisconnected when disconnect is called', () => {
      render(<WalletConnection onWalletDisconnected={mockOnWalletDisconnected} />);

      const disconnectButton = screen.getByText('Disconnect');
      fireEvent.click(disconnectButton);

      expect(mockOnWalletDisconnected).toHaveBeenCalled();
    });

    it('handles missing callback props gracefully', () => {
      expect(() => {
        render(<WalletConnection />);
      }).not.toThrow();
    });
  });
});
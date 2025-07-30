import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { Crypto } from '@peculiar/webcrypto';

// Mock TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Web Crypto API
const crypto = new Crypto();
Object.defineProperty(global, 'crypto', {
  value: crypto,
  writable: false,
});

// Mock window.ethereum for wallet tests
const mockEthereum = {
  isMetaMask: true,
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  selectedAddress: null,
  chainId: '0x1',
};

Object.defineProperty(global.window, 'ethereum', {
  value: mockEthereum,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chain: { id: 1, name: 'Ethereum' },
  }),
  useConnect: () => ({
    connect: jest.fn(),
    connectors: [],
    isPending: false,
  }),
  useDisconnect: () => ({
    disconnect: jest.fn(),
  }),
  useSignMessage: () => ({
    signMessageAsync: jest.fn(),
  }),
  WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
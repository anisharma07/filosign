# FiloSign

FiloSign is a secure, decentralized document encryption and sharing platform that leverages blockchain technology and hybrid cryptographic protocols. The application enables users to securely encrypt, store, and share documents using Ethereum wallet integration and advanced encryption techniques, with support for both mock local storage and Filecoin PDP (Proof of Data Possession) storage backends.

## 🚀 Features

- **🔐 Hybrid Encryption**: Advanced document encryption using public-key cryptography with wallet-based key generation
- **🌐 Web3 Integration**: Seamless MetaMask and Ethereum wallet connectivity using Wagmi
- **📁 Dual Storage Modes**: 
  - Mock mode with local storage for development and testing
  - PDP mode with Filecoin network integration for decentralized storage
- **🎨 Modern UI/UX**: Responsive design with dark/light theme support using Next.js and Tailwind CSS
- **🔒 Secure Key Management**: Deterministic public key generation from wallet signatures
- **📤 Document Sharing**: Send and receive encrypted documents with recipient address verification
- **🧪 Comprehensive Testing**: Full test coverage with Jest and testing utilities
- **⚡ Real-time Updates**: Dynamic document status tracking and encryption progress monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.1.0** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - UI library with modern hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Lucide React** - Modern icon library
- **next-themes** - Theme management system

### Blockchain & Web3  
- **Wagmi** - React hooks for Ethereum wallet integration
- **Ethers.js** - Ethereum blockchain interaction library
- **MetaMask** - Primary wallet connector
- **Filecoin PDP** - Decentralized storage with proof of data possession

### Cryptography & Security
- **Web Crypto API** - Browser-native cryptographic operations
- **Hybrid Encryption Service** - Custom RSA + AES encryption implementation
- **Public Key Service** - Deterministic key generation from wallet signatures

### Development Tools
- **Jest** - JavaScript testing framework
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing
- **class-variance-authority** - Component variant management
- **clsx** - Conditional className utilities

## 📁 Project Structure

```
filosign/
├── aiDocs/                          # AI-generated documentation and plans
│   ├── context/                     # Project context and specifications
│   ├── execution/                   # Implementation summaries
│   ├── plans/                       # Design documents and PRDs
│   └── prompts/                     # Development prompts
├── filosign-app/                    # Main Next.js application
│   ├── src/
│   │   ├── app/                     # Next.js app router pages
│   │   │   ├── page.tsx             # Home page with wallet connection
│   │   │   ├── send/                # Document encryption and sending
│   │   │   ├── receive/             # Document retrieval and decryption
│   │   │   └── setup-key/           # Public key setup workflow
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   ├── providers/           # Context providers (Wagmi, Theme)
│   │   │   └── wallet-connection.tsx # Wallet integration component
│   │   └── lib/
│   │       ├── services/            # Core business logic services
│   │       ├── hooks/               # Custom React hooks
│   │       ├── types/               # TypeScript type definitions
│   │       └── utils.ts             # Utility functions
│   ├── __tests__/                   # Test suites
│   └── public/                      # Static assets
└── src/components/ui/               # Shared UI components
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **MetaMask** browser extension
- **Git** for version control
- **Web3.Storage account** (for PDP mode)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/anisharma07/filosign.git
cd filosign
```

2. **Install root dependencies**
```bash
npm install
```

3. **Navigate to the main application and install dependencies**
```bash
cd filosign-app
npm install
```

4. **Set up environment variables**
```bash
# Create .env.local file in filosign-app directory
cp vercel-env-template.txt .env.local
```

5. **Configure environment variables**
```env
# Storage mode toggle
NEXT_PUBLIC_STORAGE_V2=false  # false for mock mode, true for PDP mode

# Web3.Storage (required for PDP mode)
WEB3_STORAGE_TOKEN=your_web3_storage_token_here
```

## 🎯 Usage

### Development

```bash
# Start development server (from filosign-app directory)
cd filosign-app
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📱 Platform Support

- **Web Browsers**: Chrome, Firefox, Safari, Edge (with MetaMask support)
- **Mobile**: Responsive design for mobile browsers with Web3 wallet apps
- **Desktop**: Full desktop browser support
- **Wallet Compatibility**: MetaMask, WalletConnect-compatible wallets

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Service layer testing for encryption, storage, and PDP contracts
- **Integration Tests**: Component and hook testing with React Testing Library
- **Environment Setup**: Jest configuration with Web Crypto API polyfills
- **Coverage Reports**: Test coverage tracking and reporting

```bash
# Run specific test suites
npm run test -- --testPathPattern="encryption"
npm run test -- --testPathPattern="services"
```

## 🔄 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables in Vercel dashboard**:
   - `NEXT_PUBLIC_STORAGE_V2`
   - `WEB3_STORAGE_TOKEN`
3. **Deploy from main branch**

### Manual Deployment

```bash
# Build production bundle
npm run build

# Export static files (if needed)
npm run export

# Deploy to your hosting provider
```

### Storage Mode Configuration

**Mock Mode** (Development):
```env
NEXT_PUBLIC_STORAGE_V2=false
```
- Uses localStorage for document storage
- No blockchain transactions required
- Ideal for development and testing

**PDP Mode** (Production):
```env
NEXT_PUBLIC_STORAGE_V2=true
WEB3_STORAGE_TOKEN=your_token
```
- Uses Filecoin network with PDP contracts
- Requires wallet transactions for storage deals
- Production-ready decentralized storage

## 📊 Performance & Optimization

- **Next.js App Router**: Optimized routing and server-side rendering
- **Code Splitting**: Automatic code splitting for optimal bundle sizes
- **Image Optimization**: Next.js built-in image optimization
- **Caching Strategy**: Browser and service worker caching
- **Lazy Loading**: Components and routes loaded on demand
- **Bundle Analysis**: Built-in bundle analyzer for optimization insights

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- **TypeScript**: Use proper typing for all new code
- **Testing**: Add tests for new features and bug fixes
- **ESLint**: Follow the established linting rules
- **Component Structure**: Use the established UI component patterns
- **Commit Messages**: Use conventional commit format
- **Documentation**: Update relevant documentation for new features

### Code Style

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** for accessible headless components
- **Wagmi** for excellent Web3 React integration
- **Filecoin** for decentralized storage infrastructure
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support & Contact

- **GitHub Issues**: [Create an issue](https://github.com/anisharma07/filosign/issues)
- **Repository**: [anisharma07/filosign](https://github.com/anisharma07/filosign)
- **Documentation**: See the `aiDocs/` directory for detailed technical documentation

---

**🔒 Security Note**: FiloSign handles sensitive cryptographic operations. Always review the code and use testnet environments before handling valuable data or assets in production.
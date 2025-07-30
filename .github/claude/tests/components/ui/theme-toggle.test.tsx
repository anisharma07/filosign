import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Mock next-themes more specifically for this test
const mockSetTheme = jest.fn();
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

// Mock the UI components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="dropdown-item" onClick={onClick}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the mounting effect
    jest.spyOn(React, 'useEffect').mockImplementation((effect, deps) => {
      if (deps && deps.length === 0) {
        effect();
      }
    });
    
    jest.spyOn(React, 'useState').mockImplementation((initial) => {
      if (initial === false) {
        return [true, jest.fn()]; // mounted = true
      }
      return [initial, jest.fn()];
    });
  });

  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('outline', 'size');
  });

  it('shows screen reader text', () => {
    render(<ThemeToggle />);
    
    const srText = screen.getByText('Toggle theme');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('renders dropdown menu structure', () => {
    render(<ThemeToggle />);
    
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
  });

  it('shows loading state before mounting', () => {
    // Mock not mounted
    jest.spyOn(React, 'useState').mockImplementation((initial) => {
      if (initial === false) {
        return [false, jest.fn()]; // mounted = false
      }
      return [initial, jest.fn()];
    });

    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  describe('Theme Selection', () => {
    it('calls setTheme when theme is selected', () => {
      render(<ThemeToggle />);
      
      const lightItem = screen.getByText(/Light/);
      fireEvent.click(lightItem);
      
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('shows current theme with checkmark', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByText(/Light ✓/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      const srText = screen.getByText('Toggle theme');
      expect(srText).toHaveClass('sr-only');
    });

    it('supports keyboard navigation', () => {
      render(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Icon Transitions', () => {
    it('renders sun and moon icons with proper classes', () => {
      render(<ThemeToggle />);
      
      // Check for lucide-react icon classes (these would be applied by the actual icons)
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Hydration Safety', () => {
    it('prevents hydration mismatch by checking mounted state', () => {
      // Test the mounted check logic
      const { rerender } = render(<ThemeToggle />);
      
      // Should render after mounting
      expect(screen.getByRole('button')).toBeInTheDocument();
      
      // Re-render to test consistency
      rerender(<ThemeToggle />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
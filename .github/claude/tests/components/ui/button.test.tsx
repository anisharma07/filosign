import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  describe('Variants', () => {
    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button', { name: /delete/i });
      
      expect(button).toHaveClass('bg-destructive', 'text-white');
    });

    it('renders success variant', () => {
      render(<Button variant="success">Save</Button>);
      const button = screen.getByRole('button', { name: /save/i });
      
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outlined</Button>);
      const button = screen.getByRole('button', { name: /outlined/i });
      
      expect(button).toHaveClass('border', 'bg-background');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });
      
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: /ghost/i });
      
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button', { name: /link/i });
      
      expect(button).toHaveClass('text-primary', 'underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      
      expect(button).toHaveClass('h-8', 'px-3');
    });

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: /large/i });
      
      expect(button).toHaveClass('h-10', 'px-6');
    });

    it('renders icon size', () => {
      render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('size-9');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
      
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button', { name: /custom/i });
      
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('AsChild Functionality', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      const button = screen.getByRole('button', { name: /keyboard test/i });
      
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyUp(button, { key: 'Enter' });
    });

    it('has proper focus styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button', { name: /focus test/i });
      
      expect(button).toHaveClass('focus-visible:border-ring');
    });
  });
});
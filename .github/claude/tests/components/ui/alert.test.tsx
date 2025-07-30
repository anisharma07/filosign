import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders with default variant', () => {
      render(<Alert data-testid="alert">Test alert</Alert>);
      const alert = screen.getByTestId('alert');
      
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('renders with destructive variant', () => {
      render(<Alert variant="destructive" data-testid="alert">Destructive alert</Alert>);
      const alert = screen.getByTestId('alert');
      
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('applies custom className', () => {
      render(<Alert className="custom-class" data-testid="alert">Custom alert</Alert>);
      const alert = screen.getByTestId('alert');
      
      expect(alert).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Alert ref={ref}>Alert with ref</Alert>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('AlertTitle', () => {
    it('renders alert title with correct styling', () => {
      render(<AlertTitle data-testid="alert-title">Alert Title</AlertTitle>);
      const title = screen.getByTestId('alert-title');
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none', 'tracking-tight');
      expect(title.tagName).toBe('H5');
    });

    it('applies custom className', () => {
      render(<AlertTitle className="custom-title" data-testid="alert-title">Custom Title</AlertTitle>);
      const title = screen.getByTestId('alert-title');
      
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('AlertDescription', () => {
    it('renders alert description with correct styling', () => {
      render(<AlertDescription data-testid="alert-desc">Alert description</AlertDescription>);
      const description = screen.getByTestId('alert-desc');
      
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
    });

    it('applies custom className', () => {
      render(<AlertDescription className="custom-desc" data-testid="alert-desc">Custom Description</AlertDescription>);
      const description = screen.getByTestId('alert-desc');
      
      expect(description).toHaveClass('custom-desc');
    });
  });

  describe('Alert Composition', () => {
    it('renders complete alert with title and description', () => {
      render(
        <Alert variant="destructive" data-testid="complete-alert">
          <AlertTitle data-testid="title">Error Occurred</AlertTitle>
          <AlertDescription data-testid="description">
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('complete-alert');
      const title = screen.getByTestId('title');
      const description = screen.getByTestId('description');

      expect(alert).toBeInTheDocument();
      expect(title).toHaveTextContent('Error Occurred');
      expect(description).toHaveTextContent('Something went wrong. Please try again.');
    });
  });
});
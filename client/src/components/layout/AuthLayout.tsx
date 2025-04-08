import { ReactNode } from 'react';
import { Link } from 'wouter';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * AuthLayout provides a consistent layout for authentication pages
 * with a constrained width container and proper spacing
 * 
 * This version doesn't use Header or Footer to avoid potential routing issues
 */
export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      {/* Simple header with logo only */}
      <header className="py-4 px-4 sm:px-6">
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center">
            <span className="text-xl font-bold">SoZayn</span>
            <span className="text-xs ml-2 text-text-secondary">Digital Era</span>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      {/* Simple footer with minimal links */}
      <footer className="py-6 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} SoZayn Technologies, Inc.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-sm text-text-secondary hover:text-text-primary">Privacy</Link>
              <Link href="/terms" className="text-sm text-text-secondary hover:text-text-primary">Terms</Link>
              <Link href="/support" className="text-sm text-text-secondary hover:text-text-primary">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
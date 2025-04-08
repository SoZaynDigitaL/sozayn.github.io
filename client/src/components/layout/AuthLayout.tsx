import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * AuthLayout provides a consistent layout for authentication pages
 * with a constrained width container and proper spacing
 */
export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
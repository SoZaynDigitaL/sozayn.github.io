import { useState, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location === path;

  const scrollToSection = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Update URL without page reload
      window.history.pushState(null, '', `/#${id}`);
    }
  }, []);
  
  return (
    <header className="relative py-6 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              SoZayn
              <span className="block text-xs text-text-secondary mt-[-4px]">Welcome To Digital Era</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/#features" onClick={scrollToSection('features')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition">Features</a>
            <a href="/#pricing" onClick={scrollToSection('pricing')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition">Pricing</a>
            <a href="/#integrations" onClick={scrollToSection('integrations')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition">Integrations</a>
            {user && <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-medium transition">My Dashboard</Link>}
          </nav>
          
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/auth?tab=login" className="hidden sm:inline-flex">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link href="/auth?tab=register">
                  <Button variant="default" size="sm" className="bg-accent-blue text-white shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 hover:translate-y-[-2px] transition">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logout()}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Logout
                </Button>
              </>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-bg-card border-border-color">
                <div className="flex flex-col space-y-4 mt-8">
                  <a href="/#features" onClick={scrollToSection('features')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition px-2 py-2">
                    Features
                  </a>
                  <a href="/#pricing" onClick={scrollToSection('pricing')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition px-2 py-2">
                    Pricing
                  </a>
                  <a href="/#integrations" onClick={scrollToSection('integrations')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition px-2 py-2">
                    Integrations
                  </a>
                  
                  {!user ? (
                    <>
                      <Link href="/auth?tab=login" className="w-full">
                        <Button variant="outline" className="w-full">Log in</Button>
                      </Link>
                      <Link href="/auth?tab=register" className="w-full">
                        <Button variant="default" className="w-full bg-accent-blue">Get Started</Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard" className="w-full">
                        <Button variant="outline" className="w-full">Dashboard</Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        onClick={() => logout()}
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link } from 'wouter';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  // Function to handle clicks on links for pages that don't exist yet
  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 border-b border-border-color pb-12">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-4 inline-block">
              SoZayn
              <span className="block text-xs text-text-secondary mt-[-4px]">Welcome To Digital Era</span>
            </Link>
            <p className="text-text-secondary text-sm mt-4 mb-6">
              Streamlining restaurant operations with innovative technology solutions.
            </p>
            <div className="flex space-x-4">
              <button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary bg-transparent border-0 p-0 cursor-pointer">
                <Twitter className="h-5 w-5" />
              </button>
              <button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary bg-transparent border-0 p-0 cursor-pointer">
                <Linkedin className="h-5 w-5" />
              </button>
              <button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary bg-transparent border-0 p-0 cursor-pointer">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-text-secondary hover:text-text-primary text-sm">About Us</Link></li>
              {/* Use button elements styled as links for pages that don't exist yet */}
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Careers</button></li>
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Blog</button></li>
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Press</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              {/* Use button elements styled as links for pages that don't exist yet */}
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Documentation</button></li>
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Tutorials</button></li>
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Case Studies</button></li>
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">FAQ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="mailto:info@sozayn.com" className="text-text-secondary hover:text-text-primary text-sm">info@sozayn.com</a></li>
              <li><Link href="/support" className="text-text-secondary hover:text-text-primary text-sm">Support</Link></li>
              {/* Use button elements styled as links for pages that don't exist yet */}
              <li><button onClick={handlePlaceholderClick} className="text-text-secondary hover:text-text-primary text-sm bg-transparent border-0 p-0 cursor-pointer">Sales</button></li>
              <li><a href="tel:1-800-SOZAYN" className="text-text-secondary hover:text-text-primary text-sm">1-800-SOZAYN</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} SoZayn Technologies, Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-text-secondary hover:text-text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-text-secondary hover:text-text-primary">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-text-secondary hover:text-text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

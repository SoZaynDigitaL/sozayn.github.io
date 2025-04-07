import { Link } from 'wouter';
import { Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 border-b border-border-color pb-12">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-4 inline-block">
              SoZayn
              <span className="block text-xs text-text-secondary mt-[-4px]">Custom API Gateway</span>
            </Link>
            <p className="text-text-secondary text-sm mt-4 mb-6">
              Streamlining restaurant operations with innovative technology solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">About Us</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Careers</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Blog</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Documentation</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Tutorials</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Case Studies</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">info@sozayn.com</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Support</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">Sales</a></li>
              <li><a href="#" className="text-text-secondary hover:text-text-primary text-sm">1-800-SOZAYN</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} SoZayn Technologies, Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Privacy Policy</a>
            <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Terms of Service</a>
            <a href="#" className="text-sm text-text-secondary hover:text-text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

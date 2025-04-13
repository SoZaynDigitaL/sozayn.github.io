import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import DeliveryFeatures from '@/components/marketing/DeliveryFeatures';
import { Truck, ArrowLeft } from 'lucide-react';

export default function DeliveryFeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SoZayn Delivery</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-foreground/80 hover:text-primary transition">
              Home
            </Link>
            <a href="#features" className="text-sm text-foreground/80 hover:text-primary transition">
              Features
            </a>
            <a href="#partners" className="text-sm text-foreground/80 hover:text-primary transition">
              Partners
            </a>
            <a href="#pricing" className="text-sm text-foreground/80 hover:text-primary transition">
              Pricing
            </a>
          </nav>
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-primary/5 border-b border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Streamline Your Restaurant Deliveries
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mb-8">
              SoZayn's delivery management platform connects your restaurant to the world's leading delivery providers - UberDirect and JetGo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                <span>Try It Free</span>
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <span>Schedule a Demo</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features">
        <DeliveryFeatures />
      </section>

      {/* Partner Logos */}
      <section id="partners" className="py-16 px-4 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted By Leading Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="h-16 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-medium">
              Partner 1
            </div>
            <div className="h-16 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-medium">
              Partner 2
            </div>
            <div className="h-16 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-medium">
              Partner 3
            </div>
            <div className="h-16 w-32 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-medium">
              Partner 4
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for your restaurant's delivery needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pricing Tier 1 */}
            <div className="border rounded-xl overflow-hidden">
              <div className="p-6 bg-muted/30">
                <h3 className="text-xl font-bold">Starter</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Perfect for small restaurants just getting started with delivery
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Single delivery partner integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Basic delivery tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Up to 100 deliveries/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </div>
            </div>

            {/* Pricing Tier 2 */}
            <div className="border rounded-xl overflow-hidden shadow-md relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                POPULAR
              </div>
              <div className="p-6 bg-primary/10">
                <h3 className="text-xl font-bold">Professional</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  For growing restaurants with expanding delivery needs
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Both UberDirect and JetGo integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Advanced live delivery tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Up to 500 deliveries/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Priority email & chat support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </div>
            </div>

            {/* Pricing Tier 3 */}
            <div className="border rounded-xl overflow-hidden">
              <div className="p-6 bg-muted/30">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  For restaurant chains and high-volume delivery operations
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>All delivery integrations + custom options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Advanced delivery routing & optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Unlimited deliveries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Custom reporting & API access</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5 border-t border-border/40">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Turkish Kebab Grill House and hundreds of other restaurants transforming their delivery operations with SoZayn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Start Your Free Trial</Button>
            <Button size="lg" variant="outline">Schedule a Demo</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">SoZayn Delivery</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                The ultimate restaurant delivery management platform. Connect with the world's leading delivery providers and streamline your operations.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-medium mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Features</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Integrations</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Case Studies</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Documentation</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">API Reference</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Legal</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} SoZayn, Inc. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Check icon component
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Social media icons
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
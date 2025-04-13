import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Truck, Rocket, BoxIcon, ShieldCheck, MessageSquare, Zap } from 'lucide-react';

export default function GitHubLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SoZayn</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-foreground/80 hover:text-primary transition">Features</a>
            <a href="#delivery-partners" className="text-sm text-foreground/80 hover:text-primary transition">Delivery Partners</a>
            <a href="#contact" className="text-sm text-foreground/80 hover:text-primary transition">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Welcome to Digital Era
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mb-8">
                The complete digital platform for restaurants and groceries. Streamline your operations and grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2">
                  <Truck className="h-5 w-5" />
                  <span>Schedule Demo</span>
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Contact Sales</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in the digital world
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Delivery Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Seamlessly integrate with leading delivery partners including UberDirect and JetGo.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BoxIcon className="h-5 w-5 text-primary" />
                    <span>POS Order Injection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Automatically inject orders from online platforms directly into your POS system.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Secure API Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Enterprise-grade security for all API connections with tokenized authentication.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Delivery Partners */}
        <section id="delivery-partners" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Delivery Partners</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've partnered with the best delivery services to ensure your customers get their orders fast
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-blue-500/20 shadow-md">
                <CardHeader className="bg-blue-500/5">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    <span>UberDirect</span>
                  </CardTitle>
                  <CardDescription>
                    On-demand delivery solution
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Real-time delivery tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Automated dispatch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Customer notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Proof of delivery</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Configure UberDirect</Button>
                </CardFooter>
              </Card>

              <Card className="border-purple-500/20 shadow-md">
                <CardHeader className="bg-purple-500/5">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-purple-500" />
                    <span>JetGo</span>
                  </CardTitle>
                  <CardDescription>
                    Fast & reliable delivery service
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Optimized route planning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Scheduled deliveries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Delivery status webhooks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <span>Performance analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Configure JetGo</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join the digital revolution for your restaurant business today. Our team is ready to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <span>Start Free Trial</span>
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <span>Book a Demo</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/50 border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">SoZayn</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The complete digital platform for restaurants and groceries.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Delivery Integration</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">POS Order Injection</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Loyalty & Rewards</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Marketing Automation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Cookie Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SoZayn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// CheckIcon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
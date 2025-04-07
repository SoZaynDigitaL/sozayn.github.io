import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />
      
      <main className="flex-1">
        <div className="relative py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About SoZayn</h1>
              <p className="text-xl text-text-secondary">
                Transforming restaurant and grocery management with innovative technology solutions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-text-secondary mb-6">
                  SoZayn is on a mission to empower food businesses with the digital tools they need 
                  to thrive in today's competitive marketplace. We believe technology should simplify 
                  operations, not complicate them.
                </p>
                <p className="text-lg text-text-secondary">
                  By providing a comprehensive platform that unifies online ordering, delivery integration, 
                  point-of-sale systems, and marketing capabilities, we help restaurants and grocery stores 
                  create seamless digital experiences for their customers.
                </p>
              </div>
              <div className="bg-bg-card border border-border-color rounded-lg p-8">
                <div className="aspect-video bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded flex items-center justify-center">
                  <span className="text-6xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                    SoZayn
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-24">
              <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-bg-card border border-border-color rounded-lg p-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-accent-blue">1</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Innovation</h3>
                  <p className="text-text-secondary">
                    We constantly push the boundaries of what's possible in restaurant technology,
                    delivering cutting-edge solutions that drive business growth.
                  </p>
                </div>
                
                <div className="bg-bg-card border border-border-color rounded-lg p-6">
                  <div className="w-12 h-12 bg-accent-purple/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-accent-purple">2</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Simplicity</h3>
                  <p className="text-text-secondary">
                    We believe powerful tools should be easy to use. Our platform simplifies complex 
                    operations into intuitive workflows anyone can manage.
                  </p>
                </div>
                
                <div className="bg-bg-card border border-border-color rounded-lg p-6">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-accent-green">3</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Partnership</h3>
                  <p className="text-text-secondary">
                    We're more than a vendor—we're your technology partner. Your success is our success,
                    and we're committed to helping you grow.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Join the Digital Revolution</h2>
              <p className="text-lg text-text-secondary mb-8">
                Ready to transform your restaurant or grocery business with innovative technology?
                SoZayn provides the tools you need to succeed in the digital era.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <a className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-accent-blue hover:bg-accent-blue/90 text-white font-medium">
                    Get Started
                  </a>
                </Link>
                <Link href="/contact">
                  <a className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-border-color hover:bg-bg-card font-medium">
                    Contact Sales
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
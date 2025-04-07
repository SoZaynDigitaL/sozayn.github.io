import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] py-16 md:py-24 flex items-center z-1">
      {/* Background elements */}
      <div className="bg-grid"></div>
      <div className="hero-glow"></div>
      
      {/* Delivery animation paths */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="delivery-path absolute top-[20%] w-full"></div>
        <div className="delivery-path absolute top-[60%] w-full" style={{ animationDelay: '-4s' }}></div>
        <div className="delivery-path absolute top-[85%] w-full" style={{ animationDelay: '-2s' }}></div>
        
        <div className="delivery-node absolute top-[calc(20%-3px)]" style={{ animationDelay: '-1s' }}></div>
        <div className="delivery-node absolute top-[calc(60%-3px)]" style={{ animationDelay: '-3s' }}></div>
        <div className="delivery-node absolute top-[calc(85%-3px)]" style={{ animationDelay: '-6s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute top-[-50px] left-[-15px] w-[5px] h-[120px] bg-gradient-to-b from-accent-blue to-transparent rounded-md"></div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                e-commerce Restuarants Grocery Retailer
              </h1>
              <p className="text-text-secondary text-lg md:text-xl mb-8 max-w-[500px]">
                Connect all your delivery services, POS systems, and online ordering platforms through one powerful API gateway.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#demo">
                  <Button className="px-6 py-6 text-base bg-accent-blue text-white shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 hover:translate-y-[-2px] transition glow-button-blue">
                    Book a Demo
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" className="px-6 py-6 text-base border-border-color text-text-primary hover:border-text-secondary transition flex items-center gap-2 glow-border-blue">
                    How It Works
                    <Play className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12">
                <p className="text-sm text-text-secondary mb-8">Trusted by</p>
                <div className="flex flex-wrap items-center gap-8 opacity-70">
                  <span className="font-semibold text-text-primary">Turkish Kebab</span>
                  <span className="font-semibold text-text-primary">Halal Bite</span>
                  <span className="font-semibold text-text-primary">Pizza Co</span>
                  <span className="font-semibold text-text-primary">Burger Hub</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative float-animation">
            {/* Dashboard Preview Card */}
            <div className="dashboard-card max-w-[450px] mx-auto">
              <div className="card-glow"></div>
              
              {/* Order Tracking Section */}
              <div className="mb-6">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Order Status</h3>
                
                <div className="relative mb-6">
                  <div className="absolute top-3 left-[10%] right-[10%] h-0.5 bg-border-color z-[1]"></div>
                  <div className="absolute top-3 left-[10%] w-[75%] h-0.5 bg-accent-blue z-[2]"></div>
                  
                  <div className="flex justify-between relative z-[3]">
                    <div className="flex flex-col items-center w-[20%]">
                      <div className="status-step-icon completed">
                        <span className="text-white">✓</span>
                      </div>
                      <span className="text-xs text-center text-text-primary font-medium">Received</span>
                    </div>
                    
                    <div className="flex flex-col items-center w-[20%]">
                      <div className="status-step-icon completed">
                        <span className="text-white">✓</span>
                      </div>
                      <span className="text-xs text-center text-text-primary font-medium">Prepared</span>
                    </div>
                    
                    <div className="flex flex-col items-center w-[20%]">
                      <div className="status-step-icon completed">
                        <span className="text-white">✓</span>
                      </div>
                      <span className="text-xs text-center text-text-primary font-medium">Picked Up</span>
                    </div>
                    
                    <div className="flex flex-col items-center w-[20%]">
                      <div className="status-step-icon active">
                        <span className="text-accent-blue">4</span>
                      </div>
                      <span className="text-xs text-center text-text-primary font-medium">In Transit</span>
                    </div>
                    
                    <div className="flex flex-col items-center w-[20%]">
                      <div className="status-step-icon">
                      </div>
                      <span className="text-xs text-center text-text-secondary">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Orders Summary */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-bg-chart rounded-lg p-3 border border-border-color/50">
                  <p className="text-xs text-text-secondary mb-1">Today's Orders</p>
                  <p className="text-xl font-bold">156</p>
                  <p className="text-xs text-accent-green flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +12.5%
                  </p>
                </div>
                
                <div className="bg-bg-chart rounded-lg p-3 border border-border-color/50">
                  <p className="text-xs text-text-secondary mb-1">Revenue</p>
                  <p className="text-xl font-bold">$3,240</p>
                  <p className="text-xs text-accent-green flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    +8.3%
                  </p>
                </div>
              </div>
              
              {/* Active Orders */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">Active Orders</h3>
                  <a href="#" className="text-xs text-accent-blue">View All</a>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-bg-chart/50 rounded-lg p-3 border border-border-color/30 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-orange/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-orange" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order #2458</p>
                          <p className="text-xs text-text-secondary">2 items • $32.50</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-accent-orange/20 text-accent-orange text-xs px-2 py-1 rounded">DoorDash</span>
                    </div>
                  </div>
                  
                  <div className="bg-bg-chart/50 rounded-lg p-3 border border-border-color/30 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-blue" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order #2457</p>
                          <p className="text-xs text-text-secondary">4 items • $56.75</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-accent-blue/20 text-accent-blue text-xs px-2 py-1 rounded">UberEats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

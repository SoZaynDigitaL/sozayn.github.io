import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Play, 
  Pause, 
  ChevronRight,
  Store,
  ShoppingBag,
  Truck,
  BarChart3,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export default function DemoSection() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const demoContainerRef = useRef<HTMLDivElement>(null);

  // Demo steps with timing (in milliseconds)
  const demoSteps = [
    { id: 0, duration: 2000, title: "Restaurant Order Received", icon: Store },
    { id: 1, duration: 2000, title: "Automatic POS Integration", icon: ShoppingBag },
    { id: 2, duration: 2000, title: "Delivery Service Assignment", icon: Truck },
    { id: 3, duration: 2000, title: "Real-time Analytics", icon: BarChart3 },
    { id: 4, duration: 2000, title: "Automated Customer Follow-up", icon: MessageSquare },
    { id: 5, duration: 1000, title: "Seamless Process Completed", icon: CheckCircle2 },
  ];

  // Total duration of the demo
  const totalDuration = demoSteps.reduce((acc, step) => acc + step.duration, 0);

  // Start/stop the demo animation
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset demo to beginning
  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Animation loop for the demo
  const animate = (timestamp: number) => {
    if (!lastUpdateRef.current) {
      lastUpdateRef.current = timestamp;
    }

    const elapsed = timestamp - lastUpdateRef.current;
    
    // Calculate which step we should be at based on elapsed time
    let totalElapsedTime = 0;
    let targetStep = 0;
    
    for (let i = 0; i < demoSteps.length; i++) {
      totalElapsedTime += demoSteps[i].duration;
      if (elapsed < totalElapsedTime) {
        targetStep = i;
        break;
      }
      if (i === demoSteps.length - 1) {
        // We've reached the end
        setIsPlaying(false);
        setCurrentStep(demoSteps.length - 1);
        return;
      }
    }
    
    if (targetStep !== currentStep) {
      setCurrentStep(targetStep);
    }
    
    if (elapsed >= totalDuration) {
      // Animation complete
      setIsPlaying(false);
      return;
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle starting and stopping the animation
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (currentStep === 0 && !isPlaying) return 0;
    
    // Calculate completed steps duration
    let completedDuration = 0;
    for (let i = 0; i < currentStep; i++) {
      completedDuration += demoSteps[i].duration;
    }
    
    return (completedDuration / totalDuration) * 100;
  };

  return (
    <section id="demo" className="py-16 bg-bg-dark relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See <span className="text-accent-blue">SoZayn</span> in Action
          </h2>
          <p className="text-text-secondary text-base max-w-2xl mx-auto">
            Watch how our platform seamlessly integrates online ordering, POS systems, 
            and delivery services in one powerful command center.
          </p>
        </div>
        
        <div 
          ref={demoContainerRef}
          className="max-w-3xl mx-auto bg-[#111827] rounded-xl border border-border-color shadow-xl overflow-hidden"
        >
          {/* Progress indicators */}
          <div className="px-6 pt-6 pb-0">
            <div className="flex justify-between items-center relative">
              {/* Progress bar */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border-color -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-accent-blue -translate-y-1/2 transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
              
              {/* Step indicators */}
              {demoSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index <= currentStep;
                const isCurrentStep = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center z-10">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-accent-blue' 
                          : 'bg-bg-card border border-border-color'
                      }`}
                    >
                      <StepIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                    </div>
                    <span className={`mt-2 text-xs font-medium max-w-[70px] text-center transition-all ${
                      isCurrentStep ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Demo content area */}
          <div className="mt-8 mx-6 mb-3 rounded-lg p-6 bg-bg-dark border border-border-color h-[250px] flex items-center justify-center">
            <div className="text-center">
              {currentStep === 0 && (
                <div className="demo-step demo-step-1 fade-in-out">
                  <Store className="w-12 h-12 text-accent-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Restaurant Order Received</h3>
                  <p className="text-text-secondary text-sm">
                    Customer places an order through your website or third-party platforms
                  </p>
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="demo-step demo-step-2 fade-in-out">
                  <ShoppingBag className="w-12 h-12 text-accent-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Automatic POS Integration</h3>
                  <p className="text-text-secondary text-sm">
                    Order is instantly pushed to your restaurant's POS system
                  </p>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="demo-step demo-step-3 fade-in-out">
                  <Truck className="w-12 h-12 text-accent-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Delivery Service Assignment</h3>
                  <p className="text-text-secondary text-sm">
                    Order automatically assigned to optimal delivery service
                  </p>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="demo-step demo-step-4 fade-in-out">
                  <BarChart3 className="w-12 h-12 text-accent-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Real-time Analytics</h3>
                  <p className="text-text-secondary text-sm">
                    Track performance metrics and customer engagement in real-time
                  </p>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="demo-step demo-step-5 fade-in-out">
                  <MessageSquare className="w-12 h-12 text-accent-blue mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Automated Customer Follow-up</h3>
                  <p className="text-text-secondary text-sm">
                    Sending personalized messages and collecting feedback
                  </p>
                </div>
              )}
              
              {currentStep === 5 && (
                <div className="demo-step demo-step-6 fade-in-out">
                  <CheckCircle2 className="w-12 h-12 text-accent-green mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Seamless Process Completed</h3>
                  <p className="text-text-secondary text-sm">
                    Entire order-to-delivery workflow managed automatically
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="px-6 py-3 bg-[#0d131f] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                onClick={togglePlayback} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-bg-card"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <span className="text-xs text-text-secondary">
                Step {currentStep + 1} of {demoSteps.length}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={resetDemo} className="text-xs">
              Restart Demo
            </Button>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-text-secondary mb-4 text-sm">
            Ready to transform your restaurant or grocery business?
          </p>
          <Link href="/auth?tab=register">
            <Button className="px-6 py-2 bg-accent-blue hover:bg-accent-blue/90 glow-button-blue">
              Schedule Your Demo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
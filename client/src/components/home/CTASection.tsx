import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function CTASection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-accent-blue/5 z-0"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-1">
        <div className="bg-bg-card border border-border-color rounded-3xl p-8 md:p-12 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue opacity-5 blur-[100px] rounded-full z-0"></div>
          
          <div className="relative z-1 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your Restaurant Operations?</h2>
            <p className="text-text-secondary text-lg md:text-xl mb-8">
              Join hundreds of restaurants that are already saving time and increasing sales with SoZayn's API gateway.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#demo">
                <Button size="lg" className="text-base bg-accent-blue text-white shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 hover:translate-y-[-2px] transition">
                  Schedule a Demo
                </Button>
              </Link>
              <Link href="#contact">
                <Button size="lg" variant="outline" className="text-base border-border-color text-text-primary hover:border-text-secondary transition">
                  Contact Sales
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-accent-blue/20 border-2 border-bg-card flex items-center justify-center text-xs font-bold">JD</div>
                <div className="w-10 h-10 rounded-full bg-accent-green/20 border-2 border-bg-card flex items-center justify-center text-xs font-bold">MC</div>
                <div className="w-10 h-10 rounded-full bg-accent-orange/20 border-2 border-bg-card flex items-center justify-center text-xs font-bold">KL</div>
                <div className="w-10 h-10 rounded-full bg-accent-purple/20 border-2 border-bg-card flex items-center justify-center text-xs font-bold">+5</div>
              </div>
              <div className="text-sm text-text-secondary">
                Joined by <span className="text-text-primary font-medium">120+ restaurants</span> this month
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

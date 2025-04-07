import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type IntegrationCardProps = {
  name: string;
  letter: string;
  colorClass?: string;
};

const IntegrationCard = ({ name, letter, colorClass = "text-text-primary" }: IntegrationCardProps) => (
  <div className="bg-bg-dark/50 border border-border-color rounded-xl p-4 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-2">
        <span className={`${colorClass} font-bold`}>{letter}</span>
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  </div>
);

export default function Integrations() {
  const deliveryPartners = [
    { name: "DoorDash", letter: "DD", colorClass: "text-accent-orange" },
    { name: "UberEats", letter: "UE", colorClass: "text-accent-blue" },
    { name: "Grubhub", letter: "GH", colorClass: "text-accent-green" },
    { name: "Postmates", letter: "PM", colorClass: "text-text-primary" },
    { name: "SkipDishes", letter: "SD", colorClass: "text-accent-yellow" },
    { name: "More", letter: "+", colorClass: "text-accent-purple" }
  ];
  
  const posSystems = [
    { name: "Toast", letter: "TS", colorClass: "text-accent-blue" },
    { name: "Square POS", letter: "SP", colorClass: "text-accent-green" },
    { name: "Clover", letter: "CT", colorClass: "text-accent-orange" },
    { name: "Lightspeed", letter: "LV", colorClass: "text-text-primary" },
    { name: "TouchBistro", letter: "TC", colorClass: "text-accent-purple" },
    { name: "More", letter: "+", colorClass: "text-accent-yellow" }
  ];

  return (
    <section id="integrations" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Seamless Integrations</h2>
          <p className="text-text-secondary text-xl max-w-3xl mx-auto">
            Connect with all major delivery platforms and POS systems without any technical headaches.
          </p>
        </div>
        
        <div className="bg-bg-card border border-border-color rounded-2xl p-8 shadow-card mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              <h3 className="text-2xl font-bold mb-4">Delivery Partners</h3>
              <p className="text-text-secondary mb-6">
                Connect with all major delivery services through one unified API. No more managing multiple tablets.
              </p>
              
              <Button variant="link" className="text-accent-blue flex items-center group p-0">
                Learn more about our integrations
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
              {deliveryPartners.map((partner) => (
                <IntegrationCard 
                  key={partner.name} 
                  name={partner.name} 
                  letter={partner.letter} 
                  colorClass={partner.colorClass} 
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-bg-card border border-border-color rounded-2xl p-8 shadow-card">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              <h3 className="text-2xl font-bold mb-4">POS Systems</h3>
              <p className="text-text-secondary mb-6">
                Integrate with your existing point-of-sale system to keep everything synchronized automatically.
              </p>
              
              <Button variant="link" className="text-accent-blue flex items-center group p-0">
                View all compatible POS systems
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
              {posSystems.map((system) => (
                <IntegrationCard 
                  key={system.name} 
                  name={system.name} 
                  letter={system.letter}
                  colorClass={system.colorClass}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

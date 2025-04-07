import { Button } from '@/components/ui/button';
import { ChevronRight, Plus } from 'lucide-react';
import { 
  SiDoordash, SiUbereats, SiGrubhub, SiPostmates, SiSquare, 
  SiShopify, SiBigcommerce, SiWix, SiAmazon, SiWoocommerce, SiMagento 
} from "react-icons/si";
import { FaUtensils, FaCcStripe } from "react-icons/fa";
import { MdRestaurant, MdLocalShipping, MdPointOfSale } from "react-icons/md";
import { BsLightningCharge } from "react-icons/bs";

type IntegrationCardProps = {
  name: string;
  icon: React.ReactNode;
  colorClass?: string;
};

const IntegrationCard = ({ name, icon, colorClass = "text-text-primary" }: IntegrationCardProps) => (
  <div className="bg-bg-dark/50 border border-border-color rounded-xl p-4 flex items-center justify-center glow-effect">
    <div className="text-center">
      <div className="w-12 h-12 bg-white/10 rounded-full mx-auto flex items-center justify-center mb-2 shadow-glow-blue-sm">
        <span className={`${colorClass} text-2xl glow-text`}>{icon}</span>
      </div>
      <p className="text-sm font-medium">{name}</p>
    </div>
  </div>
);

export default function Integrations() {
  const deliveryPartners = [
    { name: "DoorDash", icon: <SiDoordash />, colorClass: "text-accent-orange" },
    { name: "UberEats", icon: <SiUbereats />, colorClass: "text-accent-blue" },
    { name: "Grubhub", icon: <SiGrubhub />, colorClass: "text-accent-green" },
    { name: "Postmates", icon: <SiPostmates />, colorClass: "text-text-primary" },
    { name: "SkipDishes", icon: <MdLocalShipping />, colorClass: "text-accent-yellow" },
    { name: "More", icon: <Plus className="h-5 w-5" />, colorClass: "text-accent-purple" }
  ];
  
  const posSystems = [
    { name: "Toast", icon: <FaUtensils />, colorClass: "text-accent-blue" },
    { name: "Square POS", icon: <SiSquare />, colorClass: "text-accent-green" },
    { name: "Clover", icon: <MdPointOfSale />, colorClass: "text-accent-orange" },
    { name: "Lightspeed", icon: <BsLightningCharge />, colorClass: "text-text-primary" },
    { name: "TouchBistro", icon: <MdRestaurant />, colorClass: "text-accent-purple" },
    { name: "More", icon: <Plus className="h-5 w-5" />, colorClass: "text-accent-yellow" }
  ];
  
  const ecommercePartners = [
    { name: "Shopify", icon: <SiShopify />, colorClass: "text-accent-green" },
    { name: "BigCommerce", icon: <SiBigcommerce />, colorClass: "text-accent-blue" },
    { name: "Wix", icon: <SiWix />, colorClass: "text-text-primary" },
    { name: "Amazon", icon: <SiAmazon />, colorClass: "text-accent-orange" },
    { name: "WooCommerce", icon: <SiWoocommerce />, colorClass: "text-accent-purple" },
    { name: "Magento", icon: <SiMagento />, colorClass: "text-accent-yellow" }
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
                  icon={partner.icon} 
                  colorClass={partner.colorClass} 
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-bg-card border border-border-color rounded-2xl p-8 shadow-card mb-12">
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
                  icon={system.icon}
                  colorClass={system.colorClass}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-bg-card border border-border-color rounded-2xl p-8 shadow-card">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/3">
              <h3 className="text-2xl font-bold mb-4">E-Commerce</h3>
              <p className="text-text-secondary mb-6">
                Easily connect your existing online store or marketplace to expand your digital presence.
              </p>
              
              <Button variant="link" className="text-accent-blue flex items-center group p-0">
                Explore e-commerce options
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
              {ecommercePartners.map((partner) => (
                <IntegrationCard 
                  key={partner.name} 
                  name={partner.name} 
                  icon={partner.icon}
                  colorClass={partner.colorClass}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

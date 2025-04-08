import { 
  BarChart2, 
  Settings, 
  Layers, 
  DollarSign, 
  Megaphone, 
  ExternalLink 
} from 'lucide-react';

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const Feature = ({ icon, title, description }: FeatureProps) => (
  <div className="bg-bg-card border border-border-color rounded-xl p-6 shadow-card card-hover-effect transition-all duration-300">
    <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-text-secondary">
      {description}
    </p>
  </div>
);

export default function Features() {
  const features = [
    {
      icon: <BarChart2 className="h-6 w-6 text-accent-blue" />,
      title: "Digital Command Center",
      description: "Get a real-time overview of all your restaurant operations in one intuitive digital command center."
    },
    {
      icon: <Settings className="h-6 w-6 text-accent-purple" />,
      title: "Online Ordering System",
      description: "Custom API integration that connects your website directly to your kitchen."
    },
    {
      icon: <Layers className="h-6 w-6 text-accent-green" />,
      title: "POS Order Injection",
      description: "Automatically route all orders into your existing POS system without any manual entry."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-accent-yellow" />,
      title: "Loyalty & Rewards",
      description: "Build customer loyalty with a customizable rewards program that keeps them coming back."
    },
    {
      icon: <Megaphone className="h-6 w-6 text-accent-orange" />,
      title: "SEO & Marketing",
      description: "Automated marketing tools to help your restaurant rank higher and attract more customers."
    },
    {
      icon: <ExternalLink className="h-6 w-6 text-accent-blue" />,
      title: "Third-Party Delivery",
      description: "Pre-built integrations with UberDirect, DoorDash Drive, Grubhub, and more."
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">One Digital Hub, Multiple Solutions</h2>
          <p className="text-text-secondary text-xl max-w-3xl mx-auto">
            SoZayn connects all your restaurant services through a powerful digital platform for the modern era.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

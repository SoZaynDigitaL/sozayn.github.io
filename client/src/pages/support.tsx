import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MessageSquareText, Phone, Mail, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Center</h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              We're here to help you succeed with SoZayn. Find answers to your questions or reach out to our support team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-bg-card border border-border-color">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MessageSquareText className="w-8 h-8 text-accent-blue mr-4" />
                  <h3 className="text-xl font-semibold">Live Chat</h3>
                </div>
                <p className="text-text-secondary mb-4">
                  Chat with our support team in real-time for immediate assistance.
                </p>
                <Button className="w-full bg-bg-dark hover:bg-accent-blue">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-bg-card border border-border-color">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Phone className="w-8 h-8 text-accent-green mr-4" />
                  <h3 className="text-xl font-semibold">Phone Support</h3>
                </div>
                <p className="text-text-secondary mb-4">
                  Call us directly for personalized assistance with complex issues.
                </p>
                <Button className="w-full bg-bg-dark hover:bg-accent-green">
                  +1 (888) 555-0123
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-bg-card border border-border-color">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-8 h-8 text-accent-purple mr-4" />
                  <h3 className="text-xl font-semibold">Email Support</h3>
                </div>
                <p className="text-text-secondary mb-4">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <Button className="w-full bg-bg-dark hover:bg-accent-purple">
                  support@sozayn.com
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-bg-card border border-border-color rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg">
                  How do I connect my restaurant's POS system?
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  SoZayn integrates with all major POS systems including Toast, Clover, Square, and Lightspeed. 
                  Navigate to Dashboard → POS Integration and follow the guided setup process. Our support team 
                  can assist with custom integrations if needed.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg">
                  How do I set up online ordering?
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  Go to Dashboard → Orders and click "Set Up Online Ordering." You can upload your menu, set prices, 
                  customize ordering options, and connect payment processors. Once configured, you'll receive a direct 
                  ordering link and embed code for your website.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg">
                  How do I integrate with third-party delivery services?
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  Navigate to Dashboard → Delivery Partners and select the services you want to connect (UberEats, 
                  DoorDash, Grubhub, etc.). Enter your restaurant ID for each service and set your preferences for 
                  order handling. Orders will automatically sync with your SoZayn dashboard.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg">
                  How do I upgrade my subscription plan?
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  Go to Dashboard → Settings → Subscription and click "Upgrade Plan." Select your preferred plan and 
                  payment method. Your account will be upgraded immediately, and you'll have access to all new features.
                  You can switch between monthly and annual billing at any time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg">
                  How do I set up automated marketing campaigns?
                </AccordionTrigger>
                <AccordionContent className="text-text-secondary">
                  Navigate to Dashboard → Marketing → Automated and click "Create Campaign." Choose a campaign type 
                  (welcome series, abandoned cart, loyalty rewards, etc.), customize the messaging, and set trigger 
                  conditions. SoZayn will automatically send emails or SMS based on customer behavior.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-1 text-accent-blue" />
                  <div>
                    <h3 className="font-medium">Customer Support</h3>
                    <p className="text-text-secondary">Monday - Friday: 8am - 8pm EST</p>
                    <p className="text-text-secondary">Saturday: 9am - 5pm EST</p>
                    <p className="text-text-secondary">Sunday: Closed</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-1 text-accent-blue" />
                  <div>
                    <h3 className="font-medium">Technical Support</h3>
                    <p className="text-text-secondary">24/7 for Pro & Growth plans</p>
                    <p className="text-text-secondary">Monday - Friday: 9am - 6pm EST for Free plan</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1 text-accent-blue" />
                  <div>
                    <h3 className="font-medium">Headquarters</h3>
                    <p className="text-text-secondary">123 Tech Plaza, Suite 500</p>
                    <p className="text-text-secondary">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-bg-card to-bg-dark border border-border-color rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded bg-bg-dark border border-border-color focus:border-accent-blue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 rounded bg-bg-dark border border-border-color focus:border-accent-blue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input 
                    type="text" 
                    className="w-full p-2 rounded bg-bg-dark border border-border-color focus:border-accent-blue focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full p-2 rounded bg-bg-dark border border-border-color focus:border-accent-blue focus:outline-none"
                  ></textarea>
                </div>
                
                <Button className="w-full bg-accent-blue hover:bg-accent-blue/90">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
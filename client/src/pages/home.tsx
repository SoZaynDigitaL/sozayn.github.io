import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Dashboard from '@/components/home/Dashboard';
import Pricing from '@/components/home/Pricing';
import Integrations from '@/components/home/Integrations';
import CTASection from '@/components/home/CTASection';
import DemoSection from '@/components/home/DemoSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-inter antialiased relative overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <Dashboard />
      <DemoSection />
      <Pricing />
      <Integrations />
      <CTASection />
      <Footer />
    </div>
  );
}

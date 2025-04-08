import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Dashboard from '@/components/home/Dashboard';
import Integrations from '@/components/home/Integrations';
import Pricing from '@/components/home/Pricing';
import CTASection from '@/components/home/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-inter antialiased relative overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <Dashboard />
      <Integrations />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}

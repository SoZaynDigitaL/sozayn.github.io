import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="lead text-xl text-text-secondary mb-8">
              Last updated: April 7, 2025
            </p>
            
            <h2>1. Introduction</h2>
            <p>
              At SoZayn, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our platform. Please read this privacy policy carefully. 
              If you do not agree with the terms of this privacy policy, please do not access the platform.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect several types of information from and about users of our platform, including:
            </p>
            <ul>
              <li>Personal information such as name, email address, and business details when you register</li>
              <li>Payment and billing information when you subscribe to our services</li>
              <li>Usage data about how you interact with our platform</li>
              <li>Device information including IP address, browser type, and operating system</li>
              <li>Information about your customers when you use our services to manage your business</li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We may use the information we collect about you for various purposes, including:
            </p>
            <ul>
              <li>Providing and improving our platform and services</li>
              <li>Processing transactions and sending related information</li>
              <li>Responding to your inquiries and support requests</li>
              <li>Sending administrative information, updates, and marketing communications</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Preventing fraudulent transactions and monitoring against errors</li>
            </ul>
            
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to maintain the safety of your personal information.
              However, no internet transmission is completely secure, and we cannot guarantee that unauthorized access, hacking, 
              data loss, or other breaches will never occur.
            </p>
            
            <h2>5. Third-Party Integrations</h2>
            <p>
              Our platform allows you to integrate with third-party services such as payment processors, delivery platforms, 
              and e-commerce systems. These integrations may collect information from you to provide their services. We recommend 
              reviewing the privacy policies of these third parties.
            </p>
            
            <h2>6. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access personal information we hold about you</li>
              <li>The right to request correction of inaccurate information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            
            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
            
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@sozayn.com<br />
              Phone: 1-800-SOZAYN<br />
              Address: 123 Tech Park, Suite 500, San Francisco, CA 94103
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
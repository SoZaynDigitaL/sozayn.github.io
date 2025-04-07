import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="lead text-xl text-text-secondary mb-8">
              Last updated: April 7, 2025
            </p>
            
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you and SoZayn Technologies, Inc. 
              ("we," "us," or "our"), concerning your access to and use of the SoZayn platform. You agree that by accessing 
              the platform, you have read, understood, and agree to be bound by all of these Terms of Service.
            </p>
            
            <h2>2. Subscription Terms</h2>
            <p>
              SoZayn operates on a subscription basis with different pricing tiers. Subscription fees are billed in advance 
              on a monthly or annual basis based on your selected plan. Unless you cancel your subscription prior to the end 
              of the applicable subscription period, we will automatically renew your subscription and charge the applicable fee 
              using your designated payment method.
            </p>
            
            <h2>3. Account Responsibilities</h2>
            <p>
              When you create an account with us, you must provide accurate and complete information. You are solely responsible 
              for activity that occurs on your account and for maintaining the confidentiality of your account password. You must 
              notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            
            <h2>4. Acceptable Use</h2>
            <p>
              You agree not to use the platform:
            </p>
            <ul>
              <li>In any way that violates any applicable federal, state, local, or international law</li>
              <li>To transmit any material that is defamatory, obscene, or offensive</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the platform</li>
              <li>To attempt to impersonate another user or any person</li>
              <li>To use the platform in any manner that could disable, overburden, or impair the platform</li>
              <li>To use any robot, spider, or other automatic device to access the platform</li>
            </ul>
            
            <h2>5. Intellectual Property</h2>
            <p>
              The platform and its entire contents, features, and functionality are owned by SoZayn Technologies, Inc., 
              its licensors, or other providers of such material and are protected by United States and international 
              copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            
            <h2>6. Third-Party Services</h2>
            <p>
              The platform may contain links to third-party websites and services. We are not responsible for the content 
              or practices of those websites or services. The inclusion of any links does not imply endorsement by us. 
              Your interactions with these third parties are solely between you and such third parties.
            </p>
            
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event will we, our affiliates, or our licensors, service providers, employees, agents, or officers be liable 
              for damages of any kind, including without limitation any direct, indirect, special, incidental, consequential, or 
              punitive damages, arising from or in connection with your use of the platform.
            </p>
            
            <h2>8. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold us harmless from and against any claims, liabilities, damages, judgments, 
              awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your 
              violation of these Terms of Service or your use of the platform.
            </p>
            
            <h2>9. Modifications to Terms</h2>
            <p>
              We may revise and update these Terms of Service from time to time at our sole discretion. All changes are effective 
              immediately when we post them. Your continued use of the platform following the posting of revised Terms of Service 
              means that you accept and agree to the changes.
            </p>
            
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              Email: legal@sozayn.com<br />
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
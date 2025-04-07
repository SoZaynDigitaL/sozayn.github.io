import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-primary">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="lead text-xl text-text-secondary mb-8">
              Last updated: April 7, 2025
            </p>
            
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored 
              in your web browser and allows the platform or a third-party to recognize you and make your next visit easier 
              and the platform more useful to you.
            </p>
            
            <h2>2. How We Use Cookies</h2>
            <p>
              When you use and access our platform, we may place a number of cookie files in your web browser. We use cookies 
              for the following purposes:
            </p>
            <ul>
              <li>Essential cookies: These are necessary for the platform to function properly.</li>
              <li>Preferences cookies: These are used to remember your preferences and various settings.</li>
              <li>Security cookies: These are used for security purposes.</li>
              <li>Analytics cookies: These help us understand how you use our platform, which pages you visit, and how you interact with different features.</li>
              <li>Advertising cookies: These help us and our advertising partners deliver relevant advertisements.</li>
            </ul>
            
            <h2>3. Types of Cookies We Use</h2>
            <p>
              We use both session and persistent cookies:
            </p>
            <ul>
              <li>Session cookies: These are temporary cookies that expire when you close your browser.</li>
              <li>Persistent cookies: These remain on your device until you delete them or they expire.</li>
            </ul>
            
            <h2>4. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the 
              platform, deliver advertisements, and so on. These include:
            </p>
            <ul>
              <li>Analytics providers (like Google Analytics)</li>
              <li>Social media platforms (like Facebook, Twitter, LinkedIn)</li>
              <li>Advertising networks</li>
              <li>Payment processors</li>
            </ul>
            
            <h2>5. What Are Your Choices Regarding Cookies</h2>
            <p>
              If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help 
              pages of your web browser.
            </p>
            <p>
              Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the 
              features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
            </p>
            
            <h2>6. Cookie Preference Center</h2>
            <p>
              You can manage your cookie preferences through our Cookie Preference Center, which can be accessed via the 
              "Manage Cookie Preferences" link in the footer of our platform.
            </p>
            
            <h2>7. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other 
              operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed 
              about our use of cookies and related technologies.
            </p>
            
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
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
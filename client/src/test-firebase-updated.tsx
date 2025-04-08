import React, { useState } from 'react';
import FirebaseAuthButton from '@/components/ui/firebase-auth-button';

/**
 * Enhanced test page for Firebase authentication with detailed debugging
 */
const TestFirebaseUpdated: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  // Function to display current environment info
  const showEnvironmentInfo = () => {
    const domain = window.location.hostname;
    const protocol = window.location.protocol;
    const fullUrl = window.location.href;
    const userAgent = navigator.userAgent;
    
    // Display environment information in a nicely formatted way
    setStatus(`
      Domain: ${domain}
      Protocol: ${protocol}
      Full URL: ${fullUrl}
      User Agent: ${userAgent}
      
      This information is useful when troubleshooting Firebase domain authorization issues.
      Please provide this information when requesting help.
    `);
  };
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff',
      background: '#0a0e17',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        marginBottom: '24px',
        textAlign: 'center',
        color: '#4361ee'
      }}>
        SoZayn Firebase Authentication Test
      </h1>
      
      <div style={{ 
        background: '#131a29', 
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          marginBottom: '16px',
          color: '#8957e5'
        }}>
          Authentication Test
        </h2>
        
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          This page tests Firebase Google Authentication with enhanced debugging information.
          Click the button below to initiate the Google sign-in process.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FirebaseAuthButton />
        </div>
      </div>
      
      <div style={{ 
        background: '#131a29', 
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          marginBottom: '16px',
          color: '#8957e5'
        }}>
          Environment Information
        </h2>
        
        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
          If you're experiencing authentication issues, it may be related to domain authorization.
          Click the button below to display your current environment information.
        </p>
        
        <button 
          onClick={showEnvironmentInfo}
          style={{
            background: '#2ea043',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Show Environment Info
        </button>
        
        {status && (
          <pre style={{ 
            marginTop: '16px', 
            padding: '16px', 
            background: '#1a2234',
            borderRadius: '4px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {status}
          </pre>
        )}
      </div>
      
      <div style={{ 
        background: '#131a29', 
        padding: '24px',
        borderRadius: '8px'
      }}>
        <h2 style={{ 
          fontSize: '20px', 
          marginBottom: '16px',
          color: '#8957e5'
        }}>
          How to Fix Domain Authorization Issues
        </h2>
        
        <ol style={{ 
          paddingLeft: '20px',
          lineHeight: '1.6'
        }}>
          <li style={{ marginBottom: '12px' }}>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#4361ee', textDecoration: 'underline' }}>Firebase Console</a></li>
          <li style={{ marginBottom: '12px' }}>Select your project: <strong>sozayn-7c013</strong></li>
          <li style={{ marginBottom: '12px' }}>In the left sidebar, click on <strong>Authentication</strong></li>
          <li style={{ marginBottom: '12px' }}>Click on the <strong>Settings</strong> tab</li>
          <li style={{ marginBottom: '12px' }}>Scroll down to <strong>Authorized domains</strong></li>
          <li style={{ marginBottom: '12px' }}>Click <strong>Add domain</strong> and add your current domain (shown above in Environment Information)</li>
          <li style={{ marginBottom: '12px' }}>Click <strong>Save</strong></li>
        </ol>
        
        <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
          Note: After adding your domain, you may need to wait a few minutes for the changes to propagate.
        </p>
      </div>
    </div>
  );
};

export default TestFirebaseUpdated;
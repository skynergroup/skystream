import React from 'react';
import { Shield, Eye, Cookie, Settings, Mail, Calendar } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-header">
        <div className="privacy-icon">
          <Shield size={48} />
        </div>
        <h1>Privacy Policy</h1>
        <p className="privacy-subtitle">
          Your privacy is important to us. This policy explains how SkyStream collects, 
          uses, and protects your information.
        </p>
        <div className="last-updated">
          <Calendar size={16} />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="privacy-content">
        <section className="privacy-section">
          <div className="section-header">
            <Eye size={24} />
            <h2>Information We Collect</h2>
          </div>
          <div className="section-content">
            <h3>Analytics Data (Optional)</h3>
            <p>
              When you consent to analytics, we collect anonymous usage data to improve your experience:
            </p>
            <ul>
              <li>Pages you visit and content you view</li>
              <li>Search terms and browsing patterns</li>
              <li>Video player preferences and performance</li>
              <li>Device type and browser information</li>
              <li>General location (country/region level only)</li>
            </ul>

            <h3>Essential Data</h3>
            <p>
              We collect minimal essential data required for the site to function:
            </p>
            <ul>
              <li>Your consent preferences</li>
              <li>Basic technical information for content delivery</li>
              <li>Error logs to maintain site functionality</li>
            </ul>

            <div className="privacy-note">
              <strong>Note:</strong> We do not collect personal information like names, 
              email addresses, or payment details. No account registration is required.
            </div>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Cookie size={24} />
            <h2>Cookies and Tracking</h2>
          </div>
          <div className="section-content">
            <h3>Essential Cookies</h3>
            <p>
              Required for basic site functionality. These cannot be disabled:
            </p>
            <ul>
              <li>Consent preferences storage</li>
              <li>Video player settings</li>
              <li>Site security and error prevention</li>
            </ul>

            <h3>Analytics Cookies (Optional)</h3>
            <p>
              Used only with your consent to understand site usage:
            </p>
            <ul>
              <li>Google Analytics 4 (anonymized)</li>
              <li>Content popularity tracking</li>
              <li>User behavior analysis</li>
            </ul>

            <h3>Marketing Cookies</h3>
            <p>
              Currently not used. SkyStream does not display advertisements or 
              track users for marketing purposes.
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Settings size={24} />
            <h2>Your Rights and Choices</h2>
          </div>
          <div className="section-content">
            <h3>Consent Management</h3>
            <p>You have full control over your privacy preferences:</p>
            <ul>
              <li>Accept or decline analytics tracking</li>
              <li>Change your preferences at any time</li>
              <li>Clear all stored data</li>
              <li>Browse without any tracking</li>
            </ul>

            <h3>Data Rights (GDPR)</h3>
            <p>If you're in the EU, you have additional rights:</p>
            <ul>
              <li><strong>Access:</strong> Request information about data we have</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to data processing</li>
            </ul>

            <div className="privacy-controls">
              <h4>Manage Your Preferences</h4>
              <p>
                You can change your consent preferences at any time by clicking 
                the privacy settings in the footer or clearing your browser data.
              </p>
              <button 
                className="privacy-btn"
                onClick={() => {
                  // This would trigger the consent banner to reappear
                  localStorage.removeItem('skystream_consent_preferences');
                  window.location.reload();
                }}
              >
                Reset Privacy Preferences
              </button>
            </div>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Shield size={24} />
            <h2>Data Protection</h2>
          </div>
          <div className="section-content">
            <h3>Security Measures</h3>
            <ul>
              <li>All data transmission is encrypted (HTTPS)</li>
              <li>No sensitive personal data is collected</li>
              <li>Analytics data is anonymized</li>
              <li>Regular security updates and monitoring</li>
            </ul>

            <h3>Data Retention</h3>
            <ul>
              <li>Consent preferences: Until you change them or 13 months</li>
              <li>Analytics data: Processed by Google Analytics (26 months)</li>
              <li>Essential data: Only as long as necessary for functionality</li>
            </ul>

            <h3>Third-Party Services</h3>
            <p>We use these trusted services:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Anonymous usage analytics (optional)</li>
              <li><strong>TMDB:</strong> Movie and TV show information</li>
              <li><strong>Video Players:</strong> External streaming services</li>
            </ul>
          </div>
        </section>

        <section className="privacy-section">
          <div className="section-header">
            <Mail size={24} />
            <h2>Contact Us</h2>
          </div>
          <div className="section-content">
            <p>
              If you have questions about this privacy policy or want to exercise 
              your data rights, please contact us:
            </p>
            
            <div className="contact-info">
              <p><strong>Website:</strong> SkyStream Privacy Team</p>
              <p><strong>Response Time:</strong> Within 30 days</p>
            </div>

            <h3>Changes to This Policy</h3>
            <p>
              We may update this privacy policy occasionally. When we do, we'll 
              update the "Last updated" date and may ask for your consent again 
              if the changes are significant.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

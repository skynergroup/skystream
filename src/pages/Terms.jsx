import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Download, Users } from 'lucide-react';
import { Button } from '../components';
import './Terms.css';

const Terms = () => {
  const lastUpdated = 'December 2024';

  return (
    <div className="terms-page">
      <div className="terms-container">
        {/* Header */}
        <div className="terms-header">
          <Button
            as={Link}
            to="/"
            variant="ghost"
            size="small"
            icon={<ArrowLeft size={16} />}
            className="back-button"
          >
            Back to Home
          </Button>
          
          <h1 className="terms-title">Terms of Service</h1>
          <p className="terms-subtitle">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="terms-content">
          {/* Introduction */}
          <section className="terms-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to SkyStream. These Terms of Service ("Terms") govern your use of our streaming platform 
              and services. By accessing or using SkyStream, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Service Description */}
          <section className="terms-section">
            <div className="section-header">
              <Eye size={20} />
              <h2>2. Service Description</h2>
            </div>
            <p>
              SkyStream is a content aggregation platform that provides access to movies, TV shows, and anime 
              through third-party streaming services. We do not host, store, or distribute any media content directly.
            </p>
            <ul>
              <li>Content is sourced from external streaming providers</li>
              <li>Availability may vary by region and provider</li>
              <li>We are not responsible for content quality or availability</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="terms-section">
            <div className="section-header">
              <Users size={20} />
              <h2>3. User Responsibilities</h2>
            </div>
            <p>By using SkyStream, you agree to:</p>
            <ul>
              <li>Use the service only for lawful purposes</li>
              <li>Respect intellectual property rights</li>
              <li>Not attempt to circumvent any security measures</li>
              <li>Not use automated tools to access our service</li>
              <li>Provide accurate information when creating an account</li>
            </ul>
          </section>

          {/* Content and Copyright */}
          <section className="terms-section">
            <div className="section-header">
              <Shield size={20} />
              <h2>4. Content and Copyright</h2>
            </div>
            <p>
              SkyStream respects intellectual property rights and complies with the Digital Millennium 
              Copyright Act (DMCA). All content accessed through our platform is owned by their respective 
              copyright holders.
            </p>
            <div className="important-notice">
              <h4>Important Notice</h4>
              <p>
                SkyStream does not host or store any media files. All content is sourced from third-party 
                services and platforms. We respect intellectual property rights and comply with DMCA regulations.
              </p>
            </div>
          </section>

          {/* Privacy and Data */}
          <section className="terms-section">
            <h2>5. Privacy and Data Collection</h2>
            <p>
              Your privacy is important to us. Please review our{' '}
              <Link to="/privacy-policy" className="terms-link">Privacy Policy</Link>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="terms-section">
            <h2>6. Disclaimers</h2>
            <p>
              SkyStream is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul>
              <li>Continuous or uninterrupted access to the service</li>
              <li>Accuracy or completeness of content information</li>
              <li>Availability of specific content or streaming sources</li>
              <li>Compatibility with all devices or browsers</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="terms-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SkyStream and its developers shall not be liable 
              for any indirect, incidental, special, or consequential damages arising from your use of the service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="terms-section">
            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of SkyStream after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="terms-section">
            <h2>9. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us through our{' '}
              <Link to="/contact" className="terms-link">Contact page</Link>.
            </p>
          </section>

          {/* Developer Information */}
          <section className="terms-section">
            <h2>10. Developer Information</h2>
            <p>
              SkyStream is developed and maintained by{' '}
              <a 
                href="https://skyner.co.za/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="terms-link"
              >
                Skyner Development
              </a>
              . This platform is created for educational and entertainment purposes.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="terms-footer">
          <Button
            as={Link}
            to="/privacy-policy"
            variant="secondary"
            size="medium"
          >
            Privacy Policy
          </Button>
          
          <Button
            as={Link}
            to="/contact"
            variant="secondary"
            size="medium"
          >
            Contact Us
          </Button>
          
          <Button
            as={Link}
            to="/"
            variant="primary"
            size="medium"
          >
            Back to SkyStream
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terms;

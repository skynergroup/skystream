import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Search, Smartphone, Globe, Shield, Heart, Code, ExternalLink } from 'lucide-react';
import { Button } from '../components';
import './About.css';

const About = () => {
  const features = [
    {
      icon: <Search size={24} />,
      title: 'Smart Search',
      description: 'Find any movie, TV show, or anime with our intelligent search powered by TMDB.'
    },
    {
      icon: <Play size={24} />,
      title: 'Multiple Players',
      description: 'Access content through various streaming sources with our integrated player system.'
    },
    {
      icon: <Smartphone size={24} />,
      title: 'Responsive Design',
      description: 'Enjoy SkyStream on any device - desktop, tablet, or mobile with optimized experience.'
    },
    {
      icon: <Globe size={24} />,
      title: 'Global Content',
      description: 'Discover trending content from around the world with real-time TMDB data.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Privacy Focused',
      description: 'We respect your privacy and don\'t store unnecessary personal information.'
    },
    {
      icon: <Heart size={24} />,
      title: 'User Experience',
      description: 'Clean, intuitive interface designed for the best possible viewing experience.'
    }
  ];

  const stats = [
    { number: '1M+', label: 'Movies & Shows' },
    { number: '50+', label: 'Countries' },
    { number: '24/7', label: 'Availability' },
    { number: '100%', label: 'Free to Use' }
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        {/* Header */}
        <div className="about-header">
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
          
          <h1 className="about-title">About SkyStream</h1>
          <p className="about-subtitle">
            Your gateway to unlimited entertainment
          </p>
        </div>

        {/* Hero Section */}
        <div className="about-hero">
          <div className="hero-content">
            <h2>Welcome to the Future of Streaming</h2>
            <p>
              SkyStream is a modern content aggregation platform that brings together movies, 
              TV shows, and anime from various sources into one seamless experience. Built with 
              cutting-edge technology and designed with users in mind.
            </p>
            
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">Why Choose SkyStream?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Section */}
        <div className="technology-section">
          <div className="tech-content">
            <div className="tech-text">
              <h2>Built with Modern Technology</h2>
              <p>
                SkyStream is developed using the latest web technologies to ensure fast, 
                reliable, and secure streaming experience. Our platform leverages React, 
                modern APIs, and responsive design principles.
              </p>
              
              <div className="tech-features">
                <div className="tech-feature">
                  <Code size={20} />
                  <span>React & Modern JavaScript</span>
                </div>
                <div className="tech-feature">
                  <Globe size={20} />
                  <span>TMDB API Integration</span>
                </div>
                <div className="tech-feature">
                  <Shield size={20} />
                  <span>Secure & Privacy-Focused</span>
                </div>
                <div className="tech-feature">
                  <Smartphone size={20} />
                  <span>Mobile-First Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div className="mission-card">
              <h3>Accessibility</h3>
              <p>
                Making entertainment accessible to everyone, regardless of location or device. 
                We believe great content should be available to all.
              </p>
            </div>
            
            <div className="mission-card">
              <h3>Innovation</h3>
              <p>
                Continuously improving the streaming experience through innovative features 
                and cutting-edge technology.
              </p>
            </div>
            
            <div className="mission-card">
              <h3>Community</h3>
              <p>
                Building a community of entertainment enthusiasts who can discover and 
                enjoy content together.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="developer-section">
          <h2 className="section-title">About the Developer</h2>
          <div className="developer-content">
            <p>
              SkyStream is developed and maintained by{' '}
              <a 
                href="https://skyner.co.za/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="developer-link"
              >
                Skyner Development <ExternalLink size={16} />
              </a>
              , a passionate team dedicated to creating exceptional web experiences.
            </p>
            
            <p>
              This project represents our commitment to open-source development and 
              providing quality entertainment platforms for users worldwide.
            </p>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="legal-section">
          <h2 className="section-title">Important Notice</h2>
          <div className="legal-content">
            <div className="legal-notice">
              <Shield size={24} />
              <div>
                <h4>Content Disclaimer</h4>
                <p>
                  SkyStream is a content aggregation platform that does not host, store, or 
                  distribute any media files. All content is sourced from third-party services 
                  and platforms. We respect intellectual property rights and comply with DMCA regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2>Ready to Start Streaming?</h2>
          <p>Join thousands of users who trust SkyStream for their entertainment needs.</p>
          
          <div className="cta-buttons">
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="large"
              icon={<Play size={20} />}
            >
              Start Watching
            </Button>
            
            <Button
              as={Link}
              to="/contact"
              variant="secondary"
              size="large"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

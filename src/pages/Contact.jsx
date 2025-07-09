import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Bug, Lightbulb, Shield, ExternalLink } from 'lucide-react';
import { Button } from '../components';
import { analytics } from '../utils';
import './Contact.css';

const Contact = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });

  const categories = [
    { id: 'general', label: 'General Inquiry', icon: <MessageSquare size={20} /> },
    { id: 'bug', label: 'Bug Report', icon: <Bug size={20} /> },
    { id: 'feature', label: 'Feature Request', icon: <Lightbulb size={20} /> },
    { id: 'dmca', label: 'DMCA / Copyright', icon: <Shield size={20} /> }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Track contact form submission
    analytics.trackEvent('contact_form_submit', {
      category: 'user_engagement',
      label: formData.category,
      contact_category: formData.category,
      has_email: !!formData.email,
      message_length: formData.message.length
    });

    // For now, show success message (in real app, would send to backend)
    alert('Thank you for your message! We\'ll get back to you soon.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      category: 'general',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
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
          
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Form */}
          <div className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              {/* Category Selection */}
              <div className="form-group">
                <label className="form-label">What can we help you with?</label>
                <div className="category-grid">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name and Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="6"
                  required
                  placeholder="Please provide as much detail as possible..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="large"
                icon={<Mail size={20} />}
                className="submit-button"
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3>Get in Touch</h3>
              <p>
                Have questions about SkyStream? We're here to help! Whether you need technical support, 
                want to report a bug, or have suggestions for new features, we'd love to hear from you.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <Mail size={20} />
                  <div>
                    <h4>Email Support</h4>
                    <p>We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="contact-method">
                  <ExternalLink size={20} />
                  <div>
                    <h4>Developer</h4>
                    <p>
                      <a 
                        href="https://skyner.co.za/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-link"
                      >
                        Skyner Development
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-notice">
                <h4>Important Notice</h4>
                <p>
                  For DMCA or copyright-related inquiries, please select the "DMCA / Copyright" 
                  category above and provide detailed information about the content in question.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="quick-links">
              <h4>Quick Links</h4>
              <div className="quick-links-grid">
                <Link to="/privacy-policy" className="quick-link">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="quick-link">
                  Terms of Service
                </Link>
                <Link to="/about" className="quick-link">
                  About SkyStream
                </Link>
                <Link to="/" className="quick-link">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

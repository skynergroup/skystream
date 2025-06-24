import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      {/* 404 Number */}
      <h1 style={{
        fontSize: '8rem',
        fontWeight: '900',
        color: 'var(--netflix-red)',
        margin: '0',
        textShadow: '0 0 20px rgba(229, 9, 20, 0.3)',
        lineHeight: '1'
      }}>
        404
      </h1>
      
      {/* Error Message */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: 'var(--netflix-white)',
        margin: '1rem 0 0.5rem 0'
      }}>
        Page Not Found
      </h2>
      
      <p style={{
        fontSize: '1.1rem',
        color: 'var(--netflix-text-gray)',
        margin: '0 0 2rem 0',
        maxWidth: '500px',
        lineHeight: '1.6'
      }}>
        Sorry, we couldn't find the page you were looking for. 
        The page might have been moved, deleted, or you entered the wrong URL.
      </p>
      
      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Button
          as={Link}
          to="/"
          variant="primary"
          size="large"
          icon={<Home size={20} />}
        >
          Go Home
        </Button>
        
        <Button
          as={Link}
          to="/search"
          variant="secondary"
          size="large"
          icon={<Search size={20} />}
        >
          Search Content
        </Button>
        
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          size="large"
          icon={<ArrowLeft size={20} />}
        >
          Go Back
        </Button>
      </div>
      
      {/* Decorative Element */}
      <div style={{
        marginTop: '3rem',
        opacity: 0.3
      }}>
        <img 
          src="/LOGO.png" 
          alt="Boredflix" 
          style={{
            height: '60px',
            filter: 'grayscale(100%)'
          }}
        />
      </div>
    </div>
  );
};

export default NotFound;

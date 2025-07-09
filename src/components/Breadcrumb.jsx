import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items = [] }) => {
  // Default home item
  const breadcrumbItems = [
    { label: 'Home', path: '/', icon: Home },
    ...items
  ];

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;

          return (
            <li key={index} className="breadcrumb-item">
              {!isLast ? (
                <Link 
                  to={item.path} 
                  className="breadcrumb-link"
                  aria-label={`Navigate to ${item.label}`}
                >
                  {IconComponent && index === 0 && (
                    <IconComponent size={16} className="breadcrumb-icon" />
                  )}
                  <span className="breadcrumb-text">{item.label}</span>
                </Link>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight 
                  size={14} 
                  className="breadcrumb-separator" 
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

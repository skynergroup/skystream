import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import './FreeTierMonitor.css';

const FreeTierMonitor = ({ show, onClose }) => {
  const [usage, setUsage] = useState({
    monthlyActiveUsers: 0,
    userPoolOperations: 0,
    estimatedCost: 0,
    lastUpdated: new Date(),
  });

  const [limits] = useState({
    monthlyActiveUsers: 50000,
    userPoolOperations: 50000,
    warningThreshold: 0.8, // 80% of free tier
  });

  useEffect(() => {
    if (show) {
      // In a real implementation, this would fetch from your backend
      // which monitors AWS CloudWatch metrics
      fetchUsageData();
    }
  }, [show]);

  const fetchUsageData = async () => {
    try {
      // Simulated usage data - replace with actual API call
      const mockUsage = {
        monthlyActiveUsers: Math.floor(Math.random() * 1000), // Random for demo
        userPoolOperations: Math.floor(Math.random() * 5000),
        estimatedCost: 0, // Should be 0 within free tier
        lastUpdated: new Date(),
      };
      
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const getUsagePercentage = (current, limit) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageStatus = (current, limit) => {
    const percentage = getUsagePercentage(current, limit);
    if (percentage >= 90) return 'critical';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  if (!show) return null;

  const mauPercentage = getUsagePercentage(usage.monthlyActiveUsers, limits.monthlyActiveUsers);
  const operationsPercentage = getUsagePercentage(usage.userPoolOperations, limits.userPoolOperations);
  const mauStatus = getUsageStatus(usage.monthlyActiveUsers, limits.monthlyActiveUsers);
  const operationsStatus = getUsageStatus(usage.userPoolOperations, limits.userPoolOperations);

  return (
    <div className="freetier-monitor-overlay">
      <div className="freetier-monitor-modal">
        <div className="freetier-monitor-header">
          <div className="header-content">
            <DollarSign className="dollar-icon" size={24} />
            <h2>AWS Free Tier Monitor</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="freetier-monitor-content">
          {/* Overall Status */}
          <div className="status-section">
            <div className="status-card">
              {usage.estimatedCost === 0 ? (
                <>
                  <CheckCircle className="status-icon good" size={32} />
                  <h3>Within Free Tier</h3>
                  <p>No charges incurred this month</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="status-icon warning" size={32} />
                  <h3>Charges Detected</h3>
                  <p>Estimated cost: ${usage.estimatedCost.toFixed(2)}</p>
                </>
              )}
            </div>
          </div>

          {/* Usage Metrics */}
          <div className="metrics-section">
            <h3>Current Usage</h3>
            
            {/* Monthly Active Users */}
            <div className="metric-card">
              <div className="metric-header">
                <h4>Monthly Active Users</h4>
                <span className={`status-badge ${mauStatus}`}>
                  {mauStatus === 'good' && <CheckCircle size={16} />}
                  {mauStatus === 'warning' && <AlertTriangle size={16} />}
                  {mauStatus === 'critical' && <AlertTriangle size={16} />}
                  {mauStatus.charAt(0).toUpperCase() + mauStatus.slice(1)}
                </span>
              </div>
              
              <div className="metric-details">
                <div className="usage-numbers">
                  <span className="current">{formatNumber(usage.monthlyActiveUsers)}</span>
                  <span className="separator">/</span>
                  <span className="limit">{formatNumber(limits.monthlyActiveUsers)}</span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${mauStatus}`}
                    style={{ width: `${mauPercentage}%` }}
                  ></div>
                </div>
                
                <div className="percentage">{mauPercentage.toFixed(1)}% used</div>
              </div>
            </div>

            {/* User Pool Operations */}
            <div className="metric-card">
              <div className="metric-header">
                <h4>User Pool Operations</h4>
                <span className={`status-badge ${operationsStatus}`}>
                  {operationsStatus === 'good' && <CheckCircle size={16} />}
                  {operationsStatus === 'warning' && <AlertTriangle size={16} />}
                  {operationsStatus === 'critical' && <AlertTriangle size={16} />}
                  {operationsStatus.charAt(0).toUpperCase() + operationsStatus.slice(1)}
                </span>
              </div>
              
              <div className="metric-details">
                <div className="usage-numbers">
                  <span className="current">{formatNumber(usage.userPoolOperations)}</span>
                  <span className="separator">/</span>
                  <span className="limit">{formatNumber(limits.userPoolOperations)}</span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${operationsStatus}`}
                    style={{ width: `${operationsPercentage}%` }}
                  ></div>
                </div>
                
                <div className="percentage">{operationsPercentage.toFixed(1)}% used</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-section">
            <h3>Optimization Tips</h3>
            <div className="tips-list">
              <div className="tip-item">
                <Shield size={16} />
                <span>Use SRP authentication to reduce API calls</span>
              </div>
              <div className="tip-item">
                <Shield size={16} />
                <span>Implement proper session management</span>
              </div>
              <div className="tip-item">
                <Shield size={16} />
                <span>Set appropriate token expiration times</span>
              </div>
              <div className="tip-item">
                <Shield size={16} />
                <span>Monitor usage regularly to avoid surprises</span>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="last-updated">
            <small>Last updated: {usage.lastUpdated.toLocaleString()}</small>
            <button className="refresh-button" onClick={fetchUsageData}>
              Refresh
            </button>
          </div>
        </div>

        <div className="freetier-monitor-footer">
          <div className="footer-info">
            <p>Monitor your AWS usage to stay within free tier limits</p>
            <a 
              href="https://console.aws.amazon.com/billing/home#/freetier" 
              target="_blank" 
              rel="noopener noreferrer"
              className="aws-console-link"
            >
              View in AWS Console
            </a>
          </div>
          <button className="close-footer-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeTierMonitor;

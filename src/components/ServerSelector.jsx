import { useState } from 'react';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import './ServerSelector.css';

const ServerSelector = ({ 
  onServerChange, 
  activeServer = 1, 
  availableServers = [1, 2, 3, 4, 5, 6, 7, 8],
  serverStatus = {} // { 1: 'online', 2: 'offline', 3: 'online', ... }
}) => {
  const [selectedServer, setSelectedServer] = useState(activeServer);

  const handleServerSelect = (serverNumber) => {
    setSelectedServer(serverNumber);
    if (onServerChange) {
      onServerChange(serverNumber);
    }
  };

  const getServerStatus = (serverNumber) => {
    return serverStatus[serverNumber] || 'online';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={14} className="status-icon online" />;
      case 'offline':
        return <AlertCircle size={14} className="status-icon offline" />;
      default:
        return <CheckCircle size={14} className="status-icon online" />;
    }
  };

  return (
    <div className="server-selector">
      <div className="server-selector-header">
        <h3 className="server-title">
          <Zap size={20} className="lightning-icon" />
          Premium Servers
        </h3>
        <span className="server-count">{availableServers.length} Available</span>
      </div>

      <div className="server-grid">
        {availableServers.map((serverNumber) => {
          const status = getServerStatus(serverNumber);
          const isActive = selectedServer === serverNumber;
          const isOnline = status === 'online';

          return (
            <button
              key={serverNumber}
              className={`server-btn ${isActive ? 'active' : ''} ${!isOnline ? 'offline' : ''}`}
              onClick={() => handleServerSelect(serverNumber)}
              disabled={!isOnline}
              title={`Premium ${serverNumber} - ${status}`}
            >
              <div className="server-content">
                <div className="server-header">
                  <Zap size={16} className="server-lightning" />
                  <span className="server-name">Premium {serverNumber}</span>
                </div>
                
                <div className="server-status">
                  {getStatusIcon(status)}
                  <span className="status-text">{status}</span>
                </div>
              </div>

              {isActive && (
                <div className="active-indicator">
                  <CheckCircle size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="server-info">
        <p className="server-description">
          Premium servers provide the best streaming quality and fastest loading times.
          Select a server to start watching.
        </p>
      </div>
    </div>
  );
};

export default ServerSelector;

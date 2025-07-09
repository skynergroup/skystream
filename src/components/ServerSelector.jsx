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

  // Server configuration with names and availability
  const serverConfig = {
    1: { name: 'Videasy', provider: 'Premium', available: true },
    2: { name: 'Vidsrc', provider: 'Premium', available: true },
    3: { name: 'Server 3', provider: 'Premium', available: false },
    4: { name: 'Server 4', provider: 'Premium', available: false },
    5: { name: 'Server 5', provider: 'Premium', available: false },
    6: { name: 'Server 6', provider: 'Premium', available: false },
    7: { name: 'Server 7', provider: 'Premium', available: false },
    8: { name: 'Server 8', provider: 'Premium', available: false },
  };

  const handleServerSelect = (serverNumber) => {
    const server = serverConfig[serverNumber];
    if (!server?.available) return; // Don't allow selection of unavailable servers

    setSelectedServer(serverNumber);
    if (onServerChange) {
      onServerChange(serverNumber);
    }
  };

  const getServerStatus = (serverNumber) => {
    const server = serverConfig[serverNumber];
    if (!server?.available) return 'unavailable';
    return serverStatus[serverNumber] || 'online';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={14} className="status-icon online" />;
      case 'offline':
        return <AlertCircle size={14} className="status-icon offline" />;
      case 'unavailable':
        return <AlertCircle size={14} className="status-icon unavailable" />;
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
        <span className="server-count">
          {availableServers.filter(num => serverConfig[num]?.available).length} Available
        </span>
      </div>

      <div className="server-grid">
        {availableServers.map((serverNumber) => {
          const server = serverConfig[serverNumber];
          const status = getServerStatus(serverNumber);
          const isActive = selectedServer === serverNumber;
          const isAvailable = server?.available && status !== 'unavailable';

          return (
            <button
              key={serverNumber}
              className={`server-btn ${isActive ? 'active' : ''} ${!isAvailable ? 'offline' : ''}`}
              onClick={() => handleServerSelect(serverNumber)}
              disabled={!isAvailable}
              title={`${server?.name || `Server ${serverNumber}`} - ${status}`}
            >
              <div className="server-content">
                <div className="server-header">
                  <Zap size={16} className="server-lightning" />
                  <span className="server-name">
                    {server?.name || `Server ${serverNumber}`}
                  </span>
                </div>

                <div className="server-status">
                  {getStatusIcon(status)}
                  <span className="status-text">
                    {status === 'unavailable' ? 'Unavailable' : status}
                  </span>
                </div>
              </div>

              {isActive && isAvailable && (
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

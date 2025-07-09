import { useState, useEffect } from 'react';
import { Users, Plus, Play, Calendar, Clock, Globe } from 'lucide-react';
import { Button, Loading } from '../components';
import { analytics } from '../utils';
import './Parties.css';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('public'); // 'public', 'friends', 'my-parties'

  useEffect(() => {
    loadParties();
    
    // Track page visit
    analytics.trackEvent('parties_page_visit', {
      category: 'page_view',
      label: 'parties'
    });
  }, [activeTab]);

  const loadParties = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real app this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockParties = [];
      setParties(mockParties);
    } catch (error) {
      console.error('Failed to load parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = () => {
    // Track party creation attempt
    analytics.trackEvent('create_party_click', {
      category: 'user_interaction',
      label: 'create_party_button'
    });
    
    // TODO: Open create party modal
    alert('Create Party feature coming soon!');
  };

  const handleJoinParty = (partyId) => {
    // Track party join attempt
    analytics.trackEvent('join_party_click', {
      category: 'user_interaction',
      label: `party_${partyId}`
    });
    
    // TODO: Join party logic
    alert('Join Party feature coming soon!');
  };

  const tabs = [
    { id: 'public', label: 'Public Parties', icon: <Globe size={18} /> },
    { id: 'friends', label: 'Friends Parties', icon: <Users size={18} /> },
    { id: 'my-parties', label: 'My Parties', icon: <Calendar size={18} /> }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="parties-page">
      <div className="parties-container">
        {/* Header */}
        <div className="parties-header">
          <div className="parties-title-section">
            <h1 className="parties-title">
              <Users size={32} />
              Watch Parties
            </h1>
            <p className="parties-subtitle">
              Watch movies and TV shows together with friends in real-time
            </p>
          </div>
          
          <Button
            variant="primary"
            size="large"
            icon={<Plus size={20} />}
            onClick={handleCreateParty}
            className="create-party-btn"
          >
            Create Party
          </Button>
        </div>

        {/* Tabs */}
        <div className="parties-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`parties-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="parties-content">
          {parties.length === 0 ? (
            <div className="parties-empty">
              <div className="parties-empty-icon">
                <Users size={64} />
              </div>
              <h3 className="parties-empty-title">
                {activeTab === 'public' && 'No public parties available'}
                {activeTab === 'friends' && 'No friends parties available'}
                {activeTab === 'my-parties' && 'You haven\'t created any parties yet'}
              </h3>
              <p className="parties-empty-description">
                {activeTab === 'public' && 'Check back later for public watch parties or create your own!'}
                {activeTab === 'friends' && 'Invite friends to create watch parties together.'}
                {activeTab === 'my-parties' && 'Create your first watch party and invite friends to join.'}
              </p>
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleCreateParty}
                className="parties-empty-btn"
              >
                Create Your First Party
              </Button>
            </div>
          ) : (
            <div className="parties-grid">
              {parties.map(party => (
                <div key={party.id} className="party-card">
                  <div className="party-card-header">
                    <img 
                      src={party.content.poster} 
                      alt={party.content.title}
                      className="party-card-poster"
                    />
                    <div className="party-card-info">
                      <h4 className="party-card-title">{party.content.title}</h4>
                      <p className="party-card-host">Hosted by {party.host.name}</p>
                      <div className="party-card-meta">
                        <span className="party-card-participants">
                          <Users size={14} />
                          {party.participants.length}/{party.maxParticipants}
                        </span>
                        <span className="party-card-time">
                          <Clock size={14} />
                          {party.startTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="party-card-actions">
                    <Button
                      variant="primary"
                      size="small"
                      icon={<Play size={16} />}
                      onClick={() => handleJoinParty(party.id)}
                    >
                      Join Party
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="parties-info">
          <h3 className="parties-info-title">How Watch Parties Work</h3>
          <div className="parties-info-grid">
            <div className="parties-info-item">
              <div className="parties-info-icon">
                <Plus size={24} />
              </div>
              <h4>Create a Party</h4>
              <p>Choose a movie or TV show and create a watch party for your friends.</p>
            </div>
            
            <div className="parties-info-item">
              <div className="parties-info-icon">
                <Users size={24} />
              </div>
              <h4>Invite Friends</h4>
              <p>Share the party link with friends or make it public for anyone to join.</p>
            </div>
            
            <div className="parties-info-item">
              <div className="parties-info-icon">
                <Play size={24} />
              </div>
              <h4>Watch Together</h4>
              <p>Enjoy synchronized playback with real-time chat and reactions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parties;

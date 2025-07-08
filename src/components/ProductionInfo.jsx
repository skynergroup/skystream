import { useState, useEffect } from 'react';
import { User, Building2, Users, Calendar, MapPin } from 'lucide-react';
import tmdbApi from '../services/tmdbApi';
import './ProductionInfo.css';

const ProductionInfo = ({ contentId, contentType }) => {
  const [credits, setCredits] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductionInfo = async () => {
      try {
        setLoading(true);
        
        // Fetch credits (cast and crew)
        const creditsData = await tmdbApi.getCredits(contentId, contentType);
        setCredits(creditsData);

        // Fetch additional details
        const detailsData = contentType === 'movie' 
          ? await tmdbApi.getMovieDetails(contentId)
          : await tmdbApi.getTVDetails(contentId);
        setDetails(detailsData);
        
      } catch (error) {
        console.error('Failed to fetch production info:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contentId && contentType) {
      fetchProductionInfo();
    }
  }, [contentId, contentType]);

  if (loading) {
    return (
      <div className="production-info loading">
        <div className="loading-placeholder">Loading production information...</div>
      </div>
    );
  }

  if (!credits && !details) {
    return null;
  }

  // Get director(s)
  const directors = credits?.crew?.filter(person => person.job === 'Director') || [];
  
  // Get main cast (first 6)
  const mainCast = credits?.cast?.slice(0, 6) || [];
  
  // Get production companies
  const productionCompanies = details?.production_companies?.slice(0, 3) || [];
  
  // Get production countries
  const productionCountries = details?.production_countries?.slice(0, 3) || [];

  return (
    <div className="production-info">
      <div className="production-info-container">
        
        {/* Director Section */}
        {directors.length > 0 && (
          <div className="production-section">
            <h3 className="production-title">
              <User size={20} />
              {directors.length > 1 ? 'Directors' : 'Director'}
            </h3>
            <div className="production-content">
              {directors.map((director, index) => (
                <span key={director.id} className="production-item">
                  {director.name}
                  {index < directors.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Production Companies */}
        {productionCompanies.length > 0 && (
          <div className="production-section">
            <h3 className="production-title">
              <Building2 size={20} />
              Production
            </h3>
            <div className="production-content">
              {productionCompanies.map((company, index) => (
                <span key={company.id} className="production-item">
                  {company.name}
                  {index < productionCompanies.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Production Countries */}
        {productionCountries.length > 0 && (
          <div className="production-section">
            <h3 className="production-title">
              <MapPin size={20} />
              {productionCountries.length > 1 ? 'Countries' : 'Country'}
            </h3>
            <div className="production-content">
              {productionCountries.map((country, index) => (
                <span key={country.iso_3166_1} className="production-item">
                  {country.name}
                  {index < productionCountries.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Release Info */}
        {details && (
          <div className="production-section">
            <h3 className="production-title">
              <Calendar size={20} />
              Release
            </h3>
            <div className="production-content">
              <span className="production-item">
                {contentType === 'movie' 
                  ? new Date(details.release_date).getFullYear()
                  : new Date(details.first_air_date).getFullYear()
                }
              </span>
              {details.status && (
                <span className="production-status">• {details.status}</span>
              )}
            </div>
          </div>
        )}

        {/* Main Cast */}
        {mainCast.length > 0 && (
          <div className="production-section cast-section">
            <h3 className="production-title">
              <Users size={20} />
              Starring
            </h3>
            <div className="cast-grid">
              {mainCast.map((actor) => (
                <div key={actor.id} className="cast-member">
                  <div className="cast-name">{actor.name}</div>
                  <div className="cast-character">{actor.character}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductionInfo;

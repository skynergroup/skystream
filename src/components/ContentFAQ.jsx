import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import './ContentFAQ.css';

const ContentFAQ = ({ content, className = '' }) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Generate content-specific FAQ items
  const generateFAQItems = () => {
    const title = content?.title || content?.name || 'this content';
    const year = content?.release_date ? new Date(content.release_date).getFullYear() : 
                 content?.first_air_date ? new Date(content.first_air_date).getFullYear() : '';
    const type = content?.type === 'movie' ? 'movie' : 'TV show';
    
    return [
      {
        question: `Where can I watch ${title} online for free?`,
        answer: `You can watch ${title} for free on SkyStream. We provide multiple premium servers with high-quality streaming. Simply click the "Watch Now" button above to start streaming immediately.`
      },
      {
        question: `Is ${title} available in HD quality?`,
        answer: `Yes, ${title} is available in multiple quality options including HD (720p), Full HD (1080p), and 4K when available. Our premium servers automatically adjust to provide the best quality based on your internet connection.`
      },
      {
        question: `Can I download ${title} to watch offline?`,
        answer: `Currently, ${title} is available for online streaming only. However, you can add it to your watchlist to easily find it later and continue watching from where you left off.`
      },
      {
        question: `Are there subtitles available for ${title}?`,
        answer: `Yes, ${title} includes multiple subtitle options in various languages. You can enable subtitles using the player controls once you start watching.`
      },
      {
        question: `What genre is ${title}?`,
        answer: content?.genres?.length > 0
          ? `${title} is categorized under ${content.genres.map(g => g.name).filter(name => name && name.trim() !== '').join(', ')}. ${type === 'movie' ? 'This movie' : 'This TV show'} was ${year ? `released in ${year}` : 'recently released'}.`
          : `${title} is a ${type} that was ${year ? `released in ${year}` : 'recently released'}. Check the details above for more information about the genre and storyline.`
      },
      {
        question: `How long is ${title}?`,
        answer: content?.runtime 
          ? `${title} has a runtime of ${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m.`
          : type === 'movie' 
            ? `${title} is a feature-length film. The exact runtime will be displayed in the player once you start watching.`
            : `${title} is a TV series with multiple episodes. Each episode length varies, and you can see episode details in the player.`
      },
      {
        question: `Is ${title} suitable for all ages?`,
        answer: content?.vote_average 
          ? `${title} has a rating of ${content.vote_average.toFixed(1)}/10 based on user reviews. Please check the content rating and description to determine if it's suitable for your viewing preferences.`
          : `Please check the content description and rating information above to determine if ${title} is suitable for your viewing preferences.`
      },
      {
        question: `Can I watch ${title} on mobile devices?`,
        answer: `Yes, ${title} is fully compatible with mobile devices, tablets, and desktop computers. Our responsive player works seamlessly across all devices and screen sizes.`
      }
    ];
  };

  const faqItems = generateFAQItems();

  if (!content) {
    return null;
  }

  return (
    <div className={`content-faq ${className}`}>
      <div className="faq-header">
        <h3 className="faq-title">
          <HelpCircle size={24} />
          Frequently Asked Questions
        </h3>
        <p className="faq-subtitle">
          Common questions about {content.title || content.name}
        </p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className={`faq-item ${expandedItems.has(index) ? 'expanded' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => toggleItem(index)}
              aria-expanded={expandedItems.has(index)}
            >
              <span className="question-text">{item.question}</span>
              <span className="question-icon">
                {expandedItems.has(index) ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </span>
            </button>
            
            <div className="faq-answer">
              <div className="answer-content">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="faq-footer">
        <p className="faq-note">
          Have more questions? Our streaming platform provides the best experience 
          for watching {content.title || content.name} and thousands of other movies and TV shows.
        </p>
      </div>
    </div>
  );
};

export default ContentFAQ;

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FAQSection.css';

const FAQSection = ({ contentType, contentTitle }) => {
  const [openFAQ, setOpenFAQ] = useState(null);

  // Generate FAQ data based on content type
  const getFAQData = () => {
    const commonFAQs = [
      {
        id: 'quality',
        question: 'What video quality is available?',
        answer: 'Our servers provide multiple quality options including HD (720p), Full HD (1080p), and when available, 4K Ultra HD. The quality automatically adjusts based on your internet connection speed.'
      },
      {
        id: 'devices',
        question: 'What devices can I watch on?',
        answer: 'You can watch on any device with a modern web browser including computers, tablets, smartphones, smart TVs, and gaming consoles. No downloads or installations required.'
      },
      {
        id: 'subtitles',
        question: 'Are subtitles available?',
        answer: 'Yes, most content includes multiple subtitle options in various languages. You can enable/disable subtitles and choose your preferred language from the player settings.'
      }
    ];

    const movieFAQs = [
      {
        id: 'duration',
        question: `How long is ${contentTitle}?`,
        answer: 'The runtime information is displayed above. You can pause and resume watching at any time, and your progress will be automatically saved.'
      },
      {
        id: 'download',
        question: 'Can I download this movie?',
        answer: 'Yes, you can download this movie using our download feature. Click the download button in the video player to access offline viewing options.'
      }
    ];

    const tvFAQs = [
      {
        id: 'episodes',
        question: `How many episodes are in ${contentTitle}?`,
        answer: 'You can see all available episodes in the episode selector above the video player. New episodes are added as they become available.'
      },
      {
        id: 'seasons',
        question: 'Are all seasons available?',
        answer: 'We strive to provide all available seasons. You can switch between seasons using the season selector in the video player interface.'
      }
    ];

    const animeFAQs = [
      {
        id: 'language',
        question: 'Is this anime dubbed or subbed?',
        answer: 'Most anime content is available in both dubbed (English voice-over) and subbed (original Japanese with subtitles) versions. You can switch between them in the player settings.'
      },
      {
        id: 'episodes',
        question: `How many episodes are in ${contentTitle}?`,
        answer: 'You can see all available episodes in the episode selector. We update with new episodes as they are released in Japan.'
      }
    ];

    let specificFAQs = [];
    if (contentType === 'movie') {
      specificFAQs = movieFAQs;
    } else if (contentType === 'tv') {
      specificFAQs = tvFAQs;
    } else if (contentType === 'anime') {
      specificFAQs = animeFAQs;
    }

    return [...specificFAQs, ...commonFAQs];
  };

  const faqData = getFAQData();

  const toggleFAQ = (faqId) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  return (
    <div className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">
          <HelpCircle size={24} />
          Frequently Asked Questions
        </h2>
        
        <div className="faq-list">
          {faqData.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button
                className={`faq-question ${openFAQ === faq.id ? 'open' : ''}`}
                onClick={() => toggleFAQ(faq.id)}
                aria-expanded={openFAQ === faq.id}
              >
                <span className="question-text">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`chevron ${openFAQ === faq.id ? 'rotated' : ''}`}
                />
              </button>
              
              {openFAQ === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>
            Still have questions? Our content is sourced from multiple providers to ensure the best viewing experience. 
            If you encounter any issues, try switching between Server 1 and Server 2 in the video player.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;

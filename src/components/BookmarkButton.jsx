import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Button from './Button';
import { analytics } from '../utils';
import './BookmarkButton.css';

const BookmarkButton = ({ 
  content, 
  variant = 'secondary', 
  size = 'medium',
  showText = false,
  className = '' 
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const BOOKMARKS_KEY = 'skystream_bookmarks';

  // Check if content is bookmarked on mount
  useEffect(() => {
    checkBookmarkStatus();
  }, [content.id, content.type]);

  const checkBookmarkStatus = () => {
    try {
      const bookmarks = getBookmarks();
      const isInBookmarks = bookmarks.some(
        item => item.id === content.id && item.type === content.type
      );
      setIsBookmarked(isInBookmarks);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const getBookmarks = () => {
    try {
      const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error reading bookmarks:', error);
      return [];
    }
  };

  const saveBookmarks = (bookmarks) => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
      throw error;
    }
  };

  const addToBookmarks = () => {
    try {
      const bookmarks = getBookmarks();
      
      // Check if already bookmarked
      const exists = bookmarks.some(
        item => item.id === content.id && item.type === content.type
      );
      
      if (exists) {
        return false;
      }
      
      // Create bookmark item
      const bookmarkItem = {
        id: content.id,
        type: content.type,
        title: content.title || content.name,
        poster_path: content.poster_path,
        backdrop_path: content.backdrop_path,
        overview: content.overview,
        vote_average: content.vote_average,
        release_date: content.release_date || content.first_air_date,
        bookmarked_at: new Date().toISOString(),
        ...content // Include any additional fields
      };
      
      bookmarks.unshift(bookmarkItem); // Add to beginning
      saveBookmarks(bookmarks);
      
      return true;
    } catch (error) {
      console.error('Error adding to bookmarks:', error);
      return false;
    }
  };

  const removeFromBookmarks = () => {
    try {
      const bookmarks = getBookmarks();
      const updatedBookmarks = bookmarks.filter(
        item => !(item.id === content.id && item.type === content.type)
      );
      
      saveBookmarks(updatedBookmarks);
      return true;
    } catch (error) {
      console.error('Error removing from bookmarks:', error);
      return false;
    }
  };

  const handleBookmarkToggle = async () => {
    if (loading) return;

    setLoading(true);
    
    try {
      let success = false;
      let action = '';

      if (isBookmarked) {
        success = removeFromBookmarks();
        action = 'removed';
      } else {
        success = addToBookmarks();
        action = 'added';
      }

      if (success) {
        setIsBookmarked(!isBookmarked);
        
        // Track analytics
        analytics.trackEvent('bookmark_toggle', {
          category: 'user_interaction',
          label: `${action}_${content.type}`,
          content_type: content.type,
          content_id: content.id,
          content_title: content.title || content.name,
          action: action
        });

        // Show feedback (could be enhanced with toast notifications)
        console.log(`${action === 'added' ? 'Added to' : 'Removed from'} bookmarks: ${content.title || content.name}`);
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
      analytics.trackError(`Bookmark ${isBookmarked ? 'removal' : 'addition'} failed: ${error.message}`, 'bookmark_error');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isBookmarked 
    ? (showText ? 'Bookmarked' : '') 
    : (showText ? 'Save' : '');

  const buttonIcon = isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />;

  const buttonClass = `bookmark-button ${isBookmarked ? 'bookmarked' : ''} ${className}`;

  return (
    <Button
      variant={isBookmarked ? 'primary' : variant}
      size={size}
      icon={buttonIcon}
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={buttonClass}
      title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      {buttonText}
    </Button>
  );
};

export default BookmarkButton;

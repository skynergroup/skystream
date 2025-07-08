import { useState, useEffect } from 'react';
import { MessageCircle, Star, Send, Trash2, User, Clock } from 'lucide-react';
import Button from './Button';
import './CommentsSection.css';

const CommentsSection = ({ contentId, contentType, contentTitle }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const storageKey = `comments_${contentType}_${contentId}`;

  // Load comments from localStorage
  useEffect(() => {
    try {
      const savedComments = localStorage.getItem(storageKey);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
      
      // Load saved username
      const savedUserName = localStorage.getItem('skystream_username');
      if (savedUserName) {
        setUserName(savedUserName);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Save comments to localStorage
  const saveComments = (updatedComments) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedComments));
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  };

  // Add new comment
  const handleSubmitComment = (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !userName.trim()) {
      return;
    }

    const comment = {
      id: Date.now().toString(),
      userName: userName.trim(),
      text: newComment.trim(),
      rating: newRating,
      timestamp: new Date().toISOString(),
      contentId,
      contentType,
      contentTitle
    };

    const updatedComments = [comment, ...comments];
    saveComments(updatedComments);
    
    // Save username for future use
    localStorage.setItem('skystream_username', userName.trim());
    
    // Reset form
    setNewComment('');
    setNewRating(0);
    setShowCommentForm(false);
  };

  // Delete comment
  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    saveComments(updatedComments);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onStarClick(star) : undefined}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="comments-section loading">
        <div className="loading-placeholder">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3 className="comments-title">
          <MessageCircle size={20} />
          Comments ({comments.length})
        </h3>
        
        {!showCommentForm && (
          <Button 
            variant="primary" 
            size="small"
            onClick={() => setShowCommentForm(true)}
          >
            Add Comment
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="comment-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="rating-label">Your Rating:</label>
            {renderStars(newRating, true, setNewRating)}
          </div>
          
          <div className="form-group">
            <textarea
              placeholder="Share your thoughts about this content..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-textarea"
              rows="4"
              required
            />
          </div>
          
          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              icon={<Send size={16} />}
              disabled={!newComment.trim() || !userName.trim()}
            >
              Post Comment
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setShowCommentForm(false);
                setNewComment('');
                setNewRating(0);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <User size={16} />
                  <span className="user-name">{comment.userName}</span>
                  {comment.rating > 0 && renderStars(comment.rating)}
                </div>
                <div className="comment-meta">
                  <Clock size={14} />
                  <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
                  <button 
                    className="delete-comment"
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="comment-text">{comment.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;

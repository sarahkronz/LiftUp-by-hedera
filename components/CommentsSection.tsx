import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firebase';
import { Comment } from '../types';
import Spinner from './Spinner';
import { Timestamp } from 'firebase/firestore';

interface CommentsSectionProps {
  projectId: string;
}

const timeSince = (timestamp: any): string => {
    
    if (!timestamp) return "Unknown time"; 

    let date: Date;

    if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return "Invalid date"; 
    }

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = firestoreService.getComments(projectId, (fetchedComments) => {
      // Sort newest first
      setComments(fetchedComments.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0); 
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);

    
    return dateB.getTime() - dateA.getTime();
}));
setLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    setError('');

    const tempComment: Comment = {
      id: 'temp-' + Date.now(),
      authorId: user.id,
      authorName: user.name,
      content: newComment,
      createdAt: new Date(),
    };

    // Add temporarily for instant UI feedback
    setComments(prev => [tempComment, ...prev]);
    setNewComment('');

    try {
      await firestoreService.createComment(projectId, {
        authorId: user.id,
        authorName: user.name,
        content: tempComment.content,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to post comment.');
      console.error(err);
      // Remove temporary comment on error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-200">Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} className="flex space-x-4 items-start">
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-navy-900 font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a public comment..."
              rows={3}
              className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              required
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-500 text-navy-900 font-bold py-2 px-4 rounded hover:bg-teal-400 disabled:bg-slate-500 text-sm"
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading && <div className="flex justify-center py-8"><Spinner /></div>}

      {!loading && comments.length === 0 && (
        <div className="text-center py-8 text-slate-400 bg-navy-900/50 rounded-lg">
          No comments yet. Be the first to ask a question!
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="flex space-x-4">
              <div className="w-10 h-10 bg-navy-700 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {comment.authorName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-200 text-sm">
                  {comment.authorName} 
                  <span className="text-xs font-normal text-slate-400 ml-2">{timeSince(comment.createdAt)}</span>
                </p>
                <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;

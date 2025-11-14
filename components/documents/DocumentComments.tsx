'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useAddComment } from '@/lib/hooks/useDocumentGeneration';

interface Comment {
  id: string;
  userId: string;
  content: string;
  position?: any;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentCommentsProps {
  documentId: string;
  comments: Comment[];
  onResolve: (commentId: string) => void;
}

export function DocumentComments({
  documentId,
  comments,
  onResolve
}: DocumentCommentsProps) {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const addComment = useAddComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({
        documentId,
        content: newComment
      });
      setNewComment('');
      setIsAddingComment(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">
            Comments ({unresolvedComments.length})
          </h3>
        </div>
        {!isAddingComment && (
          <Button
            onClick={() => setIsAddingComment(true)}
            size="sm"
            variant="secondary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
        )}
      </div>

      {/* Add Comment Form */}
      <AnimatePresence>
        {isAddingComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl p-4"
          >
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              rows={3}
              className="mb-3"
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsAddingComment(false);
                  setNewComment('');
                }}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || addComment.isPending}
                size="sm"
              >
                {addComment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unresolved Comments */}
      {unresolvedComments.length > 0 && (
        <div className="space-y-3">
          {unresolvedComments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white mb-2">{comment.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onResolve(comment.id)}
                  className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                  title="Resolve comment"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolved Comments */}
      {resolvedComments.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
            Show resolved comments ({resolvedComments.length})
          </summary>
          <div className="mt-3 space-y-3">
            {resolvedComments.map((comment) => (
              <div
                key={comment.id}
                className="backdrop-blur-xl bg-white/5 dark:bg-black/10 border border-white/10 rounded-xl p-4 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-white mb-2 line-through">{comment.content}</p>
                    <p className="text-xs text-gray-400">
                      Resolved on {new Date(comment.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Empty State */}
      {unresolvedComments.length === 0 && !isAddingComment && (
        <div className="text-center py-8 backdrop-blur-xl bg-white/5 dark:bg-black/10 border border-white/10 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No comments yet</p>
        </div>
      )}
    </div>
  );
}

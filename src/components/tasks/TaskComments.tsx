// src/components/tasks/TaskComments.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { GET_TASK_COMMENTS } from '../../graphql/queries';
import { ADD_TASK_COMMENT } from '../../graphql/mutations';
import { TaskComment, AddTaskCommentResponse, AddTaskCommentInput } from '../../types';
import { formatRelativeTime } from '../../lib/utils';

interface TaskCommentsProps {
  taskId: string;
  organizationSlug: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ 
  taskId, 
  organizationSlug 
}) => {
  const [newComment, setNewComment] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const { data, loading, error, refetch } = useQuery<{ taskComments: TaskComment[] }>(
    GET_TASK_COMMENTS,
    {
      variables: { taskId, organizationSlug },
      fetchPolicy: 'cache-and-network',
    }
  );

  const [addComment, { loading: submitting }] = useMutation<AddTaskCommentResponse, AddTaskCommentInput>(
    ADD_TASK_COMMENT
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorEmail.trim()) return;

    try {
      const result = await addComment({
        variables: {
          taskId,
          organizationSlug,
          content: newComment.trim(),
          authorEmail: authorEmail.trim(),
        }
      });

      if (result.data?.addTaskComment?.success) {
        setNewComment('');
        refetch();
      } else {
        console.error('Failed to add comment:', result.data?.addTaskComment?.errors);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">Error loading comments</div>;
  }

  const comments = data?.taskComments || [];

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded-r">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">
                  {comment.authorEmail}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
        <div>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            required
          />
        </div>
        
        <div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="resize-none"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim() || !authorEmail.trim()}
            size="sm"
          >
            {submitting ? (
              'Adding...'
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Add Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
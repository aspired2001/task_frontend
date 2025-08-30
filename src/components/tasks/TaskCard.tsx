// src/components/tasks/TaskCard.tsx
import React, { useState } from 'react';
import { MoreVertical, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TaskForm } from './TaskForm';
import { TaskComments } from './TaskComments';
import { Task } from '../../types';
import { formatRelativeTime, getPriorityColor, cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1 mr-2">
              {task.title}
            </h4>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCommentsDialogOpen(true)}>
                  View Comments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-3 mt-2">
              {task.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Priority Badge */}
          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>

          {/* Assignee */}
          {task.assigneeEmail && (
            <div className="text-xs text-gray-600">
              Assigned to: {task.assigneeEmail}
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center text-xs",
              task.isOverdue ? "text-red-600" : "text-gray-600"
            )}>
              <Calendar className="w-3 h-3 mr-1" />
              {task.isOverdue && <AlertCircle className="w-3 h-3 mr-1" />}
              Due {formatRelativeTime(task.dueDate)}
            </div>
          )}

          {/* Comments Count */}
          {task.commentsCount > 0 && (
            <button 
              onClick={() => setIsCommentsDialogOpen(true)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              {task.commentsCount} comment{task.commentsCount !== 1 ? 's' : ''}
            </button>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            projectId={task.project.id}
            organizationSlug={task.project.organization.slug}
            task={task}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{task.title} - Comments</DialogTitle>
          </DialogHeader>
          <TaskComments 
            taskId={task.id}
            organizationSlug={task.project.organization.slug}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
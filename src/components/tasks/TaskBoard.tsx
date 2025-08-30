// src/components/tasks/TaskBoard.tsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GET_TASKS, GET_PROJECT } from '../../graphql/queries';
import { Task, Project, TaskStatus } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const TASK_COLUMNS = [
  { status: 'TODO' as TaskStatus, title: 'To Do', color: 'border-gray-300' },
  { status: 'IN_PROGRESS' as TaskStatus, title: 'In Progress', color: 'border-blue-300' },
  { status: 'DONE' as TaskStatus, title: 'Done', color: 'border-green-300' },
  { status: 'BLOCKED' as TaskStatus, title: 'Blocked', color: 'border-red-300' },
];

export const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const organizationSlug = process.env.REACT_APP_ORGANIZATION_SLUG || 'acme-corporation';

  const { data: projectData } = useQuery<{ project: Project }>(GET_PROJECT, {
    variables: { id: projectId, organizationSlug },
  });

  const { data: tasksData, loading, error, refetch } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: { 
      organizationSlug,
      projectId: projectId,
    },
    fetchPolicy: 'cache-and-network',
  });

  const handleTaskCreated = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  if (loading && !tasksData) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading tasks: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const tasks = tasksData?.tasks || [];
  const project = projectData?.project;

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {project?.name || 'Task Board'}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage tasks for this project
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm 
              projectId={projectId!}
              organizationSlug={organizationSlug}
              onSuccess={handleTaskCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TASK_COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <div key={column.status} className={`border-t-4 ${column.color} bg-white rounded-lg shadow-sm`}>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-3 min-h-96">
                {columnTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    onUpdate={() => refetch()}
                  />
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
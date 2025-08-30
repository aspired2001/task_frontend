// src/components/tasks/TaskForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { CREATE_TASK, UPDATE_TASK } from '../../graphql/mutations';
import { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  CreateTaskResponse,
  UpdateTaskResponse,
  TaskStatus, 
  TaskPriority 
} from '../../types';

interface TaskFormProps {
  projectId: string;
  organizationSlug: string;
  task?: Task;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeEmail: string;
  dueDate?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  projectId,
  organizationSlug, 
  task, 
  onSuccess 
}) => {
  const isEditing = !!task;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      assigneeEmail: task?.assigneeEmail || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    }
  });

  const [createTask] = useMutation<CreateTaskResponse, { input: CreateTaskInput }>(
    CREATE_TASK,
    {
      onError: (error) => {
        console.error('GraphQL Error (Create):', error);
        setSubmitError(`Network error: ${error.message}`);
      }
    }
  );

  const [updateTask] = useMutation<UpdateTaskResponse, { input: UpdateTaskInput }>(
    UPDATE_TASK,
    {
      onError: (error) => {
        console.error('GraphQL Error (Update):', error);
        setSubmitError(`Network error: ${error.message}`);
      }
    }
  );

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setIsSubmitSuccessful(false);

    try {
      if (isEditing && task) {
        const input: UpdateTaskInput = {
          id: task.id,
          organizationSlug,
          ...data,
          dueDate: data.dueDate || undefined,
        };
        
        const result = await updateTask({ variables: { input } });
        
        if (result.data?.updateTask?.success) {
          setIsSubmitSuccessful(true);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          const errors = result.data?.updateTask?.errors || ['Unknown error occurred'];
          setSubmitError(`Update failed: ${errors.join(', ')}`);
        }
      } else {
        const input: CreateTaskInput = {
          projectId,
          organizationSlug,
          ...data,
          dueDate: data.dueDate || undefined,
        };
        
        const result = await createTask({ variables: { input } });
        
        if (result.data?.createTask?.success) {
          setIsSubmitSuccessful(true);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else {
          const errors = result.data?.createTask?.errors || ['Unknown error occurred'];
          setSubmitError(`Creation failed: ${errors.join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = `Server error: ${error.graphQLErrors[0].message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-blue-600';
      case 'LOW': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'text-emerald-600';
      case 'IN_PROGRESS': return 'text-blue-600';
      case 'BLOCKED': return 'text-red-600';
      case 'TODO': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Update task details below' : 'Fill in the details to create a new task'}
        </p>
      </div>

      {/* Success Message */}
      {isSubmitSuccessful && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-emerald-700 font-medium">
            {isEditing ? 'Task updated successfully!' : 'Task created successfully!'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-700">Error</p>
            <p className="text-sm text-red-600 mt-1">{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Task Title */}
        <div className="space-y-3">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Task Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            {...register('title', { required: 'Task title is required' })}
            placeholder="Enter a clear, actionable task title"
            className={`h-12 px-4 text-base border-2 rounded-xl transition-all duration-200 focus:ring-0 ${
              errors.title 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Provide additional context or requirements for this task..."
            rows={4}
            className="px-4 py-3 text-base border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-0 focus:border-blue-500 hover:border-gray-300 resize-none"
          />
        </div>

        {/* Status and Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <select
              id="status"
              {...register('status')}
              className="w-full h-12 px-4 text-base bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300"
              title="Select task status"
            >
              <option value="TODO">📝 To Do</option>
              <option value="IN_PROGRESS">⚡ In Progress</option>
              <option value="DONE">✅ Done</option>
              <option value="BLOCKED">🚫 Blocked</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
              Priority
            </Label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full h-12 px-4 text-base bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300"
              title="Select task priority"
            >
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🟠 High</option>
              <option value="URGENT">🔴 Urgent</option>
            </select>
          </div>
        </div>

        {/* Assignee and Due Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="assigneeEmail" className="text-sm font-medium text-gray-700">
              Assignee Email
            </Label>
            <Input
              id="assigneeEmail"
              type="email"
              {...register('assigneeEmail')}
              placeholder="user@example.com"
              className="h-12 px-4 text-base border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-0 focus:border-blue-500 hover:border-gray-300"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
              Due Date & Time
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              {...register('dueDate')}
              className="h-12 px-4 text-base border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-0 focus:border-blue-500 hover:border-gray-300"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-8 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isSubmitting || isSubmitSuccessful}
            className={`w-full h-12 text-base font-medium rounded-xl transition-all duration-200 ${
              isSubmitSuccessful 
                ? 'bg-emerald-600 hover:bg-emerald-600' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            } text-white disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : isSubmitSuccessful ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Saved!
              </span>
            ) : (
              isEditing ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
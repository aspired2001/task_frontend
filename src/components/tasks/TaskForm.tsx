// src/components/tasks/TaskForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
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
    CREATE_TASK
  );

  const [updateTask] = useMutation<UpdateTaskResponse, { input: UpdateTaskInput }>(
    UPDATE_TASK
  );

  const onSubmit = async (data: FormData) => {
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
          onSuccess();
        } else {
          console.error('Update failed:', result.data?.updateTask?.errors);
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
          onSuccess();
        } else {
          console.error('Creation failed:', result.data?.createTask?.errors);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          {...register('title', { required: 'Task title is required' })}
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="Select task status"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            {...register('priority')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="Select task priority"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="assigneeEmail">Assignee Email</Label>
        <Input
          id="assigneeEmail"
          type="email"
          {...register('assigneeEmail')}
          placeholder="Enter assignee email"
        />
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="datetime-local"
          {...register('dueDate')}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};
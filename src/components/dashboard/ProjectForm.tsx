// src/components/dashboard/ProjectForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { CREATE_PROJECT, UPDATE_PROJECT } from '../../graphql/mutations';
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput,
  CreateProjectResponse,
  UpdateProjectResponse
} from '../../types';

interface ProjectFormProps {
  organizationSlug: string;
  project?: Project;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  dueDate?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
  organizationSlug, 
  project, 
  onSuccess,
  onCancel 
}) => {
  const isEditing = !!project;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<FormData>({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'ACTIVE',
      dueDate: project?.dueDate || '',
    }
  });

  const [createProject] = useMutation<CreateProjectResponse, { input: CreateProjectInput }>(
    CREATE_PROJECT,
    {
      onError: (error) => {
        console.error('GraphQL Error (Create):', error);
        setSubmitError(`Network error: ${error.message}`);
      }
    }
  );

  const [updateProject] = useMutation<UpdateProjectResponse, { input: UpdateProjectInput }>(
    UPDATE_PROJECT,
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

    // Client-side validation
    if (!organizationSlug) {
      setSubmitError('No organization selected. Please refresh the page and try again.');
      return;
    }

    if (!data.name.trim()) {
      setSubmitError('Project name is required.');
      return;
    }

    try {
      if (isEditing && project) {
        console.log('Updating project:', { id: project.id, organizationSlug, data });
        
        const input: UpdateProjectInput = {
          id: project.id,
          organizationSlug,
          name: data.name.trim(),
          description: data.description.trim(),
          status: data.status,
          dueDate: data.dueDate || undefined,
        };
        
        const result = await updateProject({ variables: { input } });
        console.log('Update result:', result);
        
        if (result.data?.updateProject?.success) {
          setIsSubmitSuccessful(true);
          setTimeout(() => {
            onSuccess();
          }, 1000); // Brief delay to show success message
        } else {
          const errors = result.data?.updateProject?.errors || ['Unknown error occurred'];
          setSubmitError(`Update failed: ${errors.join(', ')}`);
        }
      } else {
        console.log('Creating project:', { organizationSlug, data });
        
        const input: CreateProjectInput = {
          organizationSlug,
          name: data.name.trim(),
          description: data.description.trim(),
          status: data.status,
          dueDate: data.dueDate || undefined,
        };
        
        const result = await createProject({ variables: { input } });
        console.log('Create result:', result);
        
        if (result.data?.createProject?.success) {
          setIsSubmitSuccessful(true);
          setTimeout(() => {
            onSuccess();
          }, 1000); // Brief delay to show success message
        } else {
          const errors = result.data?.createProject?.errors || ['Unknown error occurred'];
          setSubmitError(`Creation failed: ${errors.join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Parse different types of errors
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

  // Watch form values for debugging
  const watchedValues = watch();
  if (process.env.REACT_APP_DEBUG_MODE === 'true') {
    console.log('Form state:', { 
      organizationSlug, 
      isEditing, 
      project: project?.id, 
      values: watchedValues,
      errors 
    });
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {isSubmitSuccessful && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {isEditing ? 'Project updated successfully!' : 'Project created successfully!'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{submitError}</p>
          </div>
        </div>
      )}

      {/* Organization Info */}
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Organization:</strong> {organizationSlug}
        </p>
        {isEditing && project && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>Project ID:</strong> {project.id}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            {...register('name', { 
              required: 'Project name is required',
              minLength: { value: 2, message: 'Project name must be at least 2 characters' },
              maxLength: { value: 200, message: 'Project name must be less than 200 characters' }
            })}
            placeholder="Enter project name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
            })}
            placeholder="Enter project description (optional)"
            rows={3}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            title="Select project status"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            min={new Date().toISOString().split('T')[0]} // Prevent past dates for new projects
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || isSubmitSuccessful}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : isSubmitSuccessful ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </span>
            ) : (
              isEditing ? 'Update Project' : 'Create Project'
            )}
          </Button>
        </div>
      </form>

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({
              organizationSlug,
              isEditing,
              projectId: project?.id,
              formValues: watchedValues,
              formErrors: errors,
              submitError,
              isSubmitSuccessful
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
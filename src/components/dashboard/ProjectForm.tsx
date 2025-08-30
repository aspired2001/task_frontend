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
    <div className="max-w-2xl mx-auto p-8 bg-white">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Update project details below' : 'Fill in the details to create a new project'}
        </p>
      </div>

      {/* Success Message */}
      {isSubmitSuccessful && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-emerald-700 font-medium">
            {isEditing ? 'Project updated successfully!' : 'Project created successfully!'}
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

      {/* Organization Info */}
      <div className="p-4 mb-8 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Organization</p>
            <p className="text-gray-900 font-medium">{organizationSlug}</p>
          </div>
          {isEditing && project && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Project ID</p>
              <p className="text-gray-900 font-mono text-sm">{project.id}</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Name */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Project Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', { 
              required: 'Project name is required',
              minLength: { value: 2, message: 'Project name must be at least 2 characters' },
              maxLength: { value: 200, message: 'Project name must be less than 200 characters' }
            })}
            placeholder="Enter a descriptive project name"
            className={`h-12 px-4 text-base border-2 rounded-xl transition-all duration-200 focus:ring-0 ${
              errors.name 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.name.message}
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
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
            })}
            placeholder="Describe what this project is about..."
            rows={4}
            className={`px-4 py-3 text-base border-2 rounded-xl transition-all duration-200 focus:ring-0 resize-none ${
              errors.description 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status and Due Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <select
              id="status"
              {...register('status')}
              className="w-full h-12 px-4 text-base bg-white border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:border-blue-500 hover:border-gray-300"
              title="Select project status"
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates for new projects
              className="h-12 px-4 text-base border-2 border-gray-200 rounded-xl transition-all duration-200 focus:ring-0 focus:border-blue-500 hover:border-gray-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-12 px-6 text-base border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || isSubmitSuccessful}
            className={`h-12 px-8 text-base font-medium rounded-xl transition-all duration-200 min-w-[140px] ${
              isSubmitSuccessful 
                ? 'bg-emerald-600 hover:bg-emerald-600' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            } text-white disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : isSubmitSuccessful ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
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
        <details className="mt-8 text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700 transition-colors">
            Debug Info
          </summary>
          <pre className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs overflow-auto font-mono">
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
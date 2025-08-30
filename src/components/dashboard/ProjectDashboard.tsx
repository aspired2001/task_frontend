// src/components/dashboard/ProjectDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectStats } from './ProjectStats';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { GET_PROJECTS, GET_ORGANIZATIONS } from '../../graphql/queries';
import { Project, ProjectStatus, Organization } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

export const ProjectDashboard: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  // Get all organizations first
  const { 
    data: organizationsData, 
    loading: organizationsLoading,
    error: organizationsError 
  } = useQuery<{ organizations: Organization[] }>(GET_ORGANIZATIONS);

  // Set default organization when organizations load
  useEffect(() => {
    if (organizationsData?.organizations?.length && !selectedOrganization) {
      // Try to use the env variable first, otherwise use the first available organization
      const defaultSlug = process.env.REACT_APP_ORGANIZATION_SLUG;
      const availableOrg = organizationsData.organizations.find(org => org.slug === defaultSlug) 
        || organizationsData.organizations[0];
      
      if (availableOrg) {
        setSelectedOrganization(availableOrg.slug);
      }
    }
  }, [organizationsData, selectedOrganization]);

  // Get projects for selected organization
  const { data, loading, error, refetch } = useQuery<{ projects: Project[] }>(GET_PROJECTS, {
    variables: { 
      organizationSlug: selectedOrganization,
      status: statusFilter || undefined
    },
    fetchPolicy: 'cache-and-network',
    skip: !selectedOrganization, // Don't run query until we have an organization
  });

  const handleProjectCreated = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  const handleOrganizationChange = (newOrgSlug: string) => {
    setSelectedOrganization(newOrgSlug);
    setStatusFilter(''); // Reset filters when changing organization
  };

  // Show loading state while organizations are loading
  if (organizationsLoading) {
    return <LoadingSpinner />;
  }

  // Show error if organizations failed to load
  if (organizationsError) {
    return (
      <div className="text-center text-red-600 p-8">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p>Error loading organizations: {organizationsError.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reload Page
        </Button>
      </div>
    );
  }

  // Show message if no organizations exist
  if (!organizationsData?.organizations?.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No organizations found
        </h3>
        <p className="text-gray-500 mb-4">
          You need to create an organization first before managing projects
        </p>
        <Button onClick={() => {
          // Navigate to organization creation page or show modal
          console.log('Navigate to create organization');
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>
    );
  }

  // Show loading state while projects are loading
  if (loading && !data) {
    return <LoadingSpinner />;
  }

  // Show error if projects failed to load
  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Error loading projects: {error.message}</p>
        {selectedOrganization && (
          <p className="text-sm text-gray-500 mt-2">
            Organization: {selectedOrganization}
          </p>
        )}
        <div className="mt-4 space-x-2">
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
          {organizationsData?.organizations?.length > 1 && (
            <Button 
              onClick={() => setSelectedOrganization('')}
              variant="outline"
            >
              Change Organization
            </Button>
          )}
        </div>
      </div>
    );
  }

  const projects = data?.projects || [];
  const currentOrganization = organizationsData?.organizations?.find(
    org => org.slug === selectedOrganization
  );

  return (
    <div className="space-y-8">
      {/* Header with Organization Selector */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            {organizationsData?.organizations?.length > 1 && (
              <select
                value={selectedOrganization}
                onChange={(e) => handleOrganizationChange(e.target.value)}
                className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                title="Select organization"
              >
                <option value="">Select Organization</option>
                {organizationsData.organizations.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <p className="text-gray-600">
            {currentOrganization ? (
              <>Manage and track projects for <strong>{currentOrganization.name}</strong></>
            ) : (
              'Manage and track your projects and tasks'
            )}
          </p>
          
          {currentOrganization && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{currentOrganization.projectsCount} total projects</span>
              <span>{currentOrganization.activeProjectsCount} active</span>
              <span>Contact: {currentOrganization.contactEmail}</span>
            </div>
          )}
        </div>
        
        {selectedOrganization && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm 
                organizationSlug={selectedOrganization}
                onSuccess={handleProjectCreated}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedOrganization && (
        <>
          {/* Stats */}
          <ProjectStats organizationSlug={selectedOrganization} />

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter ? 
                  `No ${statusFilter.toLowerCase()} projects found for ${currentOrganization?.name}` :
                  `Get started by creating your first project for ${currentOrganization?.name}`
                }
              </p>
              {!statusFilter && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
              {statusFilter && (
                <Button 
                  onClick={() => setStatusFilter('')}
                  variant="outline"
                >
                  Show All Projects
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onUpdate={() => refetch()}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
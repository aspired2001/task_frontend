// src/components/dashboard/ProjectCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Calendar, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ProjectForm } from './ProjectForm';
import { Project } from '../../types';
import { formatDate, getStatusColor, cn } from '../../lib/utils';
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

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleViewTasks = () => {
    navigate(`/projects/${project.id}/tasks`);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  const completionRate = project.completionRate || 0;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {project.name}
              </h3>
              <Badge className={cn("text-xs", getStatusColor(project.status))}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewTasks}>
                  View Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                {project.completedTaskCount}/{project.taskCount} tasks
              </div>
              {project.overdueTasksCount > 0 && (
                <div className="flex items-center text-red-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {project.overdueTasksCount} overdue
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex justify-between items-center w-full">
            {project.dueDate && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Due {formatDate(project.dueDate)}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewTasks}
              className="ml-auto"
            >
              View Tasks
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            organizationSlug={project.organization.slug}
            project={project}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
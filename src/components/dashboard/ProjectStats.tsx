// src/components/dashboard/ProjectStats.tsx
import React from 'react';
import { useQuery } from '@apollo/client/react';
import { BarChart3, CheckCircle, Clock, FolderOpen, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { GET_PROJECT_STATS } from '../../graphql/queries';
import { ProjectStats as ProjectStatsType } from '../../types';

interface ProjectStatsProps {
  organizationSlug: string;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ organizationSlug }) => {
  const { data, loading, error } = useQuery<{ projectStats: ProjectStatsType }>(
    GET_PROJECT_STATS,
    {
      variables: { organizationSlug },
      fetchPolicy: 'cache-and-network',
    }
  );

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.projectStats) {
    return null;
  }

  const stats = data.projectStats;

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderOpen,
      description: `${stats.activeProjects} active projects`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: CheckCircle,
      description: `${stats.completedTasks} completed`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Completion Rate',
      value: `${stats.overallCompletionRate}%`,
      icon: BarChart3,
      description: 'Overall progress',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: AlertCircle,
      description: 'Need attention',
      color: stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.overdueTasks > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
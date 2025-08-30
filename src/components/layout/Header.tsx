// src/components/layout/Header.tsx
import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Building2, Bell, Settings } from 'lucide-react';
import { GET_ORGANIZATION } from '../../graphql/queries';
import { Organization } from '../../types';

export const Header: React.FC = () => {
  const organizationSlug = process.env.REACT_APP_ORGANIZATION_SLUG || 'acme-corporation';
  
  const { data } = useQuery<{ organization: Organization }>(GET_ORGANIZATION, {
    variables: { slug: organizationSlug },
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[95rem]  px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {data?.organization?.name || 'Project Management'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {data?.organization?.name?.charAt(0) || 'P'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
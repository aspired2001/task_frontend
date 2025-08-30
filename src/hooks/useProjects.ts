// src/hooks/useProjects.ts
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROJECTS } from '../graphql/queries';
import { CREATE_PROJECT, UPDATE_PROJECT } from '../graphql/mutations';
import { Project, ProjectStatus } from '../types';

export const useProjects = (organizationSlug: string, status?: ProjectStatus) => {
    const query = useQuery<{ projects: Project[] }>(GET_PROJECTS, {
        variables: { organizationSlug, status },
        fetchPolicy: 'cache-and-network',
    });

    const [createProject] = useMutation(CREATE_PROJECT);
    const [updateProject] = useMutation(UPDATE_PROJECT);

    return {
        ...query,
        createProject,
        updateProject,
    };
};

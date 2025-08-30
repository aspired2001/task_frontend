// src/hooks/useTasks.ts
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TASKS } from '../graphql/queries';
import { CREATE_TASK, UPDATE_TASK } from '../graphql/mutations';
import { Task, TaskStatus } from '../types';

export const useTasks = (
    organizationSlug: string,
    projectId?: string,
    status?: TaskStatus,
    assigneeEmail?: string
) => {
    const query = useQuery<{ tasks: Task[] }>(GET_TASKS, {
        variables: { organizationSlug, projectId, status, assigneeEmail },
        fetchPolicy: 'cache-and-network',
    });

    const [createTask] = useMutation(CREATE_TASK);
    const [updateTask] = useMutation(UPDATE_TASK);

    return {
        ...query,
        createTask,
        updateTask,
    };
};
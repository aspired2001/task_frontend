// src/hooks/useComments.ts
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TASK_COMMENTS } from '../graphql/queries';
import { ADD_TASK_COMMENT } from '../graphql/mutations';
import { TaskComment } from '../types';

export const useComments = (taskId: string, organizationSlug: string) => {
    const query = useQuery<{ taskComments: TaskComment[] }>(GET_TASK_COMMENTS, {
        variables: { taskId, organizationSlug },
        fetchPolicy: 'cache-and-network',
    });

    const [addComment] = useMutation(ADD_TASK_COMMENT);

    return {
        ...query,
        addComment,
    }
};
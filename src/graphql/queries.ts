// src/graphql/queries.ts
import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      isActive
      projectsCount
      activeProjectsCount
      createdAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      isActive
      projectsCount
      activeProjectsCount
      createdAt
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String!, $status: String) {
    projects(organizationSlug: $organizationSlug, status: $status) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTaskCount
      completionRate
      overdueTasksCount
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!, $organizationSlug: String!) {
    project(id: $id, organizationSlug: $organizationSlug) {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTaskCount
      completionRate
      overdueTasksCount
      createdAt
      updatedAt
      organization {
        id
        name
        slug
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks(
    $organizationSlug: String!
    $projectId: ID
    $status: String
    $assigneeEmail: String
  ) {
    tasks(
      organizationSlug: $organizationSlug
      projectId: $projectId
      status: $status
      assigneeEmail: $assigneeEmail
    ) {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      isOverdue
      commentsCount
      createdAt
      updatedAt
      project {
        id
        name
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!, $organizationSlug: String!) {
    task(id: $id, organizationSlug: $organizationSlug) {
      id
      title
      description
      status
      priority
      assigneeEmail
      dueDate
      isOverdue
      commentsCount
      createdAt
      updatedAt
      project {
        id
        name
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: ID!, $organizationSlug: String!) {
    taskComments(taskId: $taskId, organizationSlug: $organizationSlug) {
      id
      content
      authorEmail
      createdAt
      updatedAt
      task {
        id
        title
      }
    }
  }
`;

export const GET_PROJECT_STATS = gql`
  query GetProjectStats($organizationSlug: String!) {
    projectStats(organizationSlug: $organizationSlug) {
      totalProjects
      activeProjects
      completedProjects
      totalTasks
      completedTasks
      overdueTasks
      overallCompletionRate
    }
  }
`;
// src/graphql/mutations.ts
import { gql } from '@apollo/client';

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($name: String!, $contactEmail: String!, $slug: String) {
    createOrganization(name: $name, contactEmail: $contactEmail, slug: $slug) {
      success
      errors
      organization {
        id
        name
        slug
        contactEmail
        isActive
        createdAt
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      success
      errors
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTaskCount
        completionRate
        createdAt
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      success
      errors
      project {
        id
        name
        description
        status
        dueDate
        taskCount
        completedTaskCount
        completionRate
        updatedAt
        organization {
          id
          name
          slug
        }
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      success
      errors
      task {
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
        project {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      success
      errors
      task {
        id
        title
        description
        status
        priority
        assigneeEmail
        dueDate
        isOverdue
        commentsCount
        updatedAt
        project {
          id
          name
        }
      }
    }
  }
`;

export const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment(
    $taskId: ID!
    $organizationSlug: String!
    $content: String!
    $authorEmail: String!
  ) {
    addTaskComment(
      taskId: $taskId
      organizationSlug: $organizationSlug
      content: $content
      authorEmail: $authorEmail
    ) {
      success
      errors
      comment {
        id
        content
        authorEmail
        createdAt
        task {
          id
          title
        }
      }
    }
  }
`;
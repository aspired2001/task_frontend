# Project Management System - Frontend

This project is a **React + TypeScript frontend** for a multi-tenant project management system with **GraphQL integration**.  
It uses **Apollo Client**, **TailwindCSS**, **ShadCN UI**, and **React Hook Form with Zod** for form validation.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.  
You can run tests with coverage using:

```bash
npm test -- --coverage
See the section about running tests for more information.

npm run build
Builds the app for production to the build folder.
It bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about deployment for more information.

npm run lint
Runs ESLint to check for code quality issues.

npm run type-check
Runs TypeScript in type-check mode to verify type safety.

Environment Configuration
Before running the app, create a .env file in the root directory with the following variables:

env
Copy code
REACT_APP_GRAPHQL_URI=http://localhost:8000/graphql/
REACT_APP_ORGANIZATION_SLUG=tech-startup
Project Structure
bash
Copy code
src/
├── components/       # UI, layout, dashboard, tasks, common
├── lib/              # Apollo client, utils, classNames
├── hooks/            # Custom hooks
├── types/            # TypeScript definitions
├── graphql/          # GraphQL queries & mutations
├── App.tsx           # Main app component
└── index.tsx         # Entry point
Features
📊 Project Dashboard – list projects, create & edit projects, status indicators

✅ Task Management – board/list view, assignees, due dates, statuses (TODO, IN_PROGRESS, DONE)

💬 Comments System – add comments, author tracking, real-time updates

🎨 UI/UX – TailwindCSS + ShadCN UI, responsive design, error handling, form validation

🚀 Apollo Client – caching, error handling, optimistic updates

Learn More
You can learn more in the following documentation:

React Documentation

Apollo Client Documentation

TailwindCSS Documentation

ShadCN UI Documentation

To learn React, check out the React documentation

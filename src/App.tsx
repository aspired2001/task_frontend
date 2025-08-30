// src/App.tsx
import React from 'react';
import {ApolloProvider } from '@apollo/client/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { client } from './lib/apollo';
import { Layout } from './components/layout/Layout';
import { ProjectDashboard } from './components/dashboard/ProjectDashboard';
import { TaskBoard } from './components/tasks/TaskBoard';
import './index.css';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ProjectDashboard />} />
            <Route path="/projects/:projectId/tasks" element={<TaskBoard />} />
          </Routes>
        </Layout>
      </Router>
    </ApolloProvider>
  );
}

export default App;
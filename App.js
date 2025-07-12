import React from 'react';
import AppNavigator from './AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ProjectProvider } from './src/context/ProjectContext';

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppNavigator />
      </ProjectProvider>
    </AuthProvider>
  );
}

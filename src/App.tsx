import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import ContentManager from './components/Content/ContentManager';
import { ContentType } from './types';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<ContentType | 'dashboard'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'sermons':
        return 'Sermons';
      case 'events':
        return 'Events';
      case 'announcements':
        return 'Announcements';
      case 'pages':
        return 'Pages';
      case 'gallery':
        return 'Gallery';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={logout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} title={getSectionTitle()} />
        
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' ? (
            <Dashboard />
          ) : (
            <ContentManager activeSection={activeSection as ContentType} />
          )}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
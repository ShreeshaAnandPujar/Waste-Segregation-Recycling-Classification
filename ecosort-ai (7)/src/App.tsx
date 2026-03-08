import { useState } from 'react';
import { Layout } from './components/Layout';
import { Scanner } from './components/Scanner';
import { Uploader } from './components/Uploader';
import { Dashboard } from './components/Dashboard';
import { Collectors } from './components/Collectors';
import { Chatbot } from './components/Chatbot';
import { History } from './components/History';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'upload' | 'dashboard' | 'collectors' | 'chatbot' | 'history'>('scanner');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'scanner' && <Scanner />}
      {activeTab === 'upload' && <Uploader />}
      {activeTab === 'collectors' && <Collectors />}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'chatbot' && <Chatbot />}
      {activeTab === 'history' && <History />}
    </Layout>
  );
}

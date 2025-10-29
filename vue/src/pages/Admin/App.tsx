import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { OrdersList } from './components/OrdersList';
import { EmployeesPage } from './components/EmployeesPage';
import { MenuPage } from './components/MenuPage';
import { PromotionsPage } from './components/PromotionsPage';
import { ReclamationsPage } from './components/ReclamationsPage';
import { SettingsPage } from './components/SettingsPage';
import { ReportsPage } from './components/ReportsPage';
import { LegalPage } from './components/LegalPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Menu } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'orders' && <OrdersList />}
          {activeView === 'employees' && <EmployeesPage />}
          {activeView === 'menu' && <MenuPage />}
          {activeView === 'promotions' && <PromotionsPage />}
          {activeView === 'reclamations' && <ReclamationsPage />}
          {activeView === 'parametres' && <SettingsPage />}
          {activeView === 'rapports' && <ReportsPage />}
          {activeView === 'mentions' && <LegalPage />}
        </main>
      </div>
    </div>
  );
}

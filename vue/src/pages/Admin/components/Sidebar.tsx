import { LayoutDashboard, Users, UtensilsCrossed, Tag, AlertTriangle, Settings, BarChart3, FileText, ShoppingCart } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'employees', label: 'Gestion Employés', icon: Users },
  { id: 'menu', label: 'Gestion Menu', icon: UtensilsCrossed },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'reclamations', label: 'Réclamations', icon: AlertTriangle },
  { id: 'rapports', label: 'Rapports', icon: BarChart3 },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
  { id: 'mentions', label: 'Mentions Légales', icon: FileText },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 bg-black h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#cfbd97] rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400">Restaurant Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-[#cfbd97] text-black' 
                  : 'bg-[#cfbd97] text-black hover:bg-[#c2b07f]'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

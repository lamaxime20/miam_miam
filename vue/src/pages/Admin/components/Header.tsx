import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, User, LogOut, Settings, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { getAuthInfo, logout } from '../../../services/user';

interface Notification {
  id: string;
  type: 'commande' | 'reclamation' | 'systeme';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
}

interface AdminProfile {
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

const LoadingOverlay = ({ visible, message }: { visible: boolean; message: string }) => {
  if (!visible) return null;
  return (
    <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        flexDirection: 'column',
        color: 'white',
        fontSize: '1.2em'
    }}>
        <div className="loader" style={{
            border: '6px solid #f3f3f3',
            borderTop: '6px solid #cfbd97',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            marginBottom: '15px'
        }}></div>
        <p>{message}</p>
        <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
    </div>
  );
};

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const utilisateur = getAuthInfo();
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: 'Admin',
    role: 'Administrateur',
    email: utilisateur.display_name,
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Charger les notifications
  useEffect(() => {
    loadNotifications();
    loadMessages();
    loadAdminProfile();
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/notifications');
      // const data = await response.json();
      // setNotifications(data);

      // DONNÉES MOCKÉES (à remplacer)
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'commande',
          title: 'Nouvelle commande',
          message: 'Commande #CMD-1290 reçue',
          time: 'Il y a 5 min',
          read: false,
        },
        {
          id: '2',
          type: 'reclamation',
          title: 'Nouvelle réclamation',
          message: 'Client insatisfait - Commande froide',
          time: 'Il y a 15 min',
          read: false,
        },
        {
          id: '3',
          type: 'systeme',
          title: 'Mise à jour système',
          message: 'Nouvelle version disponible',
          time: 'Il y a 1h',
          read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const loadMessages = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/messages');
      // const data = await response.json();
      // setMessages(data);

      // DONNÉES MOCKÉES (à remplacer)
      const mockMessages: Message[] = [
        {
          id: '1',
          from: 'Marie Dubois',
          subject: 'Question sur ma commande',
          preview: 'Bonjour, je voudrais savoir...',
          time: 'Il y a 10 min',
          read: false,
        },
        {
          id: '2',
          from: 'Pierre Martin',
          subject: 'Demande de remboursement',
          preview: 'Ma commande n\'est pas arrivée...',
          time: 'Il y a 30 min',
          read: false,
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const loadAdminProfile = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // const response = await fetch('/api/admin/profile');
      // const data = await response.json();
      // setAdminProfile(data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      // TODO: Remplacer par un appel API réel
      // await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // TODO: Remplacer par un appel API réel
      // await fetch('/api/admin/notifications/read-all', { method: 'POST' });

      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      navigate('/'); // Redirige vers la page d'accueil/login
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      alert('Une erreur est survenue lors de la déconnexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  return (
    <>
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl">Dashboard Administrateur</h1>
          <p className="text-sm text-gray-500">Vue d'ensemble du système</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadNotifications}
                    </Badge>
                  </>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadNotifications > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-[#cfbd97] hover:text-[#bfad87]"
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {/* Messages */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Mail className="h-5 w-5 text-gray-600" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold">Messages</h3>
              </div>
              <ScrollArea className="h-[300px]">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Aucun message
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                        !msg.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{msg.from}</p>
                          <p className="text-xs text-gray-600 mt-1">{msg.subject}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.preview}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                        </div>
                        {!msg.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="hidden md:flex items-center gap-3 ml-2 cursor-pointer hover:opacity-80">
                <div className="text-right">
                  <p className="text-sm">{adminProfile.name}</p>
                  <p className="text-xs text-gray-500">{adminProfile.role}</p>
                </div>
                <div className="w-10 h-10 bg-[#cfbd97] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-black" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{adminProfile.name}</p>
                  <p className="text-xs text-gray-500">{adminProfile.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mon profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoading ? 'Déconnexion...' : 'Se déconnecter'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    <LoadingOverlay visible={isLoading} message="Déconnexion en cours..." />
    </>
  );
}

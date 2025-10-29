import { useState, useEffect } from 'react';
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
import { recupererAuth, getUserByEmail } from '../../../services/user';
import { logout } from '../../../services/login';
import { useNavigate } from 'react-router-dom';

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

export function Header() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: '',
    role: 'Administrateur',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const navigate = useNavigate();

  // Charger le profil administrateur
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        setIsProfileLoading(true);
        const auth = recupererAuth();
        
        if (auth && auth.email) {
          const user = await getUserByEmail(auth.email);
          console.log('User data:', user);
          
          setAdminProfile({
            name: user.nom_user || auth.display_name || 'Administrateur',
            role: 'Administrateur',
            email: auth.email,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Fallback en cas d'erreur
        const auth = recupererAuth();
        setAdminProfile({
          name: auth.display_name || 'Administrateur',
          role: 'Administrateur',
          email: auth.email || '',
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadAdminProfile();
    loadNotifications();
    loadMessages();
  }, []);

  const loadNotifications = async () => {
    try {
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

  const markNotificationAsRead = async (id: string) => {
    try {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await logout();
      if (!result?.success) {
        console.warn('Déconnexion côté client effectuée, mais erreur serveur:', result?.message);
      }
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => !m.read).length;

  if (isProfileLoading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl">Dashboard Administrateur</h1>
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        </div>
      </header>
    );
  }

  return (
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
  );
}
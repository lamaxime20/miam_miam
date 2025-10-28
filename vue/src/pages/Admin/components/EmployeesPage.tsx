import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getEmployees, createEmployee } from '../../../services/GestionEmploye.js';
import { Search, Eye, Edit, Trash2, Plus, Users, CheckCircle, Calendar, UserPlus } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'active' | 'inactive';
  hireDate: string;
  avatar?: string;
  phone?: string;
}

const statusConfig = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-200' },
  inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [isLoading, setIsLoading] = useState(true);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'employe' | 'gerant' | 'livreur'>('employe');
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await getEmployees(1);
        setEmployees(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Appel initial pour charger les employés
    fetchEmployees();
  }, []);

  // Fonction pour recharger les employés après une action (création, suppression, etc.)
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await getEmployees(1); // Supposons que l'ID du restaurant est 1
      setEmployees(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      setFormError(null); // Réinitialiser les erreurs avant une nouvelle tentative
      setIsLoading(true);
      await createEmployee({
        email: newEmployeeEmail,
        role: newEmployeeRole,
        restaurant: 1,
      });
      await fetchEmployees(); // Recharger la liste des employés après la création
      setShowAddDialog(false);
      resetAddForm(); // Réinitialiser le formulaire après succès
    } catch (error) {
      setFormError(error.message || 'Une erreur inconnue est survenue lors de la création.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    newThisMonth: employees.filter(e => {
      const hireDate = new Date(e.hireDate);
      const now = new Date();
      return hireDate.getMonth() === now.getMonth() && hireDate.getFullYear() === now.getFullYear();
    }).length,
  };


  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    setSelectedEmployee(null);
  };

  const resetAddForm = () => {
    setNewEmployeeEmail('');
    setNewEmployeeRole('employe');
    setFormError(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-gray-200 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-gray-200 p-6 h-96 animate-pulse"></Card>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Employés</p>
                  <p className="text-3xl">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Employés Actifs</p>
                  <p className="text-3xl">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Inactifs</p>
                  <p className="text-3xl">{stats.inactive}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Nouveaux ce mois</p>
                  <p className="text-3xl">{stats.newThisMonth}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <UserPlus className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees List */}
        <Card className="border-gray-200">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl">Liste des Employés</h2>
                <p className="text-sm text-gray-500">Gérez les informations de vos employés</p>
              </div>
              <Button 
                className="bg-[#cfbd97] hover:bg-[#bfad87] text-black gap-2"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Créer un employé
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Employé</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date d'embauche</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Aucun employé trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback className="bg-[#cfbd97] text-black">
                                  {getInitials(employee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{employee.position}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig[employee.status].color} border`} variant="outline">
                              {statusConfig[employee.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setViewMode('view');
                                }}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Détails
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
                                    deleteEmployee(employee.id);
                                  }
                                }}
                                className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              Affichage de {filteredEmployees.length} employé(s) sur {employees.length}
            </div>
          </div>
        </Card>
      </div>

      {/* View/Edit Employee Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewMode === 'view' ? 'Détails de l\'employé' : 'Modifier l\'employé'}
                </DialogTitle>
                <DialogDescription>
                  {viewMode === 'view' 
                    ? 'Informations complètes de l\'employé' 
                    : 'Modifiez les informations de l\'employé'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback className="bg-[#cfbd97] text-black text-xl">
                      {getInitials(selectedEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg">{selectedEmployee.name}</h3>
                    <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="text-sm mt-1">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Téléphone</Label>
                    <p className="text-sm mt-1">{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Date d'embauche</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedEmployee.hireDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Statut</Label>
                    <div className="mt-1">
                      <Badge className={`${statusConfig[selectedEmployee.status].color} border`} variant="outline">
                        {statusConfig[selectedEmployee.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                  Fermer
                </Button>
                {viewMode === 'view' && (
                  <Button 
                    className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
                    onClick={() => setViewMode('edit')}
                  >
                    Modifier
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau profil employé
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-add">Email</Label>
                <Input
                  id="email-add"
                  type="email"
                  placeholder="jean.dupont@company.com"
                  value={newEmployeeEmail}
                  onChange={(e) => setNewEmployeeEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-add">Poste</Label>
                <Select value={newEmployeeRole} onValueChange={(value: 'employe' | 'gerant' | 'livreur') => setNewEmployeeRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un poste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employé">Employé</SelectItem>
                    <SelectItem value="gérant">Gérant</SelectItem>
                    <SelectItem value="livreur">Livreur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erreur: </strong>
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetAddForm} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              className="bg-[#cfbd97] hover:bg-[#bfad87] text-black"
              onClick={handleCreateEmployee}
              disabled={isLoading}
            >
              Créer l'employé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>


  );
}

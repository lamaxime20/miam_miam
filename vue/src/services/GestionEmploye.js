/**
 * Service de gestion des employés
 * 
 * Ce fichier contient les fonctions pour récupérer et gérer les données des employés.
 * 
 * TODO: Remplacer les données mockées par des appels API vers le backend.
 */

const API_URL = import.meta.env.VITE_API_URL;

const mockEmployees = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@company.com',
    position: 'Employée',
    status: 'active',
    hireDate: '2022-03-15',
    phone: '+33 6 12 34 56 78',
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@company.com',
    position: 'Gérant',
    status: 'active',
    hireDate: '2021-01-08',
    phone: '+33 6 23 45 67 89',
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@company.com',
    position: 'Livreur',
    status: 'inactive',
    hireDate: '2020-12-06',
    phone: '+33 6 34 56 78 90',
  },
  {
    id: '4',
    name: 'Pierre Durand',
    email: 'pierre.durand@company.com',
    position: 'Employé',
    status: 'active',
    hireDate: '2023-09-22',
    phone: '+33 6 45 67 89 01',
  },
  {
    id: '5',
    name: 'Julie Bernard',
    email: 'julie.bernard@company.com',
    position: 'Employée',
    status: 'active',
    hireDate: '2023-02-14',
    phone: '+33 6 56 78 90 12',
  },
  {
    id: '6',
    name: 'Thomas Petit',
    email: 'thomas.petit@company.com',
    position: 'Employé',
    status: 'active',
    hireDate: '2019-05-10',
    phone: '+33 6 67 89 01 23',
  },
  {
    id: '7',
    name: 'Emma Rousseau',
    email: 'emma.rousseau@company.com',
    position: 'Employée',
    status: 'active',
    hireDate: '2024-01-03',
    phone: '+33 6 78 90 12 34',
  },
];

/**
 * Récupère la liste des employés.
 * @returns {Promise<Employee[]>}
 */
export async function getEmployees(restaurantId) {
  try {
    const response = await fetch(`${API_URL}api/getemployeesrestaurant/${restaurantId}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    return [];
  }
}
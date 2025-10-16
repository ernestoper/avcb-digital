// Sistema de autenticação simples
// Para POC, usando localStorage. Em produção, use Netlify Identity ou Auth0

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

const STORAGE_KEY = 'avcb_user';

// Usuários de exemplo (em produção, isso viria de um banco de dados)
const DEMO_USERS = [
  {
    email: 'admin@cbmpe.pe.gov.br',
    password: 'admin123',
    name: 'Administrador CBMPE',
    role: 'admin' as const,
  },
  {
    email: 'usuario@empresa.com',
    password: 'user123',
    name: 'Usuário Empresa',
    role: 'user' as const,
  },
];

export const auth = {
  // Login
  login: (email: string, password: string): User | null => {
    const user = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: user.email,
        name: user.name,
        role: user.role,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return userData;
    }

    return null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Obter usuário atual
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Verificar se está logado
  isAuthenticated: (): boolean => {
    return !!auth.getCurrentUser();
  },

  // Verificar se é admin
  isAdmin: (): boolean => {
    const user = auth.getCurrentUser();
    return user?.role === 'admin';
  },

  // Verificar permissão para dashboard
  canAccessDashboard: (): boolean => {
    return auth.isAdmin();
  },
};

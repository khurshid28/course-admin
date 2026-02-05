import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface Admin {
  id: number;
  login: string;
  phone: string;
  fullName?: string;
  avatar?: string;
  role: string;
}

interface AdminContextType {
  admin: Admin | null;
  token: string | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_user');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (token: string, admin: Admin) => {
    setToken(token);
    setAdmin(admin);
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(admin));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

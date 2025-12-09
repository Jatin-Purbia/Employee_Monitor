import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dummy users for testing
  const dummyUsers = [
    { id: 1, name: 'Jatin Purbia', email: 'jatin@gmail.com', password: '123', role: 'owner' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'employee' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'owner' }
  ];

  useEffect(() => {
    // Initialize dummy users if they don't exist
    const existingUsers = localStorage.getItem('employeeUsers');
    if (!existingUsers) {
      localStorage.setItem('employeeUsers', JSON.stringify(dummyUsers));
    } else {
      // Merge dummy users with existing ones (avoid duplicates) and ensure role is set
      const users = JSON.parse(existingUsers).map(user => {
        const dummyMatch = dummyUsers.find(d => d.email === user.email);
        return {
          ...user,
          role: user.role || dummyMatch?.role || 'employee'
        };
      });

      dummyUsers.forEach(dummyUser => {
        if (!users.find(u => u.email === dummyUser.email)) {
          users.push(dummyUser);
        }
      });

      localStorage.setItem('employeeUsers', JSON.stringify(users));
    }

    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('employeeUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    // In a real app, this would be an API call
    // For now, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('employeeUsers') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const effectiveRole = foundUser.role || role || 'employee';

      // Check if role matches (if specified), but allow filling missing role with selected one
      if (role && effectiveRole !== role) {
        return { success: false, error: `Invalid credentials for ${role} login` };
      }
      
      const userData = { 
        email: foundUser.email, 
        name: foundUser.name, 
        id: foundUser.id,
        role: effectiveRole
      };
      setUser(userData);
      localStorage.setItem('employeeUser', JSON.stringify(userData));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const signup = async (name, email, password, role = 'employee') => {
    // In a real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('employeeUsers') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Add new user
    const newUser = { name, email, password, id: Date.now(), role };
    users.push(newUser);
    localStorage.setItem('employeeUsers', JSON.stringify(users));

    // Auto login
    const userData = { 
      email: newUser.email, 
      name: newUser.name, 
      id: newUser.id,
      role: newUser.role 
    };
    setUser(userData);
    localStorage.setItem('employeeUser', JSON.stringify(userData));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('employeeUser');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


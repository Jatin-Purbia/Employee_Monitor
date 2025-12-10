import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { companyApi } from '../api';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const { user, getToken } = useAuth();
  const [currentCompany, setCurrentCompany] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyCompany = useCallback(async () => {
    const token = getToken();
    if (!user || !token) return;
    setLoading(true);
    try {
      const { data } = await companyApi.myCompany(token);
      setCurrentCompany(data);
      setInvitations([]);
    } catch (error) {
      console.warn('No company for user yet', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  useEffect(() => {
    fetchMyCompany();
  }, [fetchMyCompany]);

  const createCompany = async (companyData) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const { data } = await companyApi.create(companyData, token);
    setCurrentCompany(data);
    return data;
  };

  const inviteEmployee = async (companyId) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const { data } = await companyApi.invite(companyId, token);
    setInvitations((prev) => [...prev, data]);
    return data;
  };

  const acceptInvitation = async (tokenValue) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const { data } = await companyApi.acceptInvite(tokenValue, token);
    setCurrentCompany((prev) => ({ ...(prev || {}), id: data.companyId }));
    return { success: true, data };
  };

  const value = {
    currentCompany,
    invitations,
    loading,
    setCurrentCompany,
    createCompany,
    inviteEmployee,
    acceptInvitation,
    refreshCompany: fetchMyCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};


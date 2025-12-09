import { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);

  useEffect(() => {
    // Load companies and invitations from localStorage
    const savedCompanies = localStorage.getItem('companies');
    const savedInvitations = localStorage.getItem('invitations');
    const savedCurrentCompany = localStorage.getItem('currentCompany');
    
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
    if (savedInvitations) {
      setInvitations(JSON.parse(savedInvitations));
    }
    if (savedCurrentCompany) {
      setCurrentCompany(JSON.parse(savedCurrentCompany));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies]);

  useEffect(() => {
    if (invitations.length > 0) {
      localStorage.setItem('invitations', JSON.stringify(invitations));
    }
  }, [invitations]);

  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem('currentCompany', JSON.stringify(currentCompany));
    }
  }, [currentCompany]);

  const createCompany = (companyData) => {
    const newCompany = {
      id: Date.now(),
      ...companyData,
      createdAt: new Date().toISOString(),
      employees: [],
      ownerId: companyData.ownerId
    };
    
    setCompanies(prev => [...prev, newCompany]);
    setCurrentCompany(newCompany);
    return newCompany;
  };

  const inviteEmployee = (email, companyId) => {
    const token = `join_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invitation = {
      id: Date.now(),
      email,
      companyId,
      token,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    setInvitations(prev => [...prev, invitation]);
    
    // Simulate sending email (in production, this would call an email service)
    const joinLink = `${window.location.origin}/join/${token}`;
    console.log(`Email sent to ${email} with join link: ${joinLink}`);
    
    // Store in a way that can be accessed for demo
    const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
    emailLog.push({
      to: email,
      subject: 'Invitation to join company',
      body: `You have been invited to join a company. Click here to accept: ${joinLink}`,
      link: joinLink,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('emailLog', JSON.stringify(emailLog));
    
    return invitation;
  };

  const acceptInvitation = (token, userData) => {
    const invitation = invitations.find(inv => inv.token === token && inv.status === 'pending');
    
    if (!invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }

    const company = companies.find(c => c.id === invitation.companyId);
    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    // Add employee to company
    const updatedCompany = {
      ...company,
      employees: [...company.employees, {
        id: userData.id || Date.now(),
        email: userData.email,
        name: userData.name,
        joinedAt: new Date().toISOString()
      }]
    };

    setCompanies(prev => prev.map(c => c.id === company.id ? updatedCompany : c));
    
    // Mark invitation as accepted
    setInvitations(prev => prev.map(inv => 
      inv.id === invitation.id ? { ...inv, status: 'accepted' } : inv
    ));

    setCurrentCompany(updatedCompany);
    
    return { success: true, company: updatedCompany };
  };

  const getCompanyByOwner = (ownerId) => {
    return companies.find(c => c.ownerId === ownerId);
  };

  const getCompanyByEmployee = (email) => {
    return companies.find(c => c.employees.some(e => e.email === email));
  };

  const getInvitationsByCompany = (companyId) => {
    return invitations.filter(inv => inv.companyId === companyId);
  };

  const removeEmployee = (companyId, employeeId) => {
    setCompanies(prev => prev.map(company => {
      if (company.id === companyId) {
        return {
          ...company,
          employees: company.employees.filter(e => e.id !== employeeId)
        };
      }
      return company;
    }));
  };

  const value = {
    companies,
    invitations,
    currentCompany,
    setCurrentCompany,
    createCompany,
    inviteEmployee,
    acceptInvitation,
    getCompanyByOwner,
    getCompanyByEmployee,
    getInvitationsByCompany,
    removeEmployee
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};


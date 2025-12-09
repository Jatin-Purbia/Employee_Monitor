import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import Header from '../components/Header';
import CreateCompanyModal from '../components/CreateCompanyModal';
import InviteEmployeeModal from '../components/InviteEmployeeModal';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { currentCompany, getCompanyByOwner, createCompany, getInvitationsByCompany } = useCompany();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [company, setCompany] = useState(null);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (user) {
      const userCompany = getCompanyByOwner(user.id) || currentCompany;
      setCompany(userCompany);
      if (userCompany) {
        const companyInvitations = getInvitationsByCompany(userCompany.id);
        setInvitations(companyInvitations);
      }
    }
  }, [user, currentCompany, getCompanyByOwner, getInvitationsByCompany]);

  const handleCompanyCreated = (newCompany) => {
    setCompany(newCompany);
    setShowCreateModal(false);
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Your Company</h2>
            <p className="text-gray-600 mb-8">Get started by creating your company profile</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Company
            </button>
          </div>
        </div>
        {showCreateModal && (
          <CreateCompanyModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCompanyCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Company Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your company and employees</p>
        </div>

        {/* Company Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-7 mb-8 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{company.name}</h2>
              <p className="text-gray-600 mb-2">{company.description}</p>
              <p className="text-sm text-gray-500">Industry: {company.industry}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-2">{company.employees?.length || 0}</div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Invite Employee Card */}
          <div className="bg-white rounded-xl shadow-lg p-7 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invite Employees</h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Invite
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-5">
              Send invitation links to employees via email
            </p>
            {invitations.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">Pending Invitations:</p>
                {invitations.filter(inv => inv.status === 'pending').map(inv => (
                  <div key={inv.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employees List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h3>
            {company.employees && company.employees.length > 0 ? (
              <div className="space-y-3">
                {company.employees.map((employee) => (
                  <div key={employee.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Joined {new Date(employee.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No employees yet</p>
            )}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteEmployeeModal
          companyId={company.id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;


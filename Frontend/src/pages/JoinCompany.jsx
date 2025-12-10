import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';

const JoinCompany = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { acceptInvitation } = useCompany();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // We cannot verify invitation without hitting backend, show generic prompt
    setInvitation({ token });
    setLoading(false);
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to signup/login
      navigate(`/signup?token=${token}&role=employee`);
      return;
    }

    setLoading(true);
    const result = await acceptInvitation(token);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/employee/dashboard');
      }, 2000);
    } else {
      setError(result.error || 'Failed to accept invitation');
    }
    setLoading(false);
  };

  if (loading && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          {success ? (
            <div className="text-center">
              <div className="mb-8">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Successfully Joined!</h2>
              <p className="text-gray-600 mb-6">You have been added to the company</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mb-8">
                <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Invitation</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Go to Login
              </Link>
            </div>
          ) : invitation ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Company Invitation</h1>
                <p className="text-gray-600">You've been invited to join a company</p>
              </div>

              <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Invitation Token</p>
                <p className="text-blue-700 break-all">{invitation.token}</p>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    Please sign up or log in to accept this invitation
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to={`/signup?token=${token}&role=employee`}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-center font-semibold"
                    >
                      Sign Up
                    </Link>
                    <Link
                      to={`/login?token=${token}`}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-semibold"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Accepting...' : 'Accept Invitation'}
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JoinCompany;


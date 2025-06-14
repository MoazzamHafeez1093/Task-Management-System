import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (username, email, password) => {
    setLoading(true);
    try {
      const success = await register(username, email, password);
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center fade-in">
      <div className="max-w-md w-full card">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h2>
          <p className="text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <AuthForm type="register" onSubmit={handleRegister} />
        )}
      </div>
    </div>
  );
};

export default RegisterPage; 
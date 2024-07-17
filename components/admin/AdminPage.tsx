'use client'

import React from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import Loader from '@/components/Loader';

export default function AdminPage() {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return <Loader/>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Admin Login</h2>
          <LoginForm />
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
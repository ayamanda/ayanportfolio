import React from 'react';
import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';

const DynamicAdminPage = dynamic(() => import('@/components/admin/AdminPage'), {
  loading: () => <Loader />,
  ssr: false
});

export default function AdminPage() {
  return <DynamicAdminPage />;
}
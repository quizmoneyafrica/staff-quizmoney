'use client';

import React from 'react';
import ProductsPage from '@/app/(screens)/(protected)/(tabs)/products/page';

const ErasersListPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ProductsPage showOnlyErasers />
      </div>
    </div>
  );
};

export default ErasersListPage;

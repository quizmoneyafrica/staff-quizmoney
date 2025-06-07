import React from 'react';

function AppLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="border-primary-500 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2" />
    </div>
  );
}

export default AppLoader;

import React from 'react';

const OneFocusPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[url('/assets/background-imgs/trees.jpg')] bg-cover bg-center bg-no-repeat fixed inset-0">
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default OneFocusPageLayout;

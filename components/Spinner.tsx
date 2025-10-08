import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-white via-white/70 to-navy-100/40 dark:from-navy-950 dark:via-navy-950/80 dark:to-navy-900">
        <div className="relative flex items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-white/60 backdrop-blur dark:border-white/10"></div>
            <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-usace-blue"></div>
        </div>
    </div>
  );
};

export default Spinner;

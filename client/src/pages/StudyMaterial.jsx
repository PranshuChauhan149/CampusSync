import React from 'react';

const StudyMaterial = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/20 mb-6">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-100 mb-4">
          Study Material
        </h1>
        <p className="text-lg md:text-xl text-slate-300 dark:text-gray-300">
          Coming soon. We’re preparing curated notes, past papers, and resources to help you study smarter.
        </p>
      </div>
    </div>
  );
};

export default StudyMaterial;

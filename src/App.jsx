import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';

// Code-splitting routes per Section 13
const CVPage = lazy(() => import('./pages/CV'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
      <div className="font-pixel text-lg sm:text-xl text-[var(--ink)] animate-pulse flex items-center gap-2">
        <span className="inline-block w-3 h-3 bg-[var(--sunset)] border border-[var(--ink)]" />
        <span>MEMUAT DUNIA...</span>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cv" element={<CVPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;

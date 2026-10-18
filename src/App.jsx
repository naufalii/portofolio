import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import { Sprite } from './components/world/Sprite';

// Code-splitting routes per Section 13
const CVPage = lazy(() => import('./pages/CV'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

/**
 * Custom mascot loader per Section 6 (no generic spinners).
 */
function PageFallback() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center space-y-3 p-4">
      <Sprite animation="walk" scale={2.5} />
      <div className="font-pixel text-base sm:text-lg text-[var(--ink)] animate-pulse flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 bg-[var(--sunset)] border border-[var(--ink)]" />
        <span>MEMUAT DUNIA PETUALANGAN...</span>
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

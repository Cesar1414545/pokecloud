import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { initSW } from './registerSW.js';

// inicializa o service worker (PWA)
initSW();

createRoot(document.getElementById('root')).render(<App />);

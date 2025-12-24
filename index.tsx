
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, VaultProvider } from './contexts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <VaultProvider>
        <App />
      </VaultProvider>
    </AuthProvider>
  </React.StrictMode>
);

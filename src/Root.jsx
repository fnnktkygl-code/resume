import React, { useState } from 'react';
import App from './App.jsx';
import Landing from './components/Landing.jsx';

export default function Root() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <App />;
  }

  return <Landing onStart={() => setShowApp(true)} />;
}

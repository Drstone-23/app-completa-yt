import React from 'react';
import DownloadForm from './components/DownloadForm.jsx';

const appStyle = {
  backgroundColor: '#121212',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px',
  boxSizing: 'border-box',
};

const titleStyle = {
  color: '#ffffff',
  fontSize: '2.5rem',
  marginBottom: '2rem',
  textAlign: 'center',
};

const footerStyle = {
  color: '#ffffff',
  textAlign: 'center',
  padding: '1rem',
  marginTop: '2rem',
};

function App() {
  return (
    <div style={appStyle}>
      <header>
        <h1 style={titleStyle}>Video Downloader</h1>
      </header>
      <main>
        <DownloadForm />
      </main>
      <footer style={footerStyle}>
        <p>&copy; 2023 Video Downloader. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;


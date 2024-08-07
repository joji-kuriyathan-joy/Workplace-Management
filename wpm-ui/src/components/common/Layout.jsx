import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main style={{ minHeight: '80vh' }}> {/* Adjust the height as needed */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

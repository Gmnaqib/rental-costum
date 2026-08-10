import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ title }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title={title} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

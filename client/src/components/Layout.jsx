import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-full relative overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;

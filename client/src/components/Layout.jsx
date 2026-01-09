import Header from './Header';

const Layout = () => {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-full relative overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

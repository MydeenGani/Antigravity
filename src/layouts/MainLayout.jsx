import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CreditCard,
    Receipt,
    Menu,
    X,
    Bell,
    Search,
    UserCircle,
    LogOut
} from 'lucide-react';


const MainLayout = () => {
    const { logout } = useApp();

    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const location = useLocation();

    // Handle window resize
    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile && !isSidebarOpen && window.innerWidth > 1024) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]);

    // Close sidebar on route change on mobile
    React.useEffect(() => {
        if (isMobile && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    }, [location]); // Only trigger on route change, not resize

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Students', path: '/students', icon: GraduationCap },
        { name: 'Teachers', path: '/teachers', icon: Users },
        { name: 'Fees', path: '/fees', icon: CreditCard },
        { name: 'Expenses', path: '/expenses', icon: Receipt },
    ];

    const getTitle = () => {
        const current = navItems.find(item => item.path === location.pathname);
        return current ? current.name : 'Dashboard';
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            {/* Mobile Backdrop */}
            <div
                className={`sidebar-backdrop ${isSidebarOpen && isMobile ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar - Desktop/Mobile */}
            <aside
                className={`sidebar-desktop ${isSidebarOpen ? 'open' : ''}`}
                style={{
                    width: isSidebarOpen ? 'var(--sidebar-width)' : '5rem',
                    backgroundColor: '#fff',
                    borderRight: '1px solid hsl(var(--border))',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    zIndex: isMobile ? 1000 : 200,
                    overflowX: 'hidden'
                }}
            >
                <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid hsl(var(--border))', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', fontWeight: 'bold', fontSize: isSidebarOpen ? '1.25rem' : '0', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'all 0.3s' }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32?text=Log'; }} />
                        <span className="logo-text" style={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }}>Almighty Play School</span>
                    </div>
                    {/* Close button for mobile only */}
                    {isMobile && isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: 'hsl(var(--text-secondary))' }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                color: isActive ? 'hsl(var(--primary-foreground))' : 'hsl(var(--text-secondary))',
                                backgroundColor: isActive ? 'hsl(var(--primary))' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            })}
                        >
                            <item.icon size={20} style={{ flexShrink: 0 }} />
                            <span className="nav-label" style={{
                                fontWeight: 500,
                                opacity: isSidebarOpen ? 1 : 0,
                                width: isSidebarOpen ? 'auto' : 0,
                                visibility: isSidebarOpen ? 'visible' : 'hidden'
                            }}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    marginLeft: (!isMobile) ? (isSidebarOpen ? 'var(--sidebar-width)' : '5rem') : '0',
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'hsl(var(--background))'

                }}
            >
                {/* Header */}
                <header style={{
                    height: 'var(--header-height)',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid hsl(var(--border))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }} className="main-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={toggleSidebar}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center' }}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 style={{ fontSize: '1.25rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getTitle()}</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="header-search">
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'hsl(var(--text-muted))' }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                                    borderRadius: '99px',
                                    border: '1px solid hsl(var(--border))',
                                    backgroundColor: 'hsl(var(--background))',
                                    outline: 'none',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                            <Bell size={20} color="hsl(var(--text-secondary))" />
                            <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', backgroundColor: 'hsl(var(--destructive))', borderRadius: '50%' }}></span>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }} className="admin-info">
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin User</div>
                                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Principal</div>
                            </div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
                                <UserCircle size={24} />
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'hsl(var(--text-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s',
                                marginLeft: '0.5rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--background))'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: isMobile ? '1rem' : '1.5rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};



export default MainLayout;

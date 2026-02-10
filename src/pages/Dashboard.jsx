import React from 'react';
import { Users, GraduationCap, CreditCard, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{value}</h3>
            </div>
            <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                backgroundColor: `hsl(${color} / 0.1)`,
                color: `hsl(${color})`
            }}>
                <Icon size={24} />
            </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'hsl(var(--accent))', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <TrendingUp size={14} style={{ marginRight: '0.25rem' }} />
                {change}
            </span>
            <span style={{ color: 'hsl(var(--text-muted))', marginLeft: '0.5rem' }}>vs last month</span>
        </div>
    </div>
);

const Dashboard = () => {
    const { stats, seedDatabase } = useApp();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Dashboard Overview</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Welcome back to KidZone Admin Panel.</p>
                </div>
                {stats.totalStudents === 0 && (
                    <button
                        className="btn btn-outline"
                        onClick={seedDatabase}
                        style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}
                    >
                        Initialize Sample Data
                    </button>
                )}
            </div>

            <div className="dashboard-grid">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    change="+12%"
                    icon={GraduationCap}
                    color="230 85% 60%" // Primary
                />
                <StatCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    change="+4%"
                    icon={Users}
                    color="25 95% 65%" // Secondary
                />
                <StatCard
                    title="Fees Collected"
                    value={`₹${stats.totalFeesCollected.toLocaleString()}`}
                    change="+8%"
                    icon={CreditCard}
                    color="150 60% 50%" // Accent (Green)
                />
                <StatCard
                    title="Total Expenses"
                    value={`₹${stats.totalExpenses.toLocaleString()}`}
                    change="+2"
                    icon={TrendingUp}
                    color="0 84% 60%" // Destructive (Red/Pink for variety)
                />
            </div>

            <div style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
                gap: '1.5rem'
            }}>

                {/* Recent Activity / Chart Placeholder */}
                <div className="card fade-in" style={{ minHeight: '300px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Fee Collection Overview</h3>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '1rem',
                        padding: '0 1rem'
                    }}>
                        {stats.monthlyStats && stats.monthlyStats.length > 0 ? (
                            stats.monthlyStats.map((item, index) => {
                                const maxAmount = Math.max(...stats.monthlyStats.map(s => s.amount), 1);
                                const height = (item.amount / maxAmount) * 100;
                                return (
                                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '150px',
                                            backgroundColor: 'hsl(var(--background))',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'flex-end'
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${height}%`,
                                                backgroundColor: 'hsl(var(--primary))',
                                                borderRadius: '2px',
                                                transition: 'height 1s ease-out'
                                            }}></div>
                                            <div className="tooltip" style={{
                                                position: 'absolute',
                                                top: '-25px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                backgroundColor: 'hsl(var(--text-primary))',
                                                color: 'white',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                opacity: 0,
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none'
                                            }}>
                                                ₹{item.amount.toLocaleString()}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>{item.name}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                                No collection data available
                            </div>
                        )}
                        <style>{`
                            .relative:hover .tooltip { opacity: 1; }
                        `}</style>
                    </div>

                </div>

                {/* Recent Students */}
                <div className="card fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Admissions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentAdmissions && stats.recentAdmissions.length > 0 ? (
                            stats.recentAdmissions.map((student, index) => (
                                <div key={student.id || index} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: index < stats.recentAdmissions.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: 'hsl(var(--primary))'
                                    }}>
                                        {student.name ? student.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{student.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{student.class}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                                No recent admissions.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

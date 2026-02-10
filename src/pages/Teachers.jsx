import React, { useState } from 'react';
import { Search, Plus, Filter, Phone, Mail, BookOpen, Edit, Trash, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Teachers = () => {
    const { teachers, addTeacher, updateTeacher, deleteTeacher } = useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState({ id: null, name: '', subject: '', email: '', phone: '', status: 'Active' });

    const handleAdd = () => {
        setCurrentTeacher({ id: null, name: '', subject: '', email: '', phone: '', status: 'Active' });
        setIsModalOpen(true);
    };

    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            await deleteTeacher(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (currentTeacher.id) {
                await updateTeacher(currentTeacher.id, currentTeacher);
            } else {
                await addTeacher(currentTeacher);
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save teacher", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentTeacher(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Teachers</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Manage teaching staff and assignments.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                    Add Teacher
                </button>
            </div>

            <div className="dashboard-grid">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsl(var(--secondary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--secondary))', fontWeight: 600, fontSize: '1.25rem' }}>
                                    {teacher.name.charAt(4)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{teacher.name}</h3>
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <BookOpen size={14} />
                                        {teacher.subject}
                                    </div>
                                </div>
                            </div>
                            <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.75rem',
                                backgroundColor: teacher.status === 'Active' ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--secondary) / 0.1)',
                                color: teacher.status === 'Active' ? 'hsl(var(--accent))' : 'hsl(var(--secondary))'
                            }}>
                                {teacher.status}
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                                <Mail size={16} />
                                {teacher.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                                <Phone size={16} />
                                {teacher.phone}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                            <button
                                onClick={() => handleEdit(teacher)}
                                className="btn btn-outline"
                                style={{ flex: 1, height: '2rem', fontSize: '0.875rem' }}
                            >
                                <Edit size={14} style={{ marginRight: '0.5rem' }} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(teacher.id)}
                                className="btn btn-outline"
                                style={{ flex: 1, height: '2rem', fontSize: '0.875rem', color: 'hsl(var(--destructive))', borderColor: 'hsl(var(--destructive) / 0.3)' }}
                            >
                                <Trash size={14} style={{ marginRight: '0.5rem' }} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{currentTeacher.id ? 'Edit Teacher' : 'Add Teacher'}</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentTeacher.name}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={currentTeacher.subject}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={currentTeacher.email}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={currentTeacher.phone}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                                    <select
                                        name="status"
                                        value={currentTeacher.status}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentTeacher.id ? 'Save Changes' : 'Add Teacher'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;

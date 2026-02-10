import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Students = () => {
    // Global State
    const { students, addStudent, updateStudent, deleteStudent } = useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({ id: null, name: '', class: '', parent: '', phone: '', status: 'Active' });

    const handleAdd = () => {
        setCurrentStudent({ id: null, name: '', class: '', parent: '', phone: '', status: 'Active' });
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!id) {
            console.error('Student with missing ID detected!');
            alert('Error: Student ID is missing. Cannot delete. This student record is corrupted. Please check the console for details.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(id);
                alert('Student deleted successfully!');
            } catch (error) {
                console.error('Delete failed:', error);
                alert(`Error deleting student: ${error.message}`);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        console.log("handleSave called with:", currentStudent);
        try {
            if (currentStudent.id) {
                // Edit existing - remove id from the data object
                const { id, ...dataWithoutId } = currentStudent;
                console.log("Updating student:", id, dataWithoutId);
                await updateStudent(id, dataWithoutId);
            } else {
                // Add new - remove id field completely
                const { id, ...dataWithoutId } = currentStudent;
                console.log("Adding new student:", dataWithoutId);
                await addStudent(dataWithoutId);
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save student", error);
            alert("Error: " + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Students</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Manage student records and admissions.</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                    Add Student
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                {/* Table Toolbar */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid hsl(var(--border))',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button className="btn btn-outline">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--text-secondary))', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Class</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Parent</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Contact</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '0.75rem' }}>
                                                {student.name?.charAt(0) || '?'}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{student.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{student.class}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{student.parent}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{student.phone}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: student.status === 'Active' ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--text-muted) / 0.1)',
                                            color: student.status === 'Active' ? 'hsl(var(--accent))' : 'hsl(var(--text-muted))'
                                        }}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(student)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--destructive))' }}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid hsl(var(--border))' }}>
                    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Showing {students.length} students</span>
                </div>
            </div>

            {/* Edit/Add Modal */}
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
                            <h3 style={{ margin: 0 }}>{currentStudent.id ? 'Edit Student' : 'Add Student'}</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentStudent.name}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Class</label>
                                    <select
                                        name="class"
                                        value={currentStudent.class}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    >
                                        <option value="">Select Class</option>
                                        <option value="Pre-Nursery">Pre-Nursery</option>
                                        <option value="Nursery">Nursery</option>
                                        <option value="Kindergarten">Kindergarten</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Parent Name</label>
                                    <input
                                        type="text"
                                        name="parent"
                                        value={currentStudent.parent}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={currentStudent.phone}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                                    <select
                                        name="status"
                                        value={currentStudent.status}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentStudent.id ? 'Save Changes' : 'Add Student'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;

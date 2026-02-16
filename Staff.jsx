import React, { useState } from 'react';
import { Plus, Phone, Mail, BookOpen, Edit, Trash, X, Briefcase, IndianRupee, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Staff = () => {
    const { staff, addStaff, updateStaff, deleteStaff, addExpense } = useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    const [currentStaff, setCurrentStaff] = useState({
        id: null,
        name: '',
        category: 'Teaching',
        subject: '',
        role: '',
        email: '',
        phone: '',
        salary: '',
        status: 'Active'
    });

    const [paymentData, setPaymentData] = useState({
        staffId: null,
        staffName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleAdd = (category = 'Teaching') => {
        setCurrentStaff({
            id: null,
            name: '',
            category: category,
            subject: '',
            role: '',
            email: '',
            phone: '',
            salary: '',
            status: 'Active'
        });
        setIsModalOpen(true);
    };

    const handleEdit = (staffMember) => {
        setCurrentStaff({
            ...staffMember,
            // Ensure default values if missing
            category: staffMember.category || 'Teaching',
            subject: staffMember.subject || '',
            role: staffMember.role || '',
            salary: staffMember.salary || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            await deleteStaff(id);
        }
    };

    const handlePaySalary = (member) => {
        setPaymentData({
            staffId: member.id,
            staffName: member.name,
            amount: member.salary || '', // Default to staff salary
            date: new Date().toISOString().split('T')[0]
        });
        setIsPayModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closePayModal = () => {
        setIsPayModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Clean up data based on category
            const dataToSave = { ...currentStaff };

            // Ensure salary is a number if possible, or keep as string
            if (dataToSave.salary) {
                // Remove commas if user entered them, convert to number or keep consistent string
                // simple storage as string is fine for now, or number
                // dataToSave.salary = dataToSave.salary; 
            }

            if (dataToSave.category === 'Teaching') {
                delete dataToSave.role;
            } else {
                delete dataToSave.subject;
            }

            if (currentStaff.id) {
                await updateStaff(currentStaff.id, dataToSave);
            } else {
                await addStaff(dataToSave);
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save staff", error);
        }
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        try {
            await addExpense({
                title: `Salary - ${paymentData.staffName}`,
                category: 'Salary',
                amount: Number(paymentData.amount),
                date: paymentData.date,
                staffId: paymentData.staffId // Optional: link to staff
            });
            alert(`Salary payment of ₹${paymentData.amount} recorded for ${paymentData.staffName}`);
            closePayModal();
        } catch (error) {
            console.error("Failed to record salary payment", error);
            alert("Failed to record payment.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStaff(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    // Filter staff by category
    const teachingStaff = staff.filter(s => s.category === 'Teaching' || !s.category); // Default to teaching if missing
    const supportStaff = staff.filter(s => s.category === 'Support Staff');

    const StaffCard = ({ member }) => (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        backgroundColor: member.category === 'Teaching' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--secondary) / 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: member.category === 'Teaching' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                        fontWeight: 600, fontSize: '1.25rem'
                    }}>
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{member.name}</h3>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {member.category === 'Teaching' ? <BookOpen size={14} /> : <Briefcase size={14} />}
                            {member.category === 'Teaching' ? member.subject : member.role}
                        </div>
                    </div>
                </div>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    backgroundColor: member.status === 'Active' ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--secondary) / 0.1)',
                    color: member.status === 'Active' ? 'hsl(var(--accent))' : 'hsl(var(--secondary))'
                }}>
                    {member.status}
                </span>
            </div>

            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                    <Mail size={16} />
                    {member.email || 'No email'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                    <Phone size={16} />
                    {member.phone || 'No phone'}
                </div>
                {member.salary && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                        <IndianRupee size={16} />
                        ₹{member.salary} / month
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                <button
                    onClick={() => handlePaySalary(member)}
                    className="btn btn-outline"
                    style={{ flex: 1, height: '2rem', fontSize: '0.875rem', color: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary) / 0.3)' }}
                    title="Pay Salary"
                >
                    <IndianRupee size={14} style={{ marginRight: '0.5rem' }} /> Pay
                </button>
                <button
                    onClick={() => handleEdit(member)}
                    className="btn btn-outline"
                    style={{ flex: 1, height: '2rem', fontSize: '0.875rem' }}
                >
                    <Edit size={14} style={{ marginRight: '0.5rem' }} /> Edit
                </button>
                <button
                    onClick={() => handleDelete(member.id)}
                    className="btn btn-outline"
                    style={{ flex: 1, height: '2rem', fontSize: '0.875rem', color: 'hsl(var(--destructive))', borderColor: 'hsl(var(--destructive) / 0.3)' }}
                >
                    <Trash size={14} style={{ marginRight: '0.5rem' }} /> Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Staff Management</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Manage teaching and support staff.</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleAdd('Teaching')}>
                    <Plus size={18} />
                    Add Staff
                </button>
            </div>

            {/* Teaching Staff Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'hsl(var(--primary))', borderBottom: '2px solid hsl(var(--primary))', paddingBottom: '0.5rem', display: 'inline-block' }}>
                        Teaching Staff
                    </h3>
                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', height: '2rem' }} onClick={() => handleAdd('Teaching')}>
                        <Plus size={14} /> Add Teacher
                    </button>
                </div>

                {teachingStaff.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>
                        No teaching staff found. Add one to get started.
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {teachingStaff.map((member) => (
                            <StaffCard key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </div>

            {/* Support Staff Section */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'hsl(var(--secondary))', borderBottom: '2px solid hsl(var(--secondary))', paddingBottom: '0.5rem', display: 'inline-block' }}>
                        Support Staff
                    </h3>
                    <button className="btn btn-outline" style={{ fontSize: '0.75rem', height: '2rem' }} onClick={() => handleAdd('Support Staff')}>
                        <Plus size={14} /> Add Support Staff
                    </button>
                </div>

                {supportStaff.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>
                        No support staff found. Add one to get started.
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {supportStaff.map((member) => (
                            <StaffCard key={member.id} member={member} />
                        ))}
                    </div>
                )}
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
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{currentStaff.id ? 'Edit Staff' : 'Add Staff'}</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
                                    <select
                                        name="category"
                                        value={currentStaff.category}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    >
                                        <option value="Teaching">Teaching Staff</option>
                                        <option value="Support Staff">Support Staff</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentStaff.name}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                {currentStaff.category === 'Teaching' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={currentStaff.subject}
                                            onChange={handleChange}
                                            required
                                            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
                                        <input
                                            type="text"
                                            name="role"
                                            value={currentStaff.role}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Driver, Cleaner, Security"
                                            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={currentStaff.email}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={currentStaff.phone}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Monthly Salary (₹)</label>
                                    <input
                                        type="number"
                                        name="salary"
                                        value={currentStaff.salary}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                                    <select
                                        name="status"
                                        value={currentStaff.status}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="On Leave">On Leave</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentStaff.id ? 'Save Changes' : 'Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Salary Modal */}
            {isPayModalOpen && (
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
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <IndianRupee size={20} /> Pay Salary
                            </h3>
                            <button onClick={closePayModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleConfirmPayment} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'hsl(var(--secondary) / 0.1)', borderRadius: '0.375rem', color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>
                                Recording salary payment for <strong>{paymentData.staffName}</strong>. This will be added to Expenses.
                            </div>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={paymentData.amount}
                                        onChange={handlePaymentChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none', fontSize: '1.1rem', fontWeight: 600 }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Payment Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={paymentData.date}
                                        onChange={handlePaymentChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={closePayModal} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;

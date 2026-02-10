import React, { useState } from 'react';
import { Search, Filter, Download, CheckCircle, AlertCircle, X, Eye, Edit, Trash } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Fees = () => {
    const { students, invoices, addInvoice, updateInvoice, deleteInvoice, generateInvoiceId } = useApp();

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    // View Modal Logic
    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
    };
    const closeView = () => {
        setSelectedInvoice(null);
    };

    // Edit/Create Modal Logic
    const handleCreate = () => {
        setEditingInvoice({
            id: null,
            student: '',
            studentId: '',
            studentClass: '',
            amount: 0,
            paid: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            type: 'Tuition'
        });
        setIsEditModalOpen(true);
    };

    const handleEdit = (invoice) => {
        setEditingInvoice({ ...invoice });
        setIsEditModalOpen(true);
    };

    const closeEdit = () => {
        setIsEditModalOpen(false);
        setEditingInvoice(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await deleteInvoice(id);
                alert('Invoice deleted successfully!');
            } catch (error) {
                console.error("Delete failed:", error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        const updatedPaid = parseFloat(editingInvoice.paid) || 0;
        const totalAmount = parseFloat(editingInvoice.amount) || 0;

        // Auto-update status based on payment
        let newStatus = 'Pending';
        if (updatedPaid >= totalAmount && totalAmount > 0) {
            newStatus = 'Paid';
        } else if (updatedPaid > 0) {
            newStatus = 'Pending';
        } else {
            newStatus = 'Pending';
        }

        const invoiceData = {
            ...editingInvoice,
            amount: totalAmount,
            paid: updatedPaid,
            status: newStatus
        };

        try {
            if (editingInvoice.id && !editingInvoice.id.startsWith('new')) {
                // Check if it's an existing ID from firestore or created new. 
                // If ID exists in invoiceData, we update. 
                // Note: Newly created invoices in previous version had 'INV-' ids. 
                // Firestore IDs are random strings. 
                // We rely on editingInvoice.id being present for updates.
                await updateInvoice(editingInvoice.id, invoiceData);
                alert('Invoice updated successfully!');
            } else {
                // Remove temp ID if any
                const { id, ...dataToSave } = invoiceData;
                await addInvoice(dataToSave);
                alert('Invoice created successfully!');
            }
            closeEdit();
        } catch (error) {
            console.error("Failed to save invoice", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studentId') {
            const student = students.find(s => s.id === value);
            if (student) {
                setEditingInvoice(prev => ({
                    ...prev,
                    studentId: value,
                    student: student.name,
                    studentClass: student.class
                }));
            }
        } else {
            setEditingInvoice(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Fees Management</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Track fee payments and invoices.</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>
                    Create Invoice
                </button>
            </div>

            <div className="card" style={{ padding: '0' }}>
                {/* Toolbar */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                        <input type="text" placeholder="Search invoices..." style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }} />
                    </div>
                    <button className="btn btn-outline">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--text-secondary))', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem' }}>Invoice ID</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Student</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Type</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Total Amount</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Paid</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Balance</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => {
                                const balance = inv.amount - inv.paid;
                                return (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                            {inv.displayId || <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', opacity: 0.7 }}>LEGACY-{inv.id.slice(0, 4).toUpperCase()}</span>}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {inv.student.charAt(0)}
                                                </div>
                                                {inv.student}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{inv.type}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>₹{(Number(inv.amount) || 0).toFixed(2)}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'hsl(var(--accent))' }}>₹{(Number(inv.paid) || 0).toFixed(2)}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: balance > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--text-muted))', fontWeight: balance > 0 ? 600 : 400 }}>₹{(Number(balance) || 0).toFixed(2)}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'hsl(var(--text-muted))' }}>{inv.date || 'No date'}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '99px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                backgroundColor: inv.status === 'Paid' ? 'hsl(var(--accent) / 0.1)' : inv.status === 'Overdue' ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--secondary) / 0.1)',
                                                color: inv.status === 'Paid' ? 'hsl(var(--accent))' : inv.status === 'Overdue' ? 'hsl(var(--destructive))' : 'hsl(var(--secondary))'
                                            }}>
                                                {inv.status === 'Paid' && <CheckCircle size={12} />}
                                                {inv.status === 'Overdue' && <AlertCircle size={12} />}
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button onClick={() => handleDelete(inv.id)} className="btn btn-outline" style={{ height: '2rem', padding: '0 0.5rem', color: 'hsl(var(--destructive))' }} title="Delete Invoice">
                                                    <Trash size={14} />
                                                </button>
                                                <button onClick={() => handleEdit(inv)} className="btn btn-outline" style={{ height: '2rem', padding: '0 0.5rem' }} title="Edit Payment">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleView(inv)} className="btn btn-outline" style={{ height: '2rem', padding: '0 0.5rem' }} title="View Details">
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Invoice Modal */}
            {selectedInvoice && (
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
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'hsl(var(--background))' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Invoice Details</h3>
                                <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>{selectedInvoice.displayId || selectedInvoice.id}</span>
                            </div>
                            <button onClick={closeView} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Billed To</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedInvoice.student}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Date: {selectedInvoice.date}</div>
                                </div>
                            </div>
                            <div style={{ backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Total</span>
                                    <span style={{ fontWeight: 600 }}>₹{(Number(selectedInvoice.amount) || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'hsl(var(--accent))' }}>
                                    <span>Paid</span>
                                    <span style={{ fontWeight: 600 }}>- ₹{(Number(selectedInvoice.paid) || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid hsl(var(--border))', margin: '0.5rem 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <span>Balance</span>
                                    <span>₹{((Number(selectedInvoice.amount) || 0) - (Number(selectedInvoice.paid) || 0)).toFixed(2)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline" onClick={closeView}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Invoice Modal */}
            {isEditModalOpen && editingInvoice && (
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
                    zIndex: 110
                }}>
                    <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{editingInvoice.id ? 'Edit Invoice' : 'Create Invoice'}</h3>
                                {editingInvoice.id ? (
                                    editingInvoice.displayId && (
                                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>{editingInvoice.displayId}</span>
                                    )
                                ) : (
                                    editingInvoice.studentClass && (
                                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--accent))', fontWeight: 500 }}>
                                            Will be assigned: {generateInvoiceId(editingInvoice.studentClass)}
                                        </span>
                                    )
                                )}
                            </div>
                            <button onClick={closeEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={saveEdit} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Student</label>
                                <select
                                    name="studentId"
                                    value={editingInvoice.studentId || ''}
                                    onChange={handleEditChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))' }}
                                    required
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Type (e.g. Tuition)</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={editingInvoice.type}
                                    onChange={handleEditChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={editingInvoice.date}
                                    onChange={handleEditChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editingInvoice.amount}
                                    onChange={handleEditChange}
                                    disabled={false} // Enable amount editing for new invoices or updates
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))' }}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    name="paid"
                                    value={editingInvoice.paid}
                                    onChange={handleEditChange}
                                    min="0"
                                    max={editingInvoice.amount} // Optional constraint, maybe they overpay? Keeping simple.
                                    step="0.01"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingInvoice.id ? 'Save Changes' : 'Create Invoice'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fees;

import React, { useState } from 'react';
import { Plus, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Edit, Trash, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Expenses = () => {
    const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState({ id: null, title: '', category: '', amount: '', date: '' });

    // Calculate totals for summary cards
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    // Mock budget
    const budget = 141000;
    const remaining = budget - totalExpenses;

    const handleAdd = () => {
        setCurrentExpense({ id: null, title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleEdit = (expense) => {
        setCurrentExpense(expense);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await deleteExpense(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const amount = parseFloat(currentExpense.amount) || 0;

        if (amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        const expenseData = { ...currentExpense, amount };

        try {
            if (currentExpense.id) {
                await updateExpense(currentExpense.id, expenseData);
                alert('Expense updated successfully!');
            } else {
                const { id, ...dataToSave } = expenseData;
                await addExpense(dataToSave);
                alert('Expense added successfully!');
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save expense", error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentExpense(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Financial Expenses</h2>
                    <p style={{ color: 'hsl(var(--text-muted))' }}>Track school expenditures and budget.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline">Generate Report</button>
                    <button className="btn btn-primary" onClick={handleAdd}><Plus size={18} /> Add Expense</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Total Expenses (Oct)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{(Number(totalExpenses) || 0).toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--destructive))' }}>
                        <ArrowUpRight size={16} /> +15% from last month
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Budget Remaining</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{(Number(remaining) || 0).toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: remaining > 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))' }}>
                        {remaining > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        {remaining > 0 ? 'On track' : 'Over budget'}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <PieChart size={48} color="hsl(var(--primary))" />
                    <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>View Analytics</span>
                </div>
            </div>

            <div className="card">
                <h3 style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', margin: 0 }}>Recent Expenses</h3>
                <div>
                    {expenses.map((expense) => (
                        <div key={expense.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius)', backgroundColor: 'hsl(var(--background))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-secondary))' }}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{expense.title}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>{expense.category} • {expense.date}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontWeight: 600 }}>
                                    -₹{(Number(expense.amount) || 0).toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(expense)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(expense.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--destructive))' }}>
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
                            <h3 style={{ margin: 0 }}>{currentExpense.id ? 'Edit Expense' : 'Add Expense'}</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={currentExpense.title}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={currentExpense.category}
                                        onChange={handleChange}
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={currentExpense.amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={currentExpense.date}
                                        onChange={handleChange}
                                        required
                                        style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid hsl(var(--border))', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={closeModal} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">{currentExpense.id ? 'Save Changes' : 'Add Expense'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // ---- AUTH LISTENERS ----
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };


    // ---- REAL-TIME LISTENERS ----
    useEffect(() => {
        const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (error) => console.error("Error fetching students:", error));

        const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
            setTeachers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (error) => console.error("Error fetching teachers:", error));

        const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
            setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (error) => console.error("Error fetching invoices:", error));

        const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
            setExpenses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        }, (error) => console.error("Error fetching expenses:", error));

        setLoading(false);

        return () => {
            unsubStudents();
            unsubTeachers();
            unsubInvoices();
            unsubExpenses();
        };
    }, []);

    // ---- CRUD OPERATIONS ----

    // Students
    const addStudent = async (data) => {
        try {
            const studentWithDate = {
                ...data,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'students'), studentWithDate);
        } catch (e) {
            console.error("Error adding student: ", e);
            alert("Error adding student. Check console or internet connection.");
        }
    };
    const updateStudent = async (id, data) => {
        try {
            await updateDoc(doc(db, 'students', id), data);
        } catch (e) {
            console.error("Error updating student: ", e);
        }
    };
    const deleteStudent = async (id) => {
        if (!id) {
            throw new Error('Student ID is required for deletion');
        }
        try {
            await deleteDoc(doc(db, 'students', id));
        } catch (e) {
            console.error("Error deleting student: ", e);
            throw new Error(`Failed to delete student: ${e.message}`);
        }
    };

    // Teachers
    const addTeacher = async (data) => {
        try {
            await addDoc(collection(db, 'teachers'), { ...data, createdAt: new Date().toISOString() });
        } catch (e) {
            console.error("Error adding teacher: ", e);
        }
    };
    const updateTeacher = async (id, data) => {
        try {
            await updateDoc(doc(db, 'teachers', id), data);
        } catch (e) {
            console.error("Error updating teacher: ", e);
        }
    };
    const deleteTeacher = async (id) => {
        try {
            await deleteDoc(doc(db, 'teachers', id));
        } catch (e) {
            console.error("Error deleting teacher: ", e);
        }
    };

    // Invoices (Fees)
    const generateInvoiceId = (studentClass = '') => {
        const normalized = (studentClass || '').toLowerCase().trim();

        let classCode = 'INV';
        if (normalized.includes('pre') || normalized.includes('pkg')) classCode = 'PR';
        else if (normalized.includes('lkg') || normalized.includes('nursery')) classCode = 'LK';
        else if (normalized.includes('ukg') || normalized.includes('kinder')) classCode = 'UK';
        else if (normalized.includes('1')) classCode = 'C1';
        else if (normalized.includes('2')) classCode = 'C2';
        // Add more as needed or use a more generic approach

        const prefix = `APS${classCode}`;

        // Find ALL invoices for this class to determine the correct sequence number
        const classInvoices = invoices.filter(inv => {
            // Match by displayId prefix OR by the studentClass field directly
            const idMatches = inv.displayId && inv.displayId.startsWith(prefix);
            const classMatches = (inv.studentClass || '').toLowerCase().trim() === normalized;
            return idMatches || (classMatches && inv.studentClass);
        });

        const existingNumbers = classInvoices.map(inv => {
            if (inv.displayId && inv.displayId.startsWith(prefix)) {
                const numStr = inv.displayId.replace(prefix, '');
                return parseInt(numStr, 10) || 0;
            }
            return 0;
        });

        const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        const nextNumber = Math.max(classInvoices.length, maxNumber) + 1;

        return `${prefix}${String(nextNumber).padStart(3, '0')}`;
    };

    const addInvoice = async (data) => {
        try {
            const displayId = generateInvoiceId(data.studentClass);
            await addDoc(collection(db, 'invoices'), {
                ...data,
                displayId,
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding invoice: ", e);
            throw new Error(`Failed to add invoice: ${e.message}`);
        }
    };

    const updateInvoice = async (id, data) => {
        if (!id) throw new Error('Invoice ID is required for update');
        try {
            const { id: _, ...dataWithoutId } = data;

            // If it's an old invoice missing a displayId, generate one now
            let finalData = { ...dataWithoutId };
            const existing = invoices.find(inv => inv.id === id);
            if (!existing?.displayId && !finalData.displayId) {
                finalData.displayId = generateInvoiceId(finalData.studentClass || existing?.studentClass);
            }

            await updateDoc(doc(db, 'invoices', id), finalData);
        } catch (e) {
            console.error("Error updating invoice: ", e);
            throw new Error(`Failed to update invoice: ${e.message}`);
        }
    };
    // Usually we don't delete invoices easily, but for completeness
    const deleteInvoice = async (id) => {
        if (!id) throw new Error('Invoice ID is required for deletion');
        try {
            await deleteDoc(doc(db, 'invoices', id));
        } catch (e) {
            console.error("Error deleting invoice: ", e);
            throw new Error(`Failed to delete invoice: ${e.message}`);
        }
    };

    // Expenses
    const addExpense = async (data) => {
        try {
            await addDoc(collection(db, 'expenses'), data);
        } catch (e) {
            console.error("Error adding expense: ", e);
        }
    };
    const updateExpense = async (id, data) => {
        try {
            await updateDoc(doc(db, 'expenses', id), data);
        } catch (e) {
            console.error("Error updating expense: ", e);
        }
    };
    const deleteExpense = async (id) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
        } catch (e) {
            console.error("Error deleting expense: ", e);
        }
    };

    // Derived Stats
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalFeesCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paid) || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Calculate monthly fee stats for the chart
    const monthlyFees = invoices.reduce((acc, inv) => {
        if (!inv.date) return acc;
        const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
        const year = new Date(inv.date).getFullYear();
        const key = `${month} ${year}`;
        acc[key] = (acc[key] || 0) + (Number(inv.paid) || 0);
        return acc;
    }, {});

    const monthlyStats = Object.entries(monthlyFees)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => new Date(a.name) - new Date(b.name))
        .slice(-6); // Last 6 months

    // Sort by createdAt descending and take the top 5
    const recentAdmissions = [...students]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

    // ---- SEED DATA UTILITY ----
    const seedDatabase = async () => {
        try {
            // Sample Students
            const sampleStudents = [
                { name: 'Alice Johnson', class: 'Kindergarten', parent: 'Bob Johnson', phone: '555-0101', status: 'Active', createdAt: '2023-10-01T10:00:00Z' },
                { name: 'Charlie Smith', class: 'Pre-Nursery', parent: 'Sarah Smith', phone: '555-0102', status: 'Active', createdAt: '2023-10-02T11:00:00Z' },
                { name: 'David Brown', class: 'Nursery', parent: 'Mike Brown', phone: '555-0103', status: 'Inactive', createdAt: '2023-10-03T12:00:00Z' },
                { name: 'Eva Davis', class: 'Kindergarten', parent: 'Emily Davis', phone: '555-0104', status: 'Active', createdAt: '2023-10-04T13:00:00Z' },
                { name: 'Frank Wilson', class: 'Pre-Nursery', parent: 'Tom Wilson', phone: '555-0105', status: 'Active', createdAt: '2023-10-05T14:00:00Z' },
                { name: 'Grace Lee', class: 'Nursery', parent: 'David Lee', phone: '555-0106', status: 'Active', createdAt: '2023-10-06T15:00:00Z' },
            ];
            for (const s of sampleStudents) await addStudent(s);

            // Sample Teachers
            const sampleTeachers = [
                { name: 'Mrs. Anderson', subject: 'English', email: 'anderson@kidzone.com', phone: '555-1001', status: 'Active' },
                { name: 'Mr. Baker', subject: 'Math', email: 'baker@kidzone.com', phone: '555-1002', status: 'Active' },
                { name: 'Ms. Clark', subject: 'Art', email: 'clark@kidzone.com', phone: '555-1003', status: 'On Leave' },
                { name: 'Mr. Davis', subject: 'Science', email: 'davis@kidzone.com', phone: '555-1004', status: 'Active' },
                { name: 'Ms. Evans', subject: 'Music', email: 'evans@kidzone.com', phone: '555-1005', status: 'Active' },
            ];
            for (const t of sampleTeachers) await addTeacher(t);

            // Sample Invoices
            const sampleInvoices = [
                { student: 'Alice Johnson', amount: 450.00, paid: 450.00, date: '2023-10-01', status: 'Paid', type: 'Tuition' },
                { student: 'Charlie Smith', amount: 450.00, paid: 200.00, date: '2023-10-02', status: 'Pending', type: 'Tuition' },
                { student: 'David Brown', amount: 50.00, paid: 0.00, date: '2023-10-05', status: 'Overdue', type: 'Transport' },
            ];
            for (const i of sampleInvoices) await addInvoice(i);

            // Sample Expenses
            const sampleExpenses = [
                { title: 'Classroom Supplies', category: 'Stationery', amount: 350.00, date: '2023-10-02' },
                { title: 'Plumbing Repair', category: 'Maintenance', amount: 120.50, date: '2023-10-04' },
                { title: 'Internet Bill', category: 'Utilities', amount: 89.99, date: '2023-10-01' },
            ];
            for (const e of sampleExpenses) await addExpense(e);

            alert("Database seeded successfully!");
        } catch (error) {
            console.error("Error seeding database:", error);
            alert("Failed to seed database. Check console.");
        }
    };

    console.log("Context Data:", { students, teachers, invoices, expenses }); // Debug log

    return (
        <AppContext.Provider value={{
            students, addStudent, updateStudent, deleteStudent,
            teachers, addTeacher, updateTeacher, deleteTeacher,
            invoices, addInvoice, updateInvoice, deleteInvoice,
            generateInvoiceId,
            expenses, addExpense, updateExpense, deleteExpense,
            seedDatabase,
            user, login, register, logout,
            stats: {
                totalStudents,
                totalTeachers,
                totalFeesCollected,
                totalExpenses,
                recentAdmissions,
                monthlyStats
            },
            loading
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

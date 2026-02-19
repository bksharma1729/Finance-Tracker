import { useEffect, useMemo, useState } from "react";
import {
  ref,
  push,
  onValue,
  remove,
  update,
  query as rtdbQuery,
  orderByChild,
  equalTo,
} from "firebase/database";
import Navbar from "../components/Navbar.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import Filters from "../components/Filters.jsx";
import TransactionList from "../components/TransactionList.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import FloatingAddButton from "../components/FloatingAddButton.jsx";
import DashboardCharts from "../components/SpendingChart.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { rtdb } from "../firebase/config.js";
import "./dashboard.css";

// Simple notification component
function Notification({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="notification-popup" onClick={onClose} style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: '#4caf50',
      color: 'white',
      padding: '16px 32px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      cursor: 'pointer',
      fontWeight: 600
    }}>
      {message}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isDark, setIsDark] = useState(true);

  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const txRef = ref(rtdb, 'transactions');
    // Query for current user's transactions
    const q = rtdbQuery(txRef, orderByChild('userId'), equalTo(user.uid));
    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      let txs = [];
      if (data) {
        txs = Object.entries(data).map(([id, tx]) => ({ id, ...tx }));
        // Sort by date desc
        txs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error('Error loading transactions', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDark);
    document.body.classList.toggle("light-theme", !isDark);
  }, [isDark]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !searchText ||
        tx.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (tx.category || "").toLowerCase().includes(searchText.toLowerCase());

      const matchesType =
        typeFilter === "all" ? true : tx.type === typeFilter;

      const matchesCategory = categoryFilter
        ? (tx.category || "")
            .toLowerCase()
            .includes(categoryFilter.toLowerCase())
        : true;

      const txDate = tx.date ? new Date(tx.date) : null;

      const matchesStart = startDate
        ? txDate && txDate >= new Date(startDate)
        : true;

      const matchesEnd = endDate
        ? txDate && txDate <= new Date(endDate)
        : true;

      return (
        matchesSearch && matchesType && matchesCategory && matchesStart && matchesEnd
      );
    });
  }, [transactions, searchText, typeFilter, categoryFilter, startDate, endDate]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === "income") {
          acc.totalIncome += amount;
        } else if (tx.type === "expense") {
          acc.totalExpense += amount;
        }
        acc.balance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [filteredTransactions]);

  const handleAddClick = () => {
    setEditingTx(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      await remove(ref(rtdb, `transactions/${id}`));
    } catch (error) {
      console.error("Failed to delete transaction", error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingTx) {
        // Update existing transaction
        await update(ref(rtdb, `transactions/${editingTx.id}`), {
          ...editingTx,
          ...formData,
        });
        setNotification("Transaction updated successfully!");
      } else {
        // Add new transaction
        await push(ref(rtdb, 'transactions'), {
          ...formData,
          userId: user.uid,
          createdAt: Date.now(),
        });
        setNotification("Transaction added successfully!");
      }
      setIsFormOpen(false);
      setEditingTx(null);
      // Hide notification after 2.5 seconds
      setTimeout(() => setNotification(""), 2500);
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div className="dashboard-page">
      <Notification message={notification} onClose={() => setNotification("")} />
      <Navbar
        onAddClick={handleAddClick}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />

      <main className="dashboard-content">
        <section className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Track your income, expenses and overall balance in one place.
            </p>
          </div>
        </section>

        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
        />

        <section className="chart-section">
          <DashboardCharts transactions={filteredTransactions} />
        </section>

        <section className="filters-section">
          <h2>Filters &amp; Search</h2>
          <Filters
            searchText={searchText}
            onSearchTextChange={setSearchText}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </section>

        <section className="transactions-section">
          <div className="section-header">
            <h2>Transactions</h2>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleAddClick}
            >
              Add Transaction
            </button>
          </div>

          {loading ? (
            <div className="centered-page">
              <LoadingSpinner size="large" />
              <p style={{ marginTop: "16px" }}>Loading your transactions...</p>
            </div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTx}
      />

      <FloatingAddButton onClick={handleAddClick} />
    </div>
  );
}

export default Dashboard;

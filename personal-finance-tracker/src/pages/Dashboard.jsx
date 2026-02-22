import { useEffect, useMemo, useState } from "react";
import {
  ref,
  push,
  onValue,
  remove,
  set,
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
import { rtdb, db } from "../firebase/config.js";
import logoImg from "../assets/logo.png";
import "./dashboard.css";

// Simple notification component
function Notification({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="notification-popup" onClick={onClose}>
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
  const [isDark, setIsDark] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardInfo, setCardInfo] = useState(() => {
    // Initial load from localStorage for instant result
    const cached = localStorage.getItem('userCardInfo');
    return cached ? JSON.parse(cached) : {
      name: "James Smith",
      lastFour: "5491",
      expiry: "12/28"
    };
  });

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

  // Load card info from RTDB with LocalStorage sync
  useEffect(() => {
    if (!user) return;

    // 1. Check RTDB (using standard users/ path)
    const cardRef = ref(rtdb, `users/${user.uid}/card`);
    const unsubscribe = onValue(cardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCardInfo(data);
        localStorage.setItem('userCardInfo', JSON.stringify(data));
      }
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

  const handleCardSubmit = async (newCardInfo) => {
    setIsCardFormOpen(false); // Close immediately for better UX

    // 1. Update Local State & Storage immediately (Instant)
    setCardInfo(newCardInfo);
    localStorage.setItem('userCardInfo', JSON.stringify(newCardInfo));
    setNotification("Card Details save successfully");

    try {
      if (!user) return;
      console.log("Saving card to RTDB:", user.uid, newCardInfo);

      // 2. Persist to Cloud (Standard users/ path)
      const cardRef = ref(rtdb, `users/${user.uid}/card`);
      await set(cardRef, newCardInfo);
    } catch (error) {
      // Suppress permission errors in console as we have local persistence
      if (error.code !== 'PERMISSION_DENIED') {
        console.error("Firebase update failed:", error);
      }
    }
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

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
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      setNotification("No transactions to export.");
      return;
    }

    // Headers
    const headers = ["Title", "Amount", "Type", "Category", "Date", "Notes"];

    // Rows
    const csvRows = filteredTransactions.map(tx => {
      const title = tx.title ? `"${tx.title.replace(/"/g, '""')}"` : '""';
      const amount = tx.amount || 0;
      const type = tx.type || "";
      const category = tx.category ? `"${tx.category.replace(/"/g, '""')}"` : '""';
      const date = tx.date || "";
      const notes = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '""';
      return [title, amount, type, category, date, notes].join(",");
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification("Transactions exported successfully!");
  };

  const handleResetAll = async () => {
    if (!window.confirm("⚠️ This will permanently delete ALL your transactions. Are you absolutely sure?")) return;
    try {
      const txRef = ref(rtdb, 'transactions');
      const q = rtdbQuery(txRef, orderByChild('userId'), equalTo(user.uid));
      const { get } = await import('firebase/database');
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const updates = {};
        snapshot.forEach(child => { updates[`transactions/${child.key}`] = null; });
        const { update: rtdbUpdate } = await import('firebase/database');
        await rtdbUpdate(ref(rtdb), updates);
      }
      setNotification("All transactions have been reset!");
    } catch (error) {
      console.error('Failed to reset transactions', error);
      setNotification("Reset failed. Please try again.");
    }
    setIsSupportOpen(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard-page">
      <Notification message={notification} onClose={() => setNotification("")} />
      <Navbar
        onAddClick={handleAddClick}
        onToggleTheme={toggleTheme}
        isDark={isDark}
        onSupportClick={() => setIsSupportOpen(true)}
      />

      <main className="dashboard-content">
        <section className="dashboard-header" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text)' }}>
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'User'}
          </h1>
        </section>

        <div className="dashboard-grid">
          {/* Left Column: Income & Expense (from SummaryCards) */}
          <div className="dashboard-column dashboard-column--span-3">
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
            />
          </div>

          {/* Middle Column: Overview & Trend (from DashboardCharts) */}
          <div className="dashboard-column dashboard-column--span-5">
            <DashboardCharts transactions={filteredTransactions} />
          </div>

          {/* Right Column: Transactions & Financials */}
          <div className="dashboard-column dashboard-column--span-4">
            <div className="summary-card" style={{ padding: '28px', background: 'var(--color-surface)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)' }}>My Finances</span>
                <button
                  onClick={() => setIsCardFormOpen(true)}
                  style={{ background: 'var(--color-surface-subtle)', border: 'none', color: 'var(--color-text)', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s' }}>
                  + Add card
                </button>
              </div>

              {/* Premium Credit Card Component */}
              <div style={{
                height: '190px',
                background: 'linear-gradient(135deg, #6366f1 0%, #5B5FEF 40%, #3a3db5 100%)',
                borderRadius: '20px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                color: 'white',
                /* Multi-layer outer glow */
                boxShadow: '0 8px 20px -4px rgba(91, 95, 239, 0.35), 0 20px 40px -8px rgba(91, 95, 239, 0.2)'
              }}>
                {/* Radial highlight top-right */}
                <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                {/* Soft glow bottom-left */}
                <div style={{ position: 'absolute', bottom: '-50px', left: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.4)', filter: 'blur(24px)', pointerEvents: 'none' }}></div>
                {/* Subtle lines texture */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px)', pointerEvents: 'none' }}></div>

                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Top row: VISA + chip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '22px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '2px', textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>VISA</span>
                    <div style={{ width: '34px', height: '26px', borderRadius: '4px', background: 'linear-gradient(135deg, #ffd700 0%, #c8a400 100%)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}></div>
                  </div>
                  {/* Bottom row: number + name + expiry */}
                  <div>
                    <div style={{ fontSize: '17px', letterSpacing: '4px', fontWeight: '500', marginBottom: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.15)', opacity: 0.95 }}>**** **** **** {cardInfo.lastFour}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '12px', opacity: 0.9, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '500' }}>{cardInfo.name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.85, fontFamily: 'monospace', letterSpacing: '1px' }}>{cardInfo.expiry}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar moved here */}
            <div style={{
              margin: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-subtle)' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>

            <div className="summary-card" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Wealth Overview</h3>
                <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text)' }}>$16,531.54</span>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <LoadingSpinner size="large" />
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
                  <TransactionList
                    transactions={filteredTransactions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--color-surface)',
        transition: 'var(--transition-theme)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            onClick={() => navigate("/dashboard")}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={logoImg}
              alt="FinanceTracker Logo"
              style={{
                height: '80px',
                width: 'auto',
                imageRendering: '-webkit-optimize-contrast',
                display: 'block',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))'
              }}
            />
          </div>
          <span style={{ color: 'var(--color-text-subtle)', fontSize: '13px' }}>© 2026. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button type="button" onClick={() => setIsSupportOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'inherit', transition: 'color 0.2s' }}>Support</button>
          <button type="button" onClick={handleExportCSV} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'inherit', transition: 'color 0.2s' }}>Export CSV</button>
          <button type="button" onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'inherit', transition: 'color 0.2s' }}>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
        </div>
      </footer>

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

      {/* Add Card Modal */}
      {isCardFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsCardFormOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '8px' }}>Update Card Details</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '14px' }}>Set your card display information.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCardSubmit({
                name: formData.get('name'),
                lastFour: formData.get('lastFour'),
                expiry: formData.get('expiry')
              });
            }} className="transaction-form" style={{ gap: '20px' }}>
              <label>
                Cardholder Name
                <input name="name" defaultValue={cardInfo.name} placeholder="e.g. John Doe" required />
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ flex: 1 }}>
                  Last 4 Digits
                  <input name="lastFour" defaultValue={cardInfo.lastFour} placeholder="e.g. 1234" maxLength="4" required />
                </label>
                <label style={{ flex: 1 }}>
                  Expiry Date
                  <input name="expiry" defaultValue={cardInfo.expiry} placeholder="MM/YY" required />
                </label>
              </div>

              <div className="modal-actions" style={{ marginTop: '12px' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsCardFormOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Update Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support / Reset Modal */}
      {isSupportOpen && (
        <div className="modal-backdrop" onClick={() => setIsSupportOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '8px' }}>Support & Settings</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '14px' }}>Manage your account data and preferences.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '20px 24px', background: 'var(--color-surface-subtle)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px' }}>💬 Contact Support</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Need help? Reach out to us anytime.</p>
                <a href="mailto:xyz123@gmail.com" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  xyz123@gmail.com
                </a>
              </div>

              <div style={{ padding: '20px 24px', background: 'var(--color-surface-subtle)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px' }}>📥 Export Data</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Download all your transactions as a CSV file.</p>
                <button className="secondary-btn" onClick={() => { handleExportCSV(); setIsSupportOpen(false); }} style={{ borderRadius: '12px' }}>
                  Download CSV
                </button>
              </div>

              <div style={{ padding: '20px 24px', background: 'rgba(255, 90, 95, 0.06)', borderRadius: '16px', border: '1px solid rgba(255, 90, 95, 0.2)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-danger)', marginBottom: '8px' }}>⚠️ Reset All Data</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Permanently delete all your transaction history. This action cannot be undone.</p>
                <button
                  type="button"
                  onClick={handleResetAll}
                  style={{ padding: '10px 20px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' }}
                >
                  Reset All Transactions
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button className="secondary-btn" onClick={() => setIsSupportOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

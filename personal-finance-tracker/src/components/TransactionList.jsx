function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

import EmptyState from "./ui/EmptyState.jsx";

function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon="list"
        title="No Transactions Yet"
        description="Start tracking your finances by adding your first income or expense transaction."
      />
    );
  }

  return (
    <div className="transactions-list-container">
      {transactions.map((tx) => (
        <div key={tx.id} className={`transaction-card transaction-card--${tx.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: tx.type === 'income' ? 'rgba(22, 199, 132, 0.15)' : 'rgba(255, 90, 95, 0.15)',
              color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-danger)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>
              {tx.type === 'income' ? '↓' : '↑'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text)' }}>{tx.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{formatDate(tx.date)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontWeight: '600', fontSize: '15px',
                color: tx.type === 'income' ? 'var(--color-income)' : 'var(--color-text)'
              }}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount) || 0)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {tx.category || "General"}
              </div>
            </div>

            <div className="transaction-actions">
              <button
                className="action-btn"
                onClick={() => onEdit(tx)}
                title="Edit"
                aria-label="Edit transaction"
              >
                ✎
              </button>
              <button
                className="action-btn action-btn--delete"
                onClick={() => onDelete(tx.id)}
                title="Delete"
                aria-label="Delete transaction"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;

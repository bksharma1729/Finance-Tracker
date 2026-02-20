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
    <div className="transactions-table">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td data-label="Title">{tx.title}</td>
              <td data-label="Type">
                <span className={tx.type === "income" ? "pill income" : "pill expense"}>
                  {tx.type === "income" ? "Income" : "Expense"}
                </span>
              </td>
              <td data-label="Category">{tx.category || "-"}</td>
              <td
                data-label="Amount"
                className={tx.type === "income" ? "amount-income" : "amount-expense"}
              >
                {formatCurrency(Number(tx.amount) || 0)}
              </td>
              <td data-label="Date">{formatDate(tx.date)}</td>
              <td data-label="Actions">
                <div className="row-actions">
                  <button type="button" onClick={() => onEdit(tx)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(tx.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;

import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "",
  date: "",
};

function TransactionForm({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: String(initialData.amount ?? ""),
        type: initialData.type || "expense",
        category: initialData.category || "",
        date: initialData.date || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const amountNumber = Number(form.amount);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      return;
    }

    onSubmit({
      ...form,
      amount: amountNumber,
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? "Edit Transaction" : "Add New Transaction"}</h2>

        <form className="transaction-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Salary, Grocery shopping"
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label>
            Category
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g. Food, Rent, Travel"
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {isEditing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;


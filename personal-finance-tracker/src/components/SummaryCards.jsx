import { useAnimatedNumber } from "../hooks/useAnimatedNumber.js";

function formatCurrency(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function SummaryCards({ totalIncome, totalExpense, balance }) {
  const animatedBalance = useAnimatedNumber(balance);
  const animatedIncome = useAnimatedNumber(totalIncome);
  const animatedExpense = useAnimatedNumber(totalExpense);
  const netProfit = balance; // Net profit = balance

  return (
    <div className="summary-cards">
      <div className="summary-card summary-card--balance">
        <div className="summary-card__icon">💰</div>
        <p className="summary-label">Total Balance</p>
        <p className="summary-value balance">{formatCurrency(animatedBalance)}</p>
      </div>

      <div className="summary-card summary-card--income">
        <div className="summary-card__icon">📈</div>
        <p className="summary-label">Total Income</p>
        <p className="summary-value income">{formatCurrency(animatedIncome)}</p>
      </div>

      <div className="summary-card summary-card--expense">
        <div className="summary-card__icon">📉</div>
        <p className="summary-label">Total Expense</p>
        <p className="summary-value expense">{formatCurrency(animatedExpense)}</p>
      </div>

      <div className="summary-card summary-card--profit">
        <div className="summary-card__icon">💵</div>
        <p className="summary-label">Net Profit</p>
        <p className={`summary-value profit ${netProfit >= 0 ? "profit-positive" : "profit-negative"}`}>
          {formatCurrency(netProfit)}
        </p>
      </div>
    </div>
  );
}

export default SummaryCards;


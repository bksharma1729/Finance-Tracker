import { useMemo } from "react";
import {
  Pie,
  PieChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Legend,
} from "recharts";
import EmptyState from "./ui/EmptyState.jsx";

const COLORS = [
  "#38bdf8",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#e11d48",
  "#facc15",
  "#06b6d4",
  "#8b5cf6",
];

function DashboardCharts({ transactions = [] }) {
  // Monthly Income vs Expense data
  const monthlyData = useMemo(() => {
    const monthly = {};
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      const amount = Number(tx.amount) || 0;
      if (tx.type === "income") {
        monthly[monthKey].income += amount;
      } else {
        monthly[monthKey].expense += amount;
      }
    });
    return Object.values(monthly)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        month: new Date(item.month + "-01").toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
      }));
  }, [transactions]);

  // Expense by category (for donut)
  const expenseByCategory = useMemo(() => {
    const categoryMap = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc, tx) => {
        const category = (tx.category || "Other").trim() || "Other";
        const amount = Number(tx.amount) || 0;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {});
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Income vs Expense comparison (for bar chart)
  const incomeVsExpense = useMemo(() => {
    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const totalExpense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    return [
      { name: "Income", value: totalIncome, fill: "#22c55e" },
      { name: "Expense", value: totalExpense, fill: "#f97316" },
    ];
  }, [transactions]);

  const currencyFormat = (value) =>
    value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  const hasData = transactions.length > 0;

  if (!hasData) {
    return (
      <div className="chart-card">
        <EmptyState
          icon="chart"
          title="No Analytics Data"
          description="Add transactions to see income vs expense charts and spending trends."
        />
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2 className="chart-card__title">Financial Analytics</h2>

      <div className="charts-grid">
        {/* Bar Chart: Income vs Expense */}
        <div className="chart-box chart-box--bar">
          <h3 className="chart-box__title">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={incomeVsExpense} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted, #334155)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--color-text-muted, #9ca3af)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted, #9ca3af)" fontSize={12} />
              <Tooltip
                formatter={currencyFormat}
                contentStyle={{
                  backgroundColor: "var(--surface-elevated, rgba(188, 196, 215, 0.95))",
                  border: "1px solid var(--color-border-muted, #334155)",
                  borderRadius: "8px",
                  color: "var(--color-text, #f1f5f9)",
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Monthly Trend */}
        <div className="chart-box chart-box--line">
          <h3 className="chart-box__title">Monthly Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted, #334155)" opacity={0.3} />
                <XAxis dataKey="month" stroke="var(--color-text-muted, #9ca3af)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted, #9ca3af)" fontSize={12} />
                <Tooltip
                  formatter={currencyFormat}
                  contentStyle={{
                    backgroundColor: "var(--surface-elevated, rgba(223, 226, 232, 0.95))",
                    border: "1px solid var(--color-border-muted, #334155)",
                    borderRadius: "8px",
                    color: "var(--color-text, #f1f5f9)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", r: 4 }}
                  name="Income"
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "#f97316", r: 4 }}
                  name="Expense"
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon="chart"
              title="No Monthly Data"
              description="Add transactions with dates to see monthly trends."
            />
          )}
        </div>

        {/* Donut Chart: Expense Categories */}
        <div className="chart-box chart-box--donut">
          <h3 className="chart-box__title">Expense Categories</h3>
          {expenseByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    animationDuration={800}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={currencyFormat}
                    contentStyle={{
                      backgroundColor: "var(--surface-elevated, rgba(231, 232, 235, 0.95))",
                      border: "1px solid var(--color-border-muted, #334155)",
                      borderRadius: "8px",
                      color: "var(--color-text, #f1f5f9)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="chart-legend">
                {expenseByCategory.slice(0, 6).map((entry, index) => (
                  <li key={entry.name}>
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="legend-label">{entry.name}</span>
                    <span className="legend-value">{currencyFormat(entry.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              icon="chart"
              title="No Expenses"
              description="Add expense transactions to see category breakdown."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;

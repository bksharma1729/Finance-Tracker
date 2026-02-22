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
  "#062A2B", // Dark teal
  "#10B981", // Emerald green
  "#F59E0B", // Yellow/Gold
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EF4444", // Red
  "#14B8A6", // Teal
  "#F97316", // Orange
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
      { name: "Income", value: totalIncome, fill: "#10B981" },
      { name: "Expense", value: totalExpense, fill: "#062A2B" },
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
    <div className="dashboard-column" style={{ gap: '24px' }}>
      {/* Top Chart: Overview (Half-Donut) */}
      <div className="chart-box chart-box--donut" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="chart-box__title" style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', margin: 0 }}>Overview</h3>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>View details &gt;</span>
        </div>

        {transactions.length >= 0 ? (
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" minWidth={0} height={220}>
              <PieChart>
                <Pie
                  data={[{ name: 'Available', value: 75 }, { name: 'Empty', value: 25 }]}
                  dataKey="value"
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={149}
                  outerRadius={156}
                  stroke="none"
                  animationDuration={1400}
                  cornerRadius={8}
                >
                  <Cell fill="var(--color-primary)" />
                  {/* Very subtle track for the empty part */}
                  <Cell fill="rgba(91, 95, 239, 0.07)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div style={{ position: 'absolute', bottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
                {currencyFormat(transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0))}
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>Available balance</div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="chart"
            title="No Data"
            description="Add transactions to see breakdown."
          />
        )}
      </div>

      {/* Bottom Chart: Money Flow (Line) */}
      <div className="chart-box chart-box--line" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="chart-box__title" style={{ display: 'block', fontSize: '18px', color: 'var(--color-text)', margin: 0 }}>Money Flow</h3>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Past 30 days &gt;</span>
        </div>
        <ResponsiveContainer width="100%" minWidth={0} height={280}>
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
          <ResponsiveContainer width="100%" minWidth={0} height={280}>
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
                stroke="var(--color-income)"
                strokeWidth={3}
                dot={{ fill: "var(--color-income)", r: 4 }}
                name="Income"
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-danger)"
                strokeWidth={3}
                dot={{ fill: "var(--color-danger)", r: 4 }}
                name="Expense"
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon="chart"
            title="No Trend Data"
            description="Add transactions over time to see trends."
          />
        )}
      </div>
    </div>
  );
}

export default DashboardCharts;

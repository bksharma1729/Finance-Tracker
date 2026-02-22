import { useAnimatedNumber } from "../hooks/useAnimatedNumber.js";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

const dummyIncomeData = [
  { value: 400 }, { value: 600 }, { value: 500 }, { value: 700 }, { value: 600 }, { value: 900 }, { value: 800 }
];

const dummyExpenseData = [
  { value: 300 }, { value: 500 }, { value: 400 }, { value: 700 }, { value: 600 }, { value: 450 }, { value: 800 }
];

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
      <div className="summary-card summary-card--income" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <p className="summary-label" style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</p>
          <span style={{ fontSize: '13px', color: 'var(--color-income)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ↑ 12.5%
          </span>
        </div>
        <p className="summary-value income" style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-text)', marginTop: '8px' }}>{formatCurrency(animatedIncome)}</p>
        <div style={{ height: '70px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyIncomeData}>
              <Line type="monotone" dataKey="value" stroke="var(--color-income)" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-card summary-card--expense" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <p className="summary-label" style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</p>
          <span style={{ fontSize: '13px', color: 'var(--color-danger)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ↓ 4.2%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
          <p className="summary-value" style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-text)' }}>{formatCurrency(animatedExpense)}</p>
        </div>
        <div style={{ height: '70px', marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyExpenseData}>
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;


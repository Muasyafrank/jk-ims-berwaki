import { useMemo } from 'react'
import Card from '../../components/ui/Card.jsx'
import DateRangeFilter from '../../components/ui/DateRangeFilter.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { useApp } from '../../context/AppContext.js'
import { useDateRange } from '../../hooks/useDateRange.js'
import { accountsOfType, computeBalances } from '../../lib/accounting.js'
import { sumBy } from '../../lib/calc.js'
import { formatDate, formatKES } from '../../lib/format.js'
import StatementSection from './StatementSection.jsx'

export default function ProfitLoss() {
  const { data } = useApp()
  const range = useDateRange()
  const { inRange } = range

  const { income, expenses, totalIncome, totalExpense, net } = useMemo(() => {
    const balances = computeBalances(data.accounts, inRange(data.journals))
    const incomeRows = accountsOfType(data.accounts, balances, 'Income')
    const expenseRows = accountsOfType(data.accounts, balances, 'Expense')
    const incomeTotal = sumBy(incomeRows, (account) => account.balance)
    const expenseTotal = sumBy(expenseRows, (account) => account.balance)
    return {
      income: incomeRows,
      expenses: expenseRows,
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      net: incomeTotal - expenseTotal,
    }
  }, [data.accounts, data.journals, inRange])

  return (
    <div className="page">
      <PageHeader title="Profit & Loss Statement" icon="trending-up" subtitle={`${formatDate(range.from)} — ${formatDate(range.to)}`}>
        <DateRangeFilter from={range.from} to={range.to} onFromChange={range.setFrom} onToChange={range.setTo} />
      </PageHeader>

      <div className="grid grid--stats-sm">
        <StatCard label="Total Revenue" value={formatKES(totalIncome)} tone="success" />
        <StatCard label="Total Expenses" value={formatKES(totalExpense)} tone="danger" />
        <StatCard label="Net Profit / (Loss)" value={formatKES(net)} tone={net >= 0 ? 'success' : 'danger'} />
      </div>

      <Card className="card--narrow">
        <StatementSection title="Revenue / Income" rows={income} total={totalIncome} tone="success" />
        <StatementSection title="Operating Expenses" rows={expenses} total={totalExpense} tone="danger" />
        <div className={`statement__grand tone-${net >= 0 ? 'success' : 'danger'}`}>
          <span>NET PROFIT / (LOSS)</span>
          <span className="tone-text">{formatKES(net)}</span>
        </div>
      </Card>
    </div>
  )
}

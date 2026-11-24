import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApp } from '../../context/AppContext.js'
import { accountsOfType, computeBalances, netProfit } from '../../lib/accounting.js'
import { sumBy } from '../../lib/calc.js'
import { todayISO } from '../../lib/dates.js'
import { formatDate, formatKES } from '../../lib/format.js'
import StatementSection from './StatementSection.jsx'

export default function BalanceSheet() {
  const { data } = useApp()
  const [asOf, setAsOf] = useState(() => todayISO())

  const { assets, liabilities, equity, profit, totalAssets, totalLiabilities, totalEquity, difference } = useMemo(() => {
    const balances = computeBalances(
      data.accounts,
      data.journals.filter((journal) => journal.date <= asOf),
    )
    const nonZero = (type) => accountsOfType(data.accounts, balances, type)
      .filter((account) => account.balance !== 0)
    const assetRows = nonZero('Asset')
    const liabilityRows = nonZero('Liability')
    const equityRows = nonZero('Equity')
    const currentProfit = netProfit(data.accounts, balances)
    const assetsTotal = sumBy(assetRows, (account) => account.balance)
    const liabilitiesTotal = sumBy(liabilityRows, (account) => account.balance)
    const equityTotal = sumBy(equityRows, (account) => account.balance) + currentProfit

    return {
      assets: assetRows,
      liabilities: liabilityRows,
      equity: equityRows,
      profit: currentProfit,
      totalAssets: assetsTotal,
      totalLiabilities: liabilitiesTotal,
      totalEquity: equityTotal,
      difference: assetsTotal - (liabilitiesTotal + equityTotal),
    }
  }, [asOf, data.accounts, data.journals])

  return (
    <div className="page">
      <PageHeader title="Balance Sheet" icon="building-bank" subtitle={`As at ${formatDate(asOf)}`}>
        <Input type="date" className="input--date" aria-label="As at date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </PageHeader>

      <div className="grid grid--2">
        <Card>
          <h2 className="card__title statement__heading">ASSETS</h2>
          <StatementSection caps title="Current Assets" rows={assets} total={totalAssets} tone="info" />
        </Card>
        <Card>
          <h2 className="card__title statement__heading">LIABILITIES & EQUITY</h2>
          <StatementSection caps title="Liabilities" rows={liabilities} total={totalLiabilities} tone="danger" />
          <StatementSection caps title="Equity" tone="gold" total={totalEquity}
            rows={[...equity, { code: 'NP', name: 'Current Year Profit/(Loss)', balance: profit }]} />
          <div className="statement__grand statement__grand--sm">
            <span>Total Liabilities & Equity</span><span>{formatKES(totalLiabilities + totalEquity)}</span>
          </div>
        </Card>
      </div>

      {Math.abs(difference) > 0.01 && (
        <div className="banner tone-danger" role="alert">
          ⚠ Balance sheet out of balance by {formatKES(Math.abs(difference))} — check journal entries.
        </div>
      )}
    </div>
  )
}

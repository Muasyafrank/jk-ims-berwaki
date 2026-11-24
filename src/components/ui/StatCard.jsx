import Card from './Card.jsx'
import Icon from './Icon.jsx'
import { cx } from '../../lib/classNames.js'

/**
 * KPI tile. With `icon` it renders the dashboard style (icon chip + value + label);
 * without, a centred tile with a coloured top border (used on report pages).
 */
export default function StatCard({ label, value, tone = 'neutral', icon, compact, large }) {
  if (icon) {
    return (
      <Card className={cx('stat stat--icon', `tone-${tone}`)}>
        <div className="stat__icon"><Icon name={icon} size={22} /></div>
        <div className="stat__body">
          <div className={cx('stat__value', compact && 'stat__value--sm')}>{value}</div>
          <div className="stat__label">{label}</div>
        </div>
      </Card>
    )
  }
  return (
    <Card accent tone={tone} className="stat">
      <div className={cx('stat__value', large && 'stat__value--lg')}>{value}</div>
      <div className="stat__label">{label}</div>
    </Card>
  )
}

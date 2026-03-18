import { MdTrendingUp, MdTrendingDown, MdCalendarToday, MdAttachMoney } from 'react-icons/md'
import { SkeletonCard } from '../common/Skeleton'
import styles from './SummaryCards.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0)

function pct(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default function SummaryCards({ data, loading }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const change = pct(data?.semanaActual, data?.semanaAnterior)
  const isPositive = change >= 0

  const cards = [
    {
      title: 'Semana Actual',
      value: fmt(data?.semanaActual),
      change,
      icon: MdCalendarToday,
      color: '#6366f1',
    },
    {
      title: 'Semana Anterior',
      value: fmt(data?.semanaAnterior),
      change: null,
      icon: MdCalendarToday,
      color: '#8b5cf6',
    },
    {
      title: 'Salida de Efectivo (Mes)',
      value: fmt(data?.mes),
      change: null,
      icon: MdAttachMoney,
      color: '#f59e0b',
    },
    {
      title: 'Salida de Efectivo (Año)',
      value: fmt(data?.anio),
      change: null,
      icon: MdAttachMoney,
      color: '#10b981',
    },
  ]

  return (
    <div className={styles.grid}>
      {cards.map((card, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardIcon} style={{ background: `${card.color}18`, color: card.color }}>
            <card.icon />
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardTitle}>{card.title}</p>
            <p className={styles.cardValue}>{card.value}</p>
            {card.change !== null && (
              <p className={`${styles.cardChange} ${isPositive ? styles.up : styles.down}`}>
                {isPositive ? <MdTrendingUp /> : <MdTrendingDown />}
                {Math.abs(change)}% vs semana anterior
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

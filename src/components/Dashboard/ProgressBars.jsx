import styles from './ProgressBars.module.css'
import { SkeletonChart } from '../common/Skeleton'

export default function ProgressBars({ data, loading }) {
  if (loading) return <SkeletonChart />

  const total = (data?.anio || 0)
  const mes = (data?.mes || 0)
  const semana = (data?.semanaActual || 0)
  const semanaAnt = (data?.semanaAnterior || 0)

  const metrics = [
    { label: 'Total Año', value: total, max: total || 1, fmt: true },
    { label: 'Total Mes', value: mes, max: total || 1, fmt: true },
    { label: 'Semana Actual', value: semana, max: mes || 1, fmt: true },
    { label: 'Semana Anterior', value: semanaAnt, max: mes || 1, fmt: true },
  ]

  const fmtCurrency = (v) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Métricas de gasto</h3>
      <p className={styles.subtitle}>Comparativa de períodos</p>
      <div className={styles.bars}>
        {metrics.map((m) => {
          const pct = Math.min(100, (m.value / m.max) * 100)
          return (
            <div key={m.label} className={styles.barItem}>
              <div className={styles.barHeader}>
                <span className={styles.barLabel}>{m.label}</span>
                <span className={styles.barValue}>{fmtCurrency(m.value)}</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

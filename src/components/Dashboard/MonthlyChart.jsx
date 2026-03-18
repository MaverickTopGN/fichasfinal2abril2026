import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonChart } from '../common/Skeleton'
import styles from './ChartCard.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)

export default function MonthlyChart({ data, loading }) {
  if (loading) return <SkeletonChart />

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Totales mensuales</h3>
      <p className={styles.subtitle}>Acumulado por mes del año actual</p>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => [fmt(v), 'Total']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: '13px' }}
            />
            <Bar dataKey="total" fill="#FFD700" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

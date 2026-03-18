import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonChart } from '../common/Skeleton'
import styles from './ChartCard.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)

export default function WeeklyChart({ data, loading }) {
  if (loading) return <SkeletonChart />

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Recibos esta semana</h3>
      <p className={styles.subtitle}>Montos por día de la semana</p>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradYellow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => [fmt(v), 'Monto']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: '13px' }}
            />
            <Area type="monotone" dataKey="total" stroke="#111111" strokeWidth={2} fill="url(#gradYellow)" dot={{ fill: '#FFD700', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

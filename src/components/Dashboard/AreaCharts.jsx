import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SkeletonChart } from '../common/Skeleton'
import styles from './AreaCharts.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)

export default function AreaCharts({ daily, comparison, loading }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <h3 className={styles.title}>Tendencia diaria (mes actual)</h3>
        <p className={styles.subtitle}>Montos por día del mes</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={daily} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [fmt(v), 'Monto']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: '12px' }} />
            <Area type="monotone" dataKey="total" stroke="#111" strokeWidth={2} fill="url(#gradDaily)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.card}>
        <h3 className={styles.title}>Comparación de meses</h3>
        <p className={styles.subtitle}>Mes actual vs mes anterior</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={comparison} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#374151" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#374151" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v, name) => [fmt(v), name === 'actual' ? 'Actual' : 'Anterior']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: '12px' }} />
            <Legend formatter={(v) => v === 'actual' ? 'Mes Actual' : 'Mes Anterior'} iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="actual" stroke="#FFD700" strokeWidth={2} fill="url(#gradActual)" />
            <Area type="monotone" dataKey="anterior" stroke="#374151" strokeWidth={2} fill="url(#gradAnterior)" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SkeletonChart } from '../common/Skeleton'
import styles from './DonutChart.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)

export default function DonutChart({ data, loading }) {
  if (loading) return <SkeletonChart />

  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Por operador</h3>
      <p className={styles.subtitle}>Distribución de montos</p>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [fmt(v), 'Monto']} contentStyle={{ borderRadius: '8px', border: '1px solid #e8eaed', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        {data.map((d) => (
          <div key={d.name} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: d.color }} />
            <span className={styles.legendName}>{d.name}</span>
            <span className={styles.legendValue}>
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

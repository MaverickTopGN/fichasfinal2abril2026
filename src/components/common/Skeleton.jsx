import styles from './Skeleton.module.css'

export default function Skeleton({ width, height, borderRadius, style }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton width="40px" height="40px" borderRadius="10px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="12px" borderRadius="6px" style={{ marginBottom: '8px' }} />
        <Skeleton width="80%" height="24px" borderRadius="6px" />
      </div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className={styles.chartContainer}>
      <Skeleton width="40%" height="16px" borderRadius="6px" style={{ marginBottom: '16px' }} />
      <Skeleton width="100%" height="200px" borderRadius="8px" />
    </div>
  )
}

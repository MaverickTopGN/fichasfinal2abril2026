import styles from './EmptyState.module.css'

export default function EmptyState({ onUpload }) {
  return (
    <div className={styles.container}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="120" rx="24" fill="#FFF9E6" />
        <rect x="30" y="25" width="60" height="70" rx="8" fill="#FFD700" opacity="0.3" />
        <rect x="35" y="30" width="50" height="60" rx="6" fill="white" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="44" y1="46" x2="76" y2="46" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="55" x2="76" y2="55" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="64" x2="64" y2="64" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="85" r="18" fill="#111" />
        <line x1="85" y1="77" x2="85" y2="93" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="77" y1="85" x2="93" y2="85" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h3 className={styles.title}>Sin recibos aún</h3>
      <p className={styles.text}>Sube tu primer recibo PDF para comenzar a registrar tus gastos.</p>
      {onUpload && (
        <button className={styles.btn} onClick={onUpload}>
          Subir primer recibo
        </button>
      )}
    </div>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard,
  MdAccessTime,
  MdBuild,
  MdBarChart,
  MdHelp,
  MdChat,
  MdLogout,
  MdReceipt,
  MdClose,
} from 'react-icons/md'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/actividad', icon: MdAccessTime, label: 'Actividad' },
  { to: '/herramientas', icon: MdBuild, label: 'Herramientas' },
  { to: '/analiticas', icon: MdBarChart, label: 'Analíticas' },
  { to: '/ayuda', icon: MdHelp, label: 'Ayuda' },
  { to: '/chat', icon: MdChat, label: 'Chat' },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <MdReceipt className={styles.logoIcon} />
          <span>RecibosApp</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
          <MdClose />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <Icon className={styles.icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn}>
          <MdLogout className={styles.icon} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}

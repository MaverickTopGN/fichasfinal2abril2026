import { useState, useEffect } from 'react'
import { getResumen, getWeeklySummary, getMonthlySummary, getOperatorSummary, getDailySummaryCurrentMonth, getComparisonMonths } from '../../api/recibos'
import SummaryCards from './SummaryCards'
import WeeklyChart from './WeeklyChart'
import MonthlyChart from './MonthlyChart'
import ProgressBars from './ProgressBars'
import AreaCharts from './AreaCharts'
import DonutChart from './DonutChart'
import UploadModal from '../Recibos/UploadModal'
import styles from './Dashboard.module.css'
import { MdAdd } from 'react-icons/md'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [data, setData] = useState({
    resumen: null,
    weekly: [],
    monthly: [],
    operators: [],
    daily: [],
    comparison: [],
  })

  async function loadData() {
    setLoading(true)
    try {
      const [resumen, weekly, monthly, operators, daily, comparison] = await Promise.all([
        getResumen(),
        getWeeklySummary(),
        getMonthlySummary(),
        getOperatorSummary(),
        getDailySummaryCurrentMonth(),
        getComparisonMonths(),
      ])
      setData({ resumen, weekly, monthly, operators, daily, comparison })
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleUploadSuccess() {
    setModalOpen(false)
    loadData()
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen de recibos y gastos</p>
        </div>
        <button className={styles.uploadBtn} onClick={() => setModalOpen(true)}>
          <MdAdd />
          <span>Nuevo Recibo</span>
        </button>
      </div>

      <SummaryCards data={data.resumen} loading={loading} />

      <div className={styles.row2}>
        <WeeklyChart data={data.weekly} loading={loading} />
        <DonutChart data={data.operators} loading={loading} />
      </div>

      <div className={styles.row3}>
        <ProgressBars data={data.resumen} loading={loading} />
        <MonthlyChart data={data.monthly} loading={loading} />
      </div>

      <AreaCharts daily={data.daily} comparison={data.comparison} loading={loading} />

      {modalOpen && (
        <UploadModal onClose={() => setModalOpen(false)} onSuccess={handleUploadSuccess} />
      )}
    </div>
  )
}

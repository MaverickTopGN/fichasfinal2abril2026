import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getRecibos, deleteRecibo, getPdfUrl } from '../../api/recibos'
import EmptyState from './EmptyState'
import UploadModal from './UploadModal'
import Skeleton from '../common/Skeleton'
import { MdPictureAsPdf, MdDelete, MdArrowUpward, MdArrowDownward, MdAdd, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import styles from './ReciboTable.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)

const PAGE_SIZE = 20

export default function ReciboTable() {
  const [recibos, setRecibos] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ mes: '', operador: 'TODOS' })
  const [sortKey, setSortKey] = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data, count: total } = await getRecibos({ ...filters, page, pageSize: PAGE_SIZE })
      setRecibos(data || [])
      setCount(total || 0)
    } catch (err) {
      toast.error('Error al cargar recibos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    load()
  }, [filters, page])

  const sorted = [...recibos].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (sortKey === 'monto') { av = parseFloat(av); bv = parseFloat(bv) }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  async function handleDelete(recibo) {
    if (!confirm(`¿Eliminar el recibo "${recibo.nombre_archivo}"?`)) return
    setDeleting(recibo.id)
    try {
      await deleteRecibo(recibo.id)
      toast.success('Recibo eliminado')
      load()
    } catch (err) {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <MdArrowUpward className={styles.sortIcon} /> : <MdArrowDownward className={styles.sortIcon} />
  }

  const totalPages = Math.ceil(count / PAGE_SIZE)

  // Generate month options for the last 24 months
  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: es }),
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Actividad</h1>
          <p className={styles.subtitle}>{count} recibo{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.uploadBtn} onClick={() => setModalOpen(true)}>
          <MdAdd />
          <span>Nuevo Recibo</span>
        </button>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters.mes}
          onChange={(e) => setFilters(f => ({ ...f, mes: e.target.value }))}
        >
          <option value="">Todos los meses</option>
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filters.operador}
          onChange={(e) => setFilters(f => ({ ...f, operador: e.target.value }))}
        >
          <option value="TODOS">Todos los operadores</option>
          <option value="NT">NT</option>
          <option value="JOSUE">JOSUE</option>
          <option value="LS">LS</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.skeletonRows}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <Skeleton width="80px" height="14px" borderRadius="4px" />
                <Skeleton width="60px" height="20px" borderRadius="12px" />
                <Skeleton width="100px" height="14px" borderRadius="4px" />
                <Skeleton width="150px" height="14px" borderRadius="4px" />
                <Skeleton width="32px" height="32px" borderRadius="8px" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState onUpload={() => setModalOpen(true)} />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th} onClick={() => handleSort('fecha')}>
                  Fecha <SortIcon col="fecha" />
                </th>
                <th className={styles.th} onClick={() => handleSort('operador')}>
                  Operador <SortIcon col="operador" />
                </th>
                <th className={styles.th} onClick={() => handleSort('monto')}>
                  Monto <SortIcon col="monto" />
                </th>
                <th className={styles.th}>Notas</th>
                <th className={styles.th}>Archivo</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className={styles.row}>
                  <td className={styles.td}>
                    {format(new Date(r.fecha + 'T00:00:00'), 'dd/MM/yyyy')}
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge${r.operador}`]}`}>
                      {r.operador}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.mono}`}>
                    {fmt(r.monto)}
                  </td>
                  <td className={`${styles.td} ${styles.notes}`}>
                    {r.notas || <span className={styles.empty}>—</span>}
                  </td>
                  <td className={styles.td}>
                    <a
                      href={getPdfUrl(r.ruta_archivo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pdfBtn}
                      title={r.nombre_archivo}
                    >
                      <MdPictureAsPdf />
                    </a>
                  </td>
                  <td className={styles.td}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(r)}
                      disabled={deleting === r.id}
                      title="Eliminar recibo"
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <MdChevronLeft />
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <MdChevronRight />
          </button>
        </div>
      )}

      {modalOpen && (
        <UploadModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); load() }}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getRecibos, deleteRecibo, updateRecibo, getTotalFiltered, getPdfUrl } from '../../api/recibos'
import EmptyState from './EmptyState'
import UploadModal from './UploadModal'
import BulkUploadModal from './BulkUploadModal'
import Skeleton from '../common/Skeleton'
import { MdPictureAsPdf, MdDelete, MdEdit, MdDownload, MdArrowUpward, MdArrowDownward, MdAdd, MdChevronLeft, MdChevronRight, MdLibraryAdd } from 'react-icons/md'
import styles from './ReciboTable.module.css'

const fmt = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)

const PAGE_SIZE = 20

export default function ReciboTable() {
  const [recibos, setRecibos] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ mes: '', operador: 'TODOS' })
  const [sortKey, setSortKey] = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ monto: '', operador: '', fecha: '', notas: '' })
  const [saving, setSaving] = useState(false)
  const [grandTotal, setGrandTotal] = useState({ total: 0, count: 0 })

  async function load() {
    setLoading(true)
    try {
      const { data, count: total } = await getRecibos({ ...filters, page, pageSize: PAGE_SIZE })
      setRecibos(data || [])
      setCount(total || 0)
      const totals = await getTotalFiltered(filters)
      setGrandTotal(totals)
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

  function handleEditOpen(recibo) {
    setEditing(recibo)
    setEditForm({
      monto: recibo.monto,
      operador: recibo.operador,
      fecha: recibo.fecha,
      notas: recibo.notas || '',
    })
  }

  async function handleEditSave(e) {
    e.preventDefault()
    if (!editForm.monto || parseFloat(editForm.monto) <= 0) { toast.error('Monto inválido'); return }
    setSaving(true)
    try {
      await updateRecibo(editing.id, {
        monto: parseFloat(editForm.monto),
        operador: editForm.operador,
        fecha: editForm.fecha,
        notas: editForm.notas || null,
      })
      toast.success('Recibo actualizado')
      setEditing(null)
      load()
    } catch (err) {
      toast.error('Error al actualizar')
    } finally {
      setSaving(false)
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.uploadBtnSecondary} onClick={() => setBulkOpen(true)}>
            <MdLibraryAdd />
            <span>Carga Masiva</span>
          </button>
          <button className={styles.uploadBtn} onClick={() => setModalOpen(true)}>
            <MdAdd />
            <span>Nuevo Recibo</span>
          </button>
        </div>
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
            <tfoot>
              <tr className={styles.totalRow}>
                <td className={styles.td} colSpan={2}>
                  <strong>Total {filters.mes ? monthOptions.find(m => m.value === filters.mes)?.label : 'general'}{filters.operador !== 'TODOS' ? ` — ${filters.operador}` : ''}</strong>
                </td>
                <td className={`${styles.td} ${styles.mono}`}>
                  <strong className={styles.totalAmount}>{fmt(grandTotal.total)}</strong>
                </td>
                <td className={styles.td} colSpan={3}>
                  <span className={styles.totalCount}>{grandTotal.count} recibo{grandTotal.count !== 1 ? 's' : ''}</span>
                </td>
              </tr>
            </tfoot>
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
                    <div className={styles.fileActions}>
                      <a
                        href={getPdfUrl(r.ruta_archivo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.pdfBtn}
                        title="Ver archivo"
                      >
                        <MdPictureAsPdf />
                      </a>
                      <button
                        className={styles.downloadBtn}
                        title="Descargar"
                        onClick={async () => {
                          try {
                            const url = getPdfUrl(r.ruta_archivo)
                            const res = await fetch(url)
                            const blob = await res.blob()
                            const a = document.createElement('a')
                            a.href = URL.createObjectURL(blob)
                            a.download = r.nombre_archivo
                            a.click()
                            URL.revokeObjectURL(a.href)
                          } catch { toast.error('Error al descargar') }
                        }}
                      >
                        <MdDownload />
                      </button>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditOpen(r)}
                        title="Editar recibo"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(r)}
                        disabled={deleting === r.id}
                        title="Eliminar recibo"
                      >
                        <MdDelete />
                      </button>
                    </div>
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

      {editing && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className={styles.editModal}>
            <h2 className={styles.editTitle}>Editar Recibo</h2>
            <form onSubmit={handleEditSave} className={styles.editForm}>
              <div className={styles.editField}>
                <label>Monto (MXN)</label>
                <div className={styles.editInputPrefix}>
                  <span>$</span>
                  <input
                    type="number"
                    value={editForm.monto}
                    onChange={(e) => setEditForm(f => ({ ...f, monto: e.target.value }))}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className={styles.editField}>
                <label>Operador</label>
                <select
                  value={editForm.operador}
                  onChange={(e) => setEditForm(f => ({ ...f, operador: e.target.value }))}
                >
                  <option value="NT">NT</option>
                  <option value="JOSUE">JOSUE</option>
                  <option value="LS">LS</option>
                </select>
              </div>
              <div className={styles.editField}>
                <label>Fecha</label>
                <input
                  type="date"
                  value={editForm.fecha}
                  onChange={(e) => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.editField}>
                <label>Notas</label>
                <textarea
                  value={editForm.notas}
                  onChange={(e) => setEditForm(f => ({ ...f, notas: e.target.value }))}
                  rows={3}
                  placeholder="Opcional..."
                />
              </div>
              <div className={styles.editActions}>
                <button type="button" onClick={() => setEditing(null)} disabled={saving}>Cancelar</button>
                <button type="submit" className={styles.editSaveBtn} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <UploadModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => { setModalOpen(false); load() }}
        />
      )}

      {bulkOpen && (
        <BulkUploadModal
          onClose={() => setBulkOpen(false)}
          onSuccess={() => { setBulkOpen(false); load() }}
        />
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { uploadRecibo } from '../../api/recibos'
import { MdClose, MdUploadFile, MdCheckCircle, MdError, MdAutoAwesome } from 'react-icons/md'
import styles from './BulkUploadModal.module.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function extractAmountFromImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1]
        const res = await fetch(`${SUPABASE_URL}/functions/v1/extract-amount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        })
        const data = await res.json()
        resolve(data.monto ?? null)
      } catch {
        resolve(null)
      }
    }
    reader.readAsDataURL(file)
  })
}

const DEFAULT_OPERADOR = 'NT'
const TODAY = format(new Date(), 'yyyy-MM-dd')

export default function BulkUploadModal({ onClose, onSuccess }) {
  const [items, setItems] = useState([]) // { file, preview, monto, operador, fecha, notas, status: 'pending'|'extracting'|'ready'|'uploading'|'done'|'error' }
  const [submitting, setSubmitting] = useState(false)

  const onDrop = useCallback(async (accepted) => {
    const newItems = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      monto: '',
      operador: DEFAULT_OPERADOR,
      fecha: TODAY,
      notas: '',
      status: 'extracting',
    }))

    setItems((prev) => [...prev, ...newItems])

    // Extract amounts in parallel
    for (const item of newItems) {
      if (item.file.type.startsWith('image/')) {
        extractAmountFromImage(item.file).then((monto) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, monto: monto !== null ? monto.toFixed(2) : '', status: 'ready' }
                : i
            )
          )
        })
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'ready' } : i))
        )
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff'],
    },
  })

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const allReady = items.length > 0 && items.every((i) => i.status === 'ready' || i.status === 'done' || i.status === 'error')
  const pendingItems = items.filter((i) => i.status === 'ready')
  const doneCount = items.filter((i) => i.status === 'done').length
  const extractingCount = items.filter((i) => i.status === 'extracting').length

  const handleSubmitAll = async () => {
    const toUpload = items.filter((i) => i.status === 'ready')
    if (toUpload.length === 0) return
    if (toUpload.some((i) => !i.monto || parseFloat(i.monto) <= 0)) {
      toast.error('Hay recibos sin monto válido')
      return
    }

    setSubmitting(true)

    for (const item of toUpload) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i)))
      try {
        await uploadRecibo(item.file, {
          monto: item.monto,
          operador: item.operador,
          fecha: item.fecha,
          notas: item.notas,
        })
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done' } : i)))
      } catch (err) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i)))
        toast.error(`Error con ${item.file.name}`)
      }
    }

    setSubmitting(false)
    toast.success(`${toUpload.length} recibos subidos ✅`)
    onSuccess()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Carga Masiva</h2>
            {items.length > 0 && (
              <p className={styles.subtitle}>
                {doneCount}/{items.length} subidos
                {extractingCount > 0 && ` · 🤖 Analizando ${extractingCount}...`}
              </p>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={submitting}>
            <MdClose />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        >
          <input {...getInputProps()} />
          <MdUploadFile className={styles.uploadIcon} />
          <p className={styles.dropText}>
            {isDragActive ? 'Suelta las fichas aquí' : 'Arrastra todas tus fichas aquí, o haz clic para seleccionar'}
          </p>
          <p className={styles.dropHint}>Puedes subir varias a la vez · PDF, JPG, PNG y más</p>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div className={styles.list}>
            {items.map((item, idx) => (
              <div key={item.id} className={`${styles.item} ${styles[item.status]}`}>
                {/* Left: preview/icon + name */}
                <div className={styles.itemLeft}>
                  <span className={styles.itemNum}>{idx + 1}</span>
                  {item.preview ? (
                    <img src={item.preview} alt="" className={styles.thumb} />
                  ) : (
                    <div className={styles.pdfThumb}>PDF</div>
                  )}
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.file.name}</p>
                    <p className={styles.itemSize}>{(item.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className={styles.statusIcon}>
                  {item.status === 'extracting' && (
                    <span className={styles.spinner} title="Analizando con IA..." />
                  )}
                  {item.status === 'uploading' && (
                    <span className={styles.spinnerDark} title="Subiendo..." />
                  )}
                  {item.status === 'done' && (
                    <MdCheckCircle className={styles.iconDone} />
                  )}
                  {item.status === 'error' && (
                    <MdError className={styles.iconError} />
                  )}
                </div>

                {/* Fields */}
                <div className={styles.itemFields}>
                  <div className={styles.montoWrap}>
                    <span className={styles.montoPrefix}>$</span>
                    <input
                      type="number"
                      value={item.monto}
                      onChange={(e) => updateItem(item.id, 'monto', e.target.value)}
                      placeholder={item.status === 'extracting' ? '🤖...' : '0.00'}
                      className={styles.montoInput}
                      disabled={item.status === 'extracting' || item.status === 'uploading' || item.status === 'done'}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <select
                    value={item.operador}
                    onChange={(e) => updateItem(item.id, 'operador', e.target.value)}
                    className={styles.select}
                    disabled={item.status === 'uploading' || item.status === 'done'}
                  >
                    <option value="NT">NT</option>
                    <option value="JOSUE">JOSUE</option>
                    <option value="LS">LS</option>
                  </select>

                  <input
                    type="date"
                    value={item.fecha}
                    onChange={(e) => updateItem(item.id, 'fecha', e.target.value)}
                    className={styles.dateInput}
                    disabled={item.status === 'uploading' || item.status === 'done'}
                  />
                </div>

                {/* Remove */}
                {item.status !== 'done' && item.status !== 'uploading' && (
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <p className={styles.footerInfo}>
              {extractingCount > 0
                ? `🤖 Analizando ${extractingCount} recibo${extractingCount > 1 ? 's' : ''}...`
                : `${pendingItems.length} recibo${pendingItems.length !== 1 ? 's' : ''} listo${pendingItems.length !== 1 ? 's' : ''} para subir`}
            </p>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose} disabled={submitting}>
                Cancelar
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmitAll}
                disabled={submitting || !allReady || pendingItems.length === 0}
              >
                {submitting ? (
                  <>
                    <span className={styles.spinnerWhite} />
                    Subiendo...
                  </>
                ) : (
                  `Subir ${pendingItems.length} recibo${pendingItems.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

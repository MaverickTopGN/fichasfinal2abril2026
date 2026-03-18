import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { uploadRecibo } from '../../api/recibos'
import { MdClose, MdUploadFile, MdPictureAsPdf } from 'react-icons/md'
import styles from './UploadModal.module.css'

export default function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    monto: '',
    operador: 'NT',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    notas: '',
  })

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Selecciona un archivo PDF'); return }
    if (!form.monto || parseFloat(form.monto) <= 0) { toast.error('Ingresa un monto válido'); return }

    setLoading(true)
    try {
      await uploadRecibo(file, form)
      toast.success('Recibo subido exitosamente')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Error al subir el recibo: ' + (err.message || 'Intenta de nuevo'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nuevo Recibo</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${file ? styles.hasFile : ''}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className={styles.fileInfo}>
                <MdPictureAsPdf className={styles.pdfIcon} />
                <div>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  className={styles.removeFile}
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                >
                  <MdClose />
                </button>
              </div>
            ) : (
              <div className={styles.dropContent}>
                <MdUploadFile className={styles.uploadIcon} />
                <p className={styles.dropText}>
                  {isDragActive ? 'Suelta el PDF aquí' : 'Arrastra un PDF o haz clic para seleccionar'}
                </p>
                <p className={styles.dropHint}>Solo archivos .pdf</p>
              </div>
            )}
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>Monto (MXN)</label>
              <div className={styles.inputPrefix}>
                <span>$</span>
                <input
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Operador</label>
              <select name="operador" value={form.operador} onChange={handleChange} className={styles.select}>
                <option value="NT">NT</option>
                <option value="JOSUE">JOSUE</option>
                <option value="LS">LS</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Notas (opcional)</label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={handleChange}
                placeholder="Descripción o referencia del recibo..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner} />
              ) : null}
              {loading ? 'Subiendo...' : 'Subir Recibo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

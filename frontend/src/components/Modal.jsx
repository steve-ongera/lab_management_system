// Modal.jsx
import { useEffect } from 'react'

export default function Modal({
  title,
  subtitle,
  icon,
  iconVariant = '',   // '' | 'danger' | 'warning' | 'success'
  onClose,
  onSubmit,
  submitLabel = 'Save',
  submitIcon  = 'bi-check2',
  submitVariant = 'btn-primary',
  size = '',          // '' | 'modal-sm' | 'modal-lg' | 'modal-xl'
  children,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal ${size}`}>

        {/* ── Header ── */}
        <div className="modal-header">
          {icon && (
            <div className={`modal-header-icon ${iconVariant}`}>
              <i className={`bi ${icon}`}></i>
            </div>
          )}
          <div className="modal-header-content">
            <h5 className="modal-title" id="modal-title">{title}</h5>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">{children}</div>

        {/* ── Footer ── */}
        {onSubmit && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose} type="button">
              <i className="bi bi-x"></i> Cancel
            </button>
            <button className={`btn ${submitVariant}`} onClick={onSubmit} type="button">
              <i className={`bi ${submitIcon}`}></i> {submitLabel}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
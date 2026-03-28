// ConfirmModal.jsx
import { useEffect } from 'react'

export default function ConfirmModal({
  message,
  detail,
  onConfirm,
  onClose,
  confirmLabel = 'Delete',
  confirmIcon  = 'bi-trash3',
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
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="modal modal-sm">

        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-header-icon danger">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="modal-header-content">
            <h5 className="modal-title" id="confirm-title">Confirm Delete</h5>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          <div className="confirm-modal-content">
            <div className="confirm-icon-wrap">
              <i className="bi bi-trash3-fill"></i>
            </div>
            <p className="confirm-title">Are you sure?</p>
            <p className="confirm-message">
              {message || 'Are you sure you want to delete this record? This cannot be undone.'}
            </p>
            {detail && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', marginTop: -6 }}>
                {detail}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">
            <i className="bi bi-x"></i> Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} type="button">
            <i className={`bi ${confirmIcon}`}></i> {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  )
}
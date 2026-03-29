// ConfirmModal.jsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  zIndex: 9999,
  boxSizing: 'border-box',
}

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

  const modal = (
    <div
      style={overlayStyle}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          border: '1px solid var(--border)',
          animation: 'modal-slide-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon danger">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="modal-header-content">
            <h5 className="modal-title" id="confirm-title">Confirm Delete</h5>
            <p className="modal-subtitle">This action cannot be undone</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close" type="button">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
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
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-subtle)', marginTop: '-6px' }}>
                {detail}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
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

  return createPortal(modal, document.body)
}
// Modal.jsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Overlay style is 100% inline — no CSS class can override it
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

const maxWidthMap = {
  'modal-sm': '440px',
  'modal-lg': '800px',
  'modal-xl': '1000px',
  '':         '640px',
}

export default function Modal({
  title,
  subtitle,
  icon,
  iconVariant    = '',
  onClose,
  onSubmit,
  submitLabel    = 'Save',
  submitIcon     = 'bi-check2',
  submitVariant  = 'btn-primary',
  size           = '',
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

  const modal = (
    <div
      style={overlayStyle}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: maxWidthMap[size] ?? '640px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          border: '1px solid var(--border)',
          animation: 'modal-slide-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
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
          <button className="modal-close" onClick={onClose} aria-label="Close" type="button">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
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

  // Render into document.body so NO parent CSS can affect positioning
  return createPortal(modal, document.body)
}
import { useEffect } from 'react'

export default function Modal({ title, onClose, onSubmit, children, size = '' }) {
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
        </div>
        <div className="modal-body">{children}</div>
        {onSubmit && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSubmit}>
              <i className="bi bi-check2"></i> Save
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
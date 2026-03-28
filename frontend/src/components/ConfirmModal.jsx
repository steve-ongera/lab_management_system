import Modal from './Modal'

export default function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <Modal title="Confirm Delete" onClose={onClose}>
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {message || 'Are you sure you want to delete this record? This cannot be undone.'}
      </div>
      <div className="modal-footer" style={{padding:'0',marginTop:'16px'}}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>
          <i className="bi bi-trash3"></i> Delete
        </button>
      </div>
    </Modal>
  )
}
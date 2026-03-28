import { useEffect, useState, useCallback } from 'react'
import { participantsAPI, downloadExcel } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const EMPTY = { participant_id:'', study_name:'', date_of_birth:'', age:'', sex:'M', enrollment_date:'' }

export default function Participants() {
  const [data, setData] = useState({ results:[], count:0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    participantsAPI.list({ page, search }).then(r => { setData(r.data); setLoading(false) })
  }, [page, search])

  useEffect(() => { load() }, [load])

  const showAlert = (msg, type='success') => {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3500)
  }

  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setSelected(p); setForm({...p}); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal === 'add') await participantsAPI.create(form)
      else await participantsAPI.update(selected.id, form)
      showAlert(modal === 'add' ? 'Participant added successfully.' : 'Participant updated.')
      setModal(null); load()
    } catch(e) {
      showAlert(Object.values(e.response?.data || {}).flat().join(' ') || 'Error saving.', 'danger')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await participantsAPI.remove(selected.id)
      showAlert('Participant deleted.'); setModal(null); load()
    } catch { showAlert('Error deleting.', 'danger') }
  }

  const f = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-people-fill text-primary"></i> Participants</div>
          <div className="page-subtitle">Demographics & enrollment records</div>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={() => downloadExcel(() => participantsAPI.export(), 'participants.xlsx')}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="bi bi-plus-lg"></i> Add Participant
          </button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}><i className={`bi ${alert.type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}`}></i> {alert.msg}</div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input placeholder="Search by ID or study…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} record(s)</span>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : data.results.length === 0 ? (
          <div className="empty-state"><i className="bi bi-people"></i><p>No participants found</p></div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Participant ID</th><th>Study Name</th><th>DOB</th>
                  <th>Age</th><th>Sex</th><th>Enrollment Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map(p => (
                  <tr key={p.id}>
                    <td><span className="fw-600 text-primary">{p.participant_id}</span></td>
                    <td>{p.study_name}</td>
                    <td>{p.date_of_birth}</td>
                    <td>{p.age}</td>
                    <td><span className={`badge ${p.sex==='M'?'badge-info':p.sex==='F'?'badge-primary':'badge-secondary'}`}>{p.sex_display}</span></td>
                    <td>{p.enrollment_date}</td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openEdit(p)} title="Edit"><i className="bi bi-pencil-fill text-primary"></i></button>
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openDelete(p)} title="Delete"><i className="bi bi-trash3-fill text-danger"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination count={data.count} page={page} onPage={setPage} />
      </div>

      {(modal==='add'||modal==='edit') && (
        <Modal title={modal==='add'?'Add Participant':'Edit Participant'} onClose={()=>setModal(null)} onSubmit={saving?null:handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Participant ID *</label>
              <input className="form-control" value={form.participant_id} onChange={f('participant_id')} placeholder="e.g. KNH-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Study Name *</label>
              <input className="form-control" value={form.study_name} onChange={f('study_name')} placeholder="e.g. COVID-19 Cohort" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-control" value={form.date_of_birth} onChange={f('date_of_birth')} />
            </div>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input type="number" className="form-control" value={form.age} onChange={f('age')} min="0" max="150" />
            </div>
            <div className="form-group">
              <label className="form-label">Sex *</label>
              <select className="form-control" value={form.sex} onChange={f('sex')}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Enrollment Date *</label>
              <input type="date" className="form-control" value={form.enrollment_date} onChange={f('enrollment_date')} />
            </div>
          </div>
        </Modal>
      )}

      {modal==='delete' && (
        <ConfirmModal onConfirm={handleDelete} onClose={()=>setModal(null)}
          message={`Delete participant "${selected?.participant_id}"? This will also remove all linked samples.`} />
      )}
    </>
  )
}
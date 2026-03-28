import { useEffect, useState, useCallback } from 'react'
import { storageAPI, processingAPI, downloadExcel } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const EMPTY = {
  processing:'', sample_id:'', freezer_id:'', fridge_id:'', shelf_number:'',
  rack_number:'', box_number:'', position:'', storage_temperature:'-80',
  date_stored:'', storage_condition:'good', retrieval_datetime:'',
  retrieved_by:'', retrieval_condition:''
}

const TEMP_COLOR = { '2-8':'badge-info', '-20':'badge-warning', '-80':'badge-primary' }

export default function Storage() {
  const [data, setData] = useState({ results:[], count:0 })
  const [processings, setProcessings] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    storageAPI.list({ page, search }).then(r => { setData(r.data); setLoading(false) })
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    processingAPI.list({ page_size: 200 }).then(r => setProcessings(r.data.results || []))
  }, [])

  const showAlert = (msg, type='success') => { setAlert({msg,type}); setTimeout(()=>setAlert(null),3500) }
  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setSelected(p); setForm({...p}); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal==='add') await storageAPI.create(form)
      else await storageAPI.update(selected.id, form)
      showAlert('Saved.'); setModal(null); load()
    } catch(e) {
      showAlert(Object.values(e.response?.data||{}).flat().join(' ')||'Error.','danger')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await storageAPI.remove(selected.id); showAlert('Deleted.'); setModal(null); load() }
    catch { showAlert('Error.','danger') }
  }

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-box-seam-fill text-primary"></i> Sample Storage</div>
          <div className="page-subtitle">Storage location & retrieval tracking</div>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={()=>downloadExcel(()=>storageAPI.export(),'sample_storage.xlsx')}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="bi bi-plus-lg"></i> Add Record</button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}><i className={`bi ${alert.type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}`}></i> {alert.msg}</div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box"><i className="bi bi-search"></i>
            <input placeholder="Search sample ID, freezer…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} record(s)</span>
        </div>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : data.results.length===0 ? <div className="empty-state"><i className="bi bi-box-seam"></i><p>No storage records</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Sample ID</th><th>Participant</th><th>Temperature</th><th>Location</th><th>Date Stored</th><th>Condition</th><th>Retrieved By</th><th>Actions</th></tr></thead>
              <tbody>
                {data.results.map(s => (
                  <tr key={s.id}>
                    <td><span className="fw-600 text-primary">{s.sample_id}</span></td>
                    <td>{s.participant_id}</td>
                    <td><span className={`badge ${TEMP_COLOR[s.storage_temperature]||'badge-secondary'}`}>{s.temperature_display}</span></td>
                    <td style={{fontSize:'0.78rem'}}>
                      {s.freezer_id && <span>Freezer: {s.freezer_id} </span>}
                      {s.fridge_id && <span>Fridge: {s.fridge_id} </span>}
                      {s.shelf_number && <span>Shelf: {s.shelf_number} </span>}
                      {s.box_number && <span>Box: {s.box_number}</span>}
                    </td>
                    <td>{s.date_stored}</td>
                    <td><span className={`badge ${s.storage_condition==='good'?'badge-success':'badge-danger'}`}>{s.storage_condition}</span></td>
                    <td>{s.retrieved_by||'—'}</td>
                    <td><div className="d-flex gap-8">
                      <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openEdit(s)}><i className="bi bi-pencil-fill text-primary"></i></button>
                      <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openDelete(s)}><i className="bi bi-trash3-fill text-danger"></i></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination count={data.count} page={page} onPage={setPage} />
      </div>

      {(modal==='add'||modal==='edit') && (
        <Modal title={modal==='add'?'Add Storage Record':'Edit Record'} onClose={()=>setModal(null)} onSubmit={saving?null:handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Processing Record *</label>
              <select className="form-control" value={form.processing} onChange={f('processing')}>
                <option value="">-- Select --</option>
                {processings.map(p=><option key={p.id} value={p.id}>{p.accession_number} – {p.reception_date}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sample ID *</label>
              <input className="form-control" value={form.sample_id} onChange={f('sample_id')} placeholder="SMP-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Freezer ID</label>
              <input className="form-control" value={form.freezer_id} onChange={f('freezer_id')} placeholder="FRZ-A" />
            </div>
            <div className="form-group">
              <label className="form-label">Fridge ID</label>
              <input className="form-control" value={form.fridge_id} onChange={f('fridge_id')} placeholder="FRD-B" />
            </div>
            <div className="form-group">
              <label className="form-label">Shelf Number</label>
              <input className="form-control" value={form.shelf_number} onChange={f('shelf_number')} placeholder="S1" />
            </div>
            <div className="form-group">
              <label className="form-label">Rack Number</label>
              <input className="form-control" value={form.rack_number} onChange={f('rack_number')} placeholder="R2" />
            </div>
            <div className="form-group">
              <label className="form-label">Box Number</label>
              <input className="form-control" value={form.box_number} onChange={f('box_number')} placeholder="B3" />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input className="form-control" value={form.position} onChange={f('position')} placeholder="A1" />
            </div>
            <div className="form-group">
              <label className="form-label">Storage Temperature</label>
              <select className="form-control" value={form.storage_temperature} onChange={f('storage_temperature')}>
                <option value="2-8">2°C to 8°C</option>
                <option value="-20">-20°C</option>
                <option value="-80">-80°C</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Stored *</label>
              <input type="date" className="form-control" value={form.date_stored} onChange={f('date_stored')} />
            </div>
            <div className="form-group">
              <label className="form-label">Storage Condition</label>
              <select className="form-control" value={form.storage_condition} onChange={f('storage_condition')}>
                <option value="good">Good</option><option value="compromised">Compromised</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Retrieved By</label>
              <input className="form-control" value={form.retrieved_by} onChange={f('retrieved_by')} placeholder="Staff name" />
            </div>
            <div className="form-group">
              <label className="form-label">Retrieval Date/Time</label>
              <input type="datetime-local" className="form-control" value={form.retrieval_datetime} onChange={f('retrieval_datetime')} />
            </div>
            <div className="form-group">
              <label className="form-label">Retrieval Condition</label>
              <select className="form-control" value={form.retrieval_condition} onChange={f('retrieval_condition')}>
                <option value="">-- N/A --</option>
                <option value="good">Good</option><option value="compromised">Compromised</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
      {modal==='delete' && <ConfirmModal onConfirm={handleDelete} onClose={()=>setModal(null)} message={`Delete storage record for sample "${selected?.sample_id}"?`} />}
    </>
  )
}
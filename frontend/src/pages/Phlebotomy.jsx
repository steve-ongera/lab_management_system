import { useEffect, useState, useCallback } from 'react'
import { phlebotomyAPI, participantsAPI, downloadExcel } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const EMPTY = {
  participant:'', collector_name:'', collection_date:'', collection_time:'',
  sample_type:'blood', tube_type:'EDTA', volume_collected:'6ML',
  collection_site:'venous', collection_notes:'SUFFICIENT', collection_notes_other:'',
  consented:true, visit_type:'baseline', sample_collected:true, no_collection_reason:''
}

const BADGE = { blood:'badge-danger', sputum:'badge-warning', urine:'badge-info', other:'badge-secondary' }

export default function Phlebotomy() {
  const [data, setData] = useState({ results:[], count:0 })
  const [participants, setParticipants] = useState([])
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
    phlebotomyAPI.list({ page, search }).then(r => { setData(r.data); setLoading(false) })
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    participantsAPI.list({ page_size: 200 }).then(r => setParticipants(r.data.results || []))
  }, [])

  const showAlert = (msg, type='success') => { setAlert({msg,type}); setTimeout(()=>setAlert(null),3500) }
  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setSelected(p); setForm({...p, participant: p.participant}); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal==='add') await phlebotomyAPI.create(form)
      else await phlebotomyAPI.update(selected.id, form)
      showAlert('Saved successfully.'); setModal(null); load()
    } catch(e) {
      showAlert(Object.values(e.response?.data||{}).flat().join(' ')||'Error saving.','danger')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await phlebotomyAPI.remove(selected.id); showAlert('Deleted.'); setModal(null); load() }
    catch { showAlert('Error deleting.','danger') }
  }

  const f = (k) => (e) => setForm(p => ({...p, [k]: e.target.type==='checkbox'?e.target.checked:e.target.value}))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-droplet-fill text-primary"></i> Phlebotomy</div>
          <div className="page-subtitle">Sample collection records</div>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={() => downloadExcel(()=>phlebotomyAPI.export(),'phlebotomy.xlsx')}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <i className="bi bi-plus-lg"></i> Add Record
          </button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}><i className={`bi ${alert.type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}`}></i> {alert.msg}</div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input placeholder="Search by participant, collector…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} record(s)</span>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : data.results.length===0 ? <div className="empty-state"><i className="bi bi-droplet"></i><p>No phlebotomy records found</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr><th>Participant</th><th>Date</th><th>Sample Type</th><th>Tube Type</th><th>Volume</th><th>Site</th><th>Visit</th><th>Consented</th><th>Collected</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.results.map(p => (
                  <tr key={p.id}>
                    <td><span className="fw-600 text-primary">{p.participant_id_display}</span></td>
                    <td>{p.collection_date} {p.collection_time?.slice(0,5)}</td>
                    <td><span className={`badge ${BADGE[p.sample_type]||'badge-secondary'}`}>{p.sample_type_display}</span></td>
                    <td>{p.tube_type_display}</td>
                    <td>{p.volume_collected}</td>
                    <td>{p.collection_site}</td>
                    <td><span className="badge badge-secondary">{p.visit_type_display}</span></td>
                    <td><span className={`badge ${p.consented?'badge-success':'badge-danger'}`}>{p.consented?'Yes':'No'}</span></td>
                    <td><span className={`badge ${p.sample_collected?'badge-success':'badge-danger'}`}>{p.sample_collected?'Yes':'No'}</span></td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openEdit(p)}><i className="bi bi-pencil-fill text-primary"></i></button>
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openDelete(p)}><i className="bi bi-trash3-fill text-danger"></i></button>
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
        <Modal title={modal==='add'?'Add Phlebotomy Record':'Edit Record'} onClose={()=>setModal(null)} onSubmit={saving?null:handleSave} size="large">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Participant *</label>
              <select className="form-control" value={form.participant} onChange={f('participant')}>
                <option value="">-- Select --</option>
                {participants.map(p => <option key={p.id} value={p.id}>{p.participant_id} – {p.study_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Collector Name *</label>
              <input className="form-control" value={form.collector_name} onChange={f('collector_name')} placeholder="Dr. Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Collection Date *</label>
              <input type="date" className="form-control" value={form.collection_date} onChange={f('collection_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Collection Time *</label>
              <input type="time" className="form-control" value={form.collection_time} onChange={f('collection_time')} />
            </div>
            <div className="form-group">
              <label className="form-label">Sample Type</label>
              <select className="form-control" value={form.sample_type} onChange={f('sample_type')}>
                <option value="blood">Blood</option><option value="sputum">Sputum</option>
                <option value="urine">Urine</option><option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tube Type</label>
              <select className="form-control" value={form.tube_type} onChange={f('tube_type')}>
                <option value="EDTA">EDTA</option><option value="LIHEP">Li-Hep</option>
                <option value="SST">SST</option><option value="SODIUM_CITRATE">Sodium Citrate</option>
                <option value="BLOOD_CULTURE">Blood Culture</option><option value="RED_TOP">Red Top</option>
                <option value="URINE_CONTAINER">Urine Container</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Volume Collected</label>
              <select className="form-control" value={form.volume_collected} onChange={f('volume_collected')}>
                <option value="3ML">3 mL</option><option value="6ML">6 mL</option>
                <option value="10ML">10 mL</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Collection Site</label>
              <select className="form-control" value={form.collection_site} onChange={f('collection_site')}>
                <option value="venous">Venous</option><option value="capillary">Capillary</option>
                <option value="arterial">Arterial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Collection Notes</label>
              <select className="form-control" value={form.collection_notes} onChange={f('collection_notes')}>
                <option value="SUFFICIENT">Sample Sufficient</option>
                <option value="INSUFFICIENT">Sample Insufficient</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Visit Type</label>
              <select className="form-control" value={form.visit_type} onChange={f('visit_type')}>
                <option value="screening">Screening</option><option value="baseline">Baseline</option>
                <option value="follow_up">Follow-up</option><option value="exit">Exit</option>
                <option value="unscheduled">Unscheduled</option>
              </select>
            </div>
            <div className="form-group" style={{display:'flex',alignItems:'center',gap:10,marginTop:28}}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',margin:0}}>
                <input type="checkbox" checked={form.consented} onChange={f('consented')} />
                <span className="form-label" style={{margin:0}}>Consented</span>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',margin:0,marginLeft:16}}>
                <input type="checkbox" checked={form.sample_collected} onChange={f('sample_collected')} />
                <span className="form-label" style={{margin:0}}>Sample Collected</span>
              </label>
            </div>
            {!form.sample_collected && (
              <div className="form-group full">
                <label className="form-label">Reason Not Collected</label>
                <textarea className="form-control" rows={2} value={form.no_collection_reason} onChange={f('no_collection_reason')} />
              </div>
            )}
          </div>
        </Modal>
      )}

      {modal==='delete' && (
        <ConfirmModal onConfirm={handleDelete} onClose={()=>setModal(null)}
          message={`Delete phlebotomy record for participant "${selected?.participant_id_display}"?`} />
      )}
    </>
  )
}
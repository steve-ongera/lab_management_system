import { useEffect, useState, useCallback } from 'react'
import { processingAPI, phlebotomyAPI, downloadExcel } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const EMPTY = {
  phlebotomy:'', accession_number:'', reception_date:'', reception_time:'',
  tubes_edta:0, tubes_lihep:0, tubes_sst:0, tubes_sodium_citrate:0,
  tubes_blood_culture:0, tubes_red_top:0, tubes_other:0,
  processing_type:'centrifugation', aliquot_number:'', technologist_initials:'',
  equipment_used:'', centrifugation_start:'', centrifugation_end:'',
  incubation_start:'', incubation_end:'', results_dispatch_time:'', results_dispatched_to:''
}

const BADGE = { centrifugation:'badge-primary', incubation:'badge-warning', aliquoting:'badge-info', other:'badge-secondary' }

export default function Processing() {
  const [data, setData] = useState({ results:[], count:0 })
  const [phlebotomies, setPhlebotomies] = useState([])
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
    processingAPI.list({ page, search }).then(r => { setData(r.data); setLoading(false) })
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    phlebotomyAPI.list({ page_size: 200 }).then(r => setPhlebotomies(r.data.results || []))
  }, [])

  const showAlert = (msg, type='success') => { setAlert({msg,type}); setTimeout(()=>setAlert(null),3500) }
  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setSelected(p); setForm({...p}); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal==='add') await processingAPI.create(form)
      else await processingAPI.update(selected.id, form)
      showAlert('Saved successfully.'); setModal(null); load()
    } catch(e) {
      showAlert(Object.values(e.response?.data||{}).flat().join(' ')||'Error.','danger')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await processingAPI.remove(selected.id); showAlert('Deleted.'); setModal(null); load() }
    catch { showAlert('Error.','danger') }
  }

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-gear-fill text-primary"></i> Sample Processing</div>
          <div className="page-subtitle">Processing, centrifugation & aliquoting records</div>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={()=>downloadExcel(()=>processingAPI.export(),'sample_processing.xlsx')}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="bi bi-plus-lg"></i> Add Record</button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}><i className={`bi ${alert.type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}`}></i> {alert.msg}</div>}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box"><i className="bi bi-search"></i>
            <input placeholder="Search accession, technologist…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} record(s)</span>
        </div>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : data.results.length===0 ? <div className="empty-state"><i className="bi bi-gear"></i><p>No processing records</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Accession #</th><th>Participant</th><th>Reception Date</th><th>Processing Type</th><th>Aliquot #</th><th>Technologist</th><th>Equipment</th><th>Actions</th></tr></thead>
              <tbody>
                {data.results.map(p => (
                  <tr key={p.id}>
                    <td><span className="fw-600 text-primary">{p.accession_number}</span></td>
                    <td>{p.participant_id}</td>
                    <td>{p.reception_date} {p.reception_time?.slice(0,5)}</td>
                    <td><span className={`badge ${BADGE[p.processing_type]||'badge-secondary'}`}>{p.processing_type_display}</span></td>
                    <td>{p.aliquot_number||'—'}</td>
                    <td>{p.technologist_initials}</td>
                    <td>{p.equipment_used||'—'}</td>
                    <td><div className="d-flex gap-8">
                      <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openEdit(p)}><i className="bi bi-pencil-fill text-primary"></i></button>
                      <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openDelete(p)}><i className="bi bi-trash3-fill text-danger"></i></button>
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
        <Modal title={modal==='add'?'Add Processing Record':'Edit Record'} onClose={()=>setModal(null)} onSubmit={saving?null:handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phlebotomy Record *</label>
              <select className="form-control" value={form.phlebotomy} onChange={f('phlebotomy')}>
                <option value="">-- Select --</option>
                {phlebotomies.map(p=><option key={p.id} value={p.id}>{p.participant_id_display} – {p.collection_date} ({p.sample_type_display})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Accession Number *</label>
              <input className="form-control" value={form.accession_number} onChange={f('accession_number')} placeholder="ACC-2024-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Reception Date *</label>
              <input type="date" className="form-control" value={form.reception_date} onChange={f('reception_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Reception Time *</label>
              <input type="time" className="form-control" value={form.reception_time} onChange={f('reception_time')} />
            </div>
            <div className="form-group">
              <label className="form-label">Processing Type</label>
              <select className="form-control" value={form.processing_type} onChange={f('processing_type')}>
                <option value="centrifugation">Centrifugation</option><option value="incubation">Incubation</option>
                <option value="aliquoting">Aliquoting</option><option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Technologist Initials</label>
              <input className="form-control" value={form.technologist_initials} onChange={f('technologist_initials')} placeholder="JW" maxLength={10} />
            </div>
            <div className="form-group">
              <label className="form-label">Aliquot Number</label>
              <input className="form-control" value={form.aliquot_number} onChange={f('aliquot_number')} placeholder="CRY-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Used</label>
              <select className="form-control" value={form.equipment_used} onChange={f('equipment_used')}>
                <option value="">-- None --</option>
                <option value="ref_centrifuge">Refrigerated Centrifuge</option>
                <option value="non_ref_centrifuge">Non-Refrigerated Centrifuge</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <p style={{fontSize:'0.75rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',margin:'12px 0 8px'}}>Tubes Received</p>
          <div className="form-row">
            {[['tubes_edta','EDTA'],['tubes_lihep','Li-Hep'],['tubes_sst','SST'],['tubes_sodium_citrate','Sodium Citrate'],['tubes_blood_culture','Blood Culture'],['tubes_red_top','Red Top'],['tubes_other','Other']].map(([k,lbl])=>(
              <div className="form-group" key={k} style={{gridColumn:'span 1'}}>
                <label className="form-label">{lbl}</label>
                <input type="number" className="form-control" value={form[k]} onChange={f(k)} min={0} />
              </div>
            ))}
          </div>

          {form.processing_type==='centrifugation' && (
            <>
              <p style={{fontSize:'0.75rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',margin:'12px 0 8px'}}>Centrifugation</p>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" className="form-control" value={form.centrifugation_start} onChange={f('centrifugation_start')} /></div>
                <div className="form-group"><label className="form-label">End</label><input type="datetime-local" className="form-control" value={form.centrifugation_end} onChange={f('centrifugation_end')} /></div>
              </div>
            </>
          )}
          {form.processing_type==='incubation' && (
            <>
              <p style={{fontSize:'0.75rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',margin:'12px 0 8px'}}>Incubation</p>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Start</label><input type="datetime-local" className="form-control" value={form.incubation_start} onChange={f('incubation_start')} /></div>
                <div className="form-group"><label className="form-label">End</label><input type="datetime-local" className="form-control" value={form.incubation_end} onChange={f('incubation_end')} /></div>
              </div>
            </>
          )}
          <div className="form-row" style={{marginTop:8}}>
            <div className="form-group"><label className="form-label">Results Dispatched To</label><input className="form-control" value={form.results_dispatched_to} onChange={f('results_dispatched_to')} placeholder="Recipient name/dept" /></div>
            <div className="form-group"><label className="form-label">Dispatch Time</label><input type="datetime-local" className="form-control" value={form.results_dispatch_time} onChange={f('results_dispatch_time')} /></div>
          </div>
        </Modal>
      )}
      {modal==='delete' && <ConfirmModal onConfirm={handleDelete} onClose={()=>setModal(null)} message={`Delete processing record "${selected?.accession_number}"?`} />}
    </>
  )
}
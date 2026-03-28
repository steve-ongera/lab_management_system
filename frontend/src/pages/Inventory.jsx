//inventory.jsx
import { useEffect, useState, useCallback } from 'react'
import { stockAPI, downloadExcel } from '../utils/api'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'

const EMPTY = {
  item_id:'', item_name:'', category:'consumable', supplier:'',
  batch_number:'', expiry_date:'', quantity_available:'', unit:'pieces',
  storage_location:'main_store', condition_received:'good',
  rejection_reason:'', received_by:'', reception_date:''
}

export default function Inventory() {
  const [data, setData] = useState({ results:[], count:0 })
  const [tab, setTab] = useState('all')
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
    const fn = tab==='low' ? stockAPI.lowStock : tab==='expiring' ? stockAPI.expiring : () => stockAPI.list({ page, search })
    fn().then(r => {
      if (tab==='all') setData(r.data)
      else setData({ results: r.data, count: r.data.length })
      setLoading(false)
    })
  }, [page, search, tab])

  useEffect(() => { load() }, [load])

  const showAlert = (msg, type='success') => { setAlert({msg,type}); setTimeout(()=>setAlert(null),3500) }
  const openAdd = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setSelected(p); setForm({...p}); setModal('edit') }
  const openDelete = (p) => { setSelected(p); setModal('delete') }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (modal==='add') await stockAPI.create(form)
      else await stockAPI.update(selected.id, form)
      showAlert('Saved.'); setModal(null); load()
    } catch(e) {
      showAlert(Object.values(e.response?.data||{}).flat().join(' ')||'Error.','danger')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await stockAPI.remove(selected.id); showAlert('Deleted.'); setModal(null); load() }
    catch { showAlert('Error.','danger') }
  }

  const f = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const today = new Date().toISOString().slice(0,10)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-clipboard2-pulse-fill text-primary"></i> Stock Inventory</div>
          <div className="page-subtitle">Reagents, consumables & stock management</div>
        </div>
        <div className="d-flex gap-8">
          <button className="btn btn-outline btn-sm" onClick={()=>downloadExcel(()=>stockAPI.export(),'stock_inventory.xlsx')}>
            <i className="bi bi-file-earmark-excel"></i> Export
          </button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="bi bi-plus-lg"></i> Add Item</button>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}><i className={`bi ${alert.type==='success'?'bi-check-circle-fill':'bi-exclamation-circle-fill'}`}></i> {alert.msg}</div>}

      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[['all','All Items','bi-list-ul'],['low','Low Stock','bi-arrow-down-circle-fill'],['expiring','Expiring Soon','bi-calendar-x-fill']].map(([key,label,icon])=>(
          <button key={key} className={`btn btn-sm ${tab===key?'btn-primary':'btn-ghost'}`} onClick={()=>{setTab(key);setPage(1)}}>
            <i className={`bi ${icon}`}></i> {label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box"><i className="bi bi-search"></i>
            <input placeholder="Search item, supplier, batch…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} item(s)</span>
        </div>
        {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : data.results.length===0 ? <div className="empty-state"><i className="bi bi-clipboard2"></i><p>No items found</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Item ID</th><th>Name</th><th>Category</th><th>Qty</th><th>Unit</th><th>Supplier</th><th>Batch</th><th>Expiry</th><th>Location</th><th>Condition</th><th>Actions</th></tr></thead>
              <tbody>
                {data.results.map(item => {
                  const expired = item.expiry_date < today
                  const expiringSoon = !expired && item.expiry_date <= new Date(Date.now()+30*86400000).toISOString().slice(0,10)
                  return (
                    <tr key={item.id}>
                      <td><span className="fw-600 text-primary">{item.item_id}</span></td>
                      <td>{item.item_name}</td>
                      <td><span className={`badge ${item.category==='reagent'?'badge-primary':'badge-info'}`}>{item.category_display}</span></td>
                      <td>
                        <span className={item.is_low_stock?'text-danger fw-600':''}>{parseFloat(item.quantity_available)}</span>
                        {item.is_low_stock && <i className="bi bi-exclamation-triangle-fill text-warning" style={{marginLeft:4,fontSize:'0.75rem'}}></i>}
                      </td>
                      <td>{item.unit}</td>
                      <td>{item.supplier}</td>
                      <td style={{fontSize:'0.78rem'}}>{item.batch_number}</td>
                      <td>
                        <span className={expired?'text-danger fw-600':expiringSoon?'text-warning fw-600':''}>{item.expiry_date}</span>
                        {expired && <span className="badge badge-danger" style={{marginLeft:4}}>Expired</span>}
                        {expiringSoon && <span className="badge badge-warning" style={{marginLeft:4}}>Soon</span>}
                      </td>
                      <td><span className="badge badge-secondary" style={{fontSize:'0.68rem'}}>{item.location_display}</span></td>
                      <td><span className={`badge ${item.condition_received==='good'?'badge-success':item.condition_received==='damaged'?'badge-warning':'badge-danger'}`}>{item.condition_received}</span></td>
                      <td><div className="d-flex gap-8">
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openEdit(item)}><i className="bi bi-pencil-fill text-primary"></i></button>
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={()=>openDelete(item)}><i className="bi bi-trash3-fill text-danger"></i></button>
                      </div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {tab==='all' && <Pagination count={data.count} page={page} onPage={setPage} />}
      </div>

      {(modal==='add'||modal==='edit') && (
        <Modal title={modal==='add'?'Add Stock Item':'Edit Stock Item'} onClose={()=>setModal(null)} onSubmit={saving?null:handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item ID *</label>
              <input className="form-control" value={form.item_id} onChange={f('item_id')} placeholder="STK-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className="form-control" value={form.item_name} onChange={f('item_name')} placeholder="EDTA Tubes 6mL" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={f('category')}>
                <option value="consumable">Consumable</option>
                <option value="reagent">Reagent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier *</label>
              <input className="form-control" value={form.supplier} onChange={f('supplier')} placeholder="BD Vacutainer" />
            </div>
            <div className="form-group">
              <label className="form-label">Batch Number *</label>
              <input className="form-control" value={form.batch_number} onChange={f('batch_number')} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input type="date" className="form-control" value={form.expiry_date} onChange={f('expiry_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Available *</label>
              <input type="number" className="form-control" value={form.quantity_available} onChange={f('quantity_available')} min={0} step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-control" value={form.unit} onChange={f('unit')}>
                <option value="pieces">Pieces</option><option value="boxes">Boxes</option>
                <option value="liters">Liters</option><option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <select className="form-control" value={form.storage_location} onChange={f('storage_location')}>
                <option value="main_store">Main Store</option>
                <option value="departmental_store">Departmental Store</option>
                <option value="quarantine_store">Quarantine Store</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition Received</label>
              <select className="form-control" value={form.condition_received} onChange={f('condition_received')}>
                <option value="good">Good</option><option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Received By *</label>
              <input className="form-control" value={form.received_by} onChange={f('received_by')} placeholder="Store Keeper" />
            </div>
            <div className="form-group">
              <label className="form-label">Reception Date *</label>
              <input type="date" className="form-control" value={form.reception_date} onChange={f('reception_date')} />
            </div>
            {form.condition_received!=='good' && (
              <div className="form-group full">
                <label className="form-label">Rejection Reason</label>
                <textarea className="form-control" rows={2} value={form.rejection_reason} onChange={f('rejection_reason')} />
              </div>
            )}
          </div>
        </Modal>
      )}
      {modal==='delete' && <ConfirmModal onConfirm={handleDelete} onClose={()=>setModal(null)} message={`Delete stock item "${selected?.item_name}" (${selected?.item_id})?`} />}
    </>
  )
}
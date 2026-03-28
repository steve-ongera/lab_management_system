import { useEffect, useState, useCallback } from 'react'
import { auditAPI } from '../utils/api'
import Pagination from '../components/Pagination'

const ACTION_BADGE = { create:'badge-success', update:'badge-warning', delete:'badge-danger' }
const ACTION_ICON = { create:'bi-plus-circle-fill', update:'bi-pencil-fill', delete:'bi-trash3-fill' }

export default function AuditLogs() {
  const [data, setData] = useState({ results:[], count:0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, search }
    if (actionFilter) params.action = actionFilter
    auditAPI.list(params).then(r => { setData(r.data); setLoading(false) })
  }, [page, search, actionFilter])

  useEffect(() => { load() }, [load])

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title"><i className="bi bi-journal-text text-primary"></i> Audit Logs</div>
          <div className="page-subtitle">System activity & change history (read-only)</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box"><i className="bi bi-search"></i>
            <input placeholder="Search user, record…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
          </div>
          <select className="form-control" style={{width:'auto',minWidth:140}} value={actionFilter} onChange={e=>{setActionFilter(e.target.value);setPage(1)}}>
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <span className="ms-auto text-muted" style={{fontSize:'0.8rem'}}>{data.count} log(s)</span>
        </div>

        {loading ? <div className="loading-center"><div className="spinner"></div></div>
        : data.results.length===0 ? <div className="empty-state"><i className="bi bi-journal"></i><p>No audit logs found</p></div>
        : (
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Record</th></tr></thead>
              <tbody>
                {data.results.map(log => (
                  <tr key={log.id}>
                    <td style={{fontSize:'0.8rem',whiteSpace:'nowrap'}}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><span className="fw-600">{log.user_display||'System'}</span></td>
                    <td>
                      <span className={`badge ${ACTION_BADGE[log.action]||'badge-secondary'}`}>
                        <i className={`bi ${ACTION_ICON[log.action]} me-1`} style={{marginRight:4}}></i>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="badge badge-primary">{log.model_name}</span></td>
                    <td style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{log.object_repr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination count={data.count} page={page} onPage={setPage} />
      </div>
    </>
  )
}
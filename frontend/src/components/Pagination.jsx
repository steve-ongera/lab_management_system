export default function Pagination({ count, page, pageSize = 20, onPage }) {
  const total = Math.ceil(count / pageSize)
  if (total <= 1) return null
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  const visible = pages.filter(p => p === 1 || p === total || Math.abs(p - page) <= 1)

  return (
    <div className="pagination">
      <span className="page-info">
        Showing {Math.min((page-1)*pageSize+1, count)}–{Math.min(page*pageSize, count)} of {count}
      </span>
      <button className="btn btn-sm btn-ghost" disabled={page===1} onClick={() => onPage(page-1)}>
        <i className="bi bi-chevron-left"></i>
      </button>
      {visible.map((p, i) => (
        <span key={p}>
          {i > 0 && visible[i-1] !== p - 1 && <span style={{color:'var(--text-muted)',padding:'0 4px'}}>…</span>}
          <button
            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onPage(p)}
          >{p}</button>
        </span>
      ))}
      <button className="btn btn-sm btn-ghost" disabled={page===total} onClick={() => onPage(page+1)}>
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  )
}
// Dashboard.jsx
import { useEffect, useState } from 'react'
import { dashboardAPI } from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts'

// Aligned with new brand palette
const CHART_COLORS = ['#0271c6', '#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, iconClass, label, value, sub, subPositive }) {
  return (
    <div className={`stat-card ${iconClass}`}>
      <div className={`stat-icon ${iconClass}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {sub && (
          <div className="stat-sub">
            {subPositive !== undefined && (
              <i className={`bi ${subPositive ? 'bi-arrow-up-short positive' : 'bi-arrow-down-short'}`}></i>
            )}
            <span>{sub}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--gray-900)',
      color: '#fff',
      borderRadius: 'var(--radius)',
      padding: '8px 12px',
      fontSize: 'var(--text-sm)',
      boxShadow: 'var(--shadow-md)',
      border: 'none',
    }}>
      {label && <div style={{ opacity: 0.6, marginBottom: 4, fontSize: 'var(--text-xs)' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontWeight: 700, color: p.fill || p.color || '#fff' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    dashboardAPI.stats()
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner spinner-lg"></div>
        <p>Loading dashboard…</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="alert alert-danger" style={{ maxWidth: 480 }}>
        <i className="bi bi-exclamation-circle-fill"></i>
        <span>Failed to load dashboard data. Please refresh the page.</span>
      </div>
    )
  }

  const sampleDist = (stats.sample_type_distribution || []).map(d => ({
    name: d.sample_type.charAt(0).toUpperCase() + d.sample_type.slice(1),
    value: d.count,
  }))

  const dailyData = (stats.daily_collections || []).map(d => ({
    date: d.date.slice(5),
    Collections: d.count,
  }))

  const hasAlerts = stats.stock_expiring_soon > 0 || stats.stock_expired > 0

  return (
    <div className="animate-fade-in">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon">
            <i className="bi bi-speedometer2"></i>
          </div>
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-subtitle">Laboratory overview &amp; key metrics</div>
          </div>
        </div>
        <div className="page-header-actions">
          <span className="datetime-mono" style={{ color: 'var(--text-muted)' }}>
            <i className="bi bi-clock" style={{ marginRight: 5 }}></i>
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid stagger">
        <StatCard
          icon="bi-people-fill" iconClass="blue"
          label="Total Participants" value={stats.total_participants}
          sub={`+${stats.participants_this_month} this month`} subPositive={stats.participants_this_month > 0}
        />
        <StatCard
          icon="bi-droplet-fill" iconClass="teal"
          label="Total Samples" value={stats.total_samples}
          sub={`+${stats.samples_this_month} this month`} subPositive={stats.samples_this_month > 0}
        />
        <StatCard
          icon="bi-gear-fill" iconClass="blue"
          label="Processings" value={stats.total_processings}
        />
        <StatCard
          icon="bi-box-seam-fill" iconClass="teal"
          label="Stored Samples" value={stats.total_storage}
        />
        <StatCard
          icon="bi-clipboard2-pulse-fill" iconClass="green"
          label="Stock Items" value={stats.total_stock_items}
        />
        <StatCard
          icon="bi-exclamation-triangle-fill" iconClass="orange"
          label="Expiring Soon" value={stats.stock_expiring_soon}
          sub="Within 30 days"
        />
        <StatCard
          icon="bi-x-circle-fill" iconClass="red"
          label="Expired Stock" value={stats.stock_expired}
          sub="Needs removal"
        />
      </div>

      {/* ── Charts ── */}
      <div className="chart-grid">

        {/* Bar chart — daily collections */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <i className="bi bi-bar-chart-fill"></i>
              Daily Collections
            </div>
            <span className="chart-meta">Last 14 days</span>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--brand-50)' }} />
                <Bar dataKey="Collections" fill="var(--primary)" radius={[5, 5, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <i className="bi bi-bar-chart"></i>
              <h4>No collection data</h4>
              <p>Collections in the last 14 days will appear here</p>
            </div>
          )}
        </div>

        {/* Pie chart — sample distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">
              <i className="bi bi-pie-chart-fill"></i>
              Sample Type Distribution
            </div>
            {sampleDist.length > 0 && (
              <span className="chart-meta">{sampleDist.length} type{sampleDist.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {sampleDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={sampleDist}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {sampleDist.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <i className="bi bi-pie-chart"></i>
              <h4>No sample data</h4>
              <p>Sample type breakdown will appear here</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Alert Banners ── */}
      {hasAlerts && (
        <div className="d-flex gap-12" style={{ flexWrap: 'wrap' }}>
          {stats.stock_expiring_soon > 0 && (
            <div className="alert alert-warning" style={{ flex: 1, minWidth: 240 }}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>
                <strong>{stats.stock_expiring_soon}</strong> stock item{stats.stock_expiring_soon !== 1 ? 's' : ''} expiring within 30 days.{' '}
                <a href="/inventory" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>
                  Visit Inventory →
                </a>
              </span>
            </div>
          )}
          {stats.stock_expired > 0 && (
            <div className="alert alert-danger" style={{ flex: 1, minWidth: 240 }}>
              <i className="bi bi-x-circle-fill"></i>
              <span>
                <strong>{stats.stock_expired}</strong> expired item{stats.stock_expired !== 1 ? 's' : ''} in inventory. Immediate action required.
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
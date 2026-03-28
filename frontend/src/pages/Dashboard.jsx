//dashboard.jsx
import { useEffect, useState } from 'react'
import { dashboardAPI } from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#1a6b8a','#26a69a','#42a5f5','#ab47bc','#ef5350']

const StatCard = ({ icon, iconClass, label, value, sub }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconClass}`}><i className={`bi ${icon}`}></i></div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.stats().then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>
  if (!stats) return <div className="alert alert-danger">Failed to load dashboard data.</div>

  const sampleDist = (stats.sample_type_distribution || []).map(d => ({
    name: d.sample_type.charAt(0).toUpperCase() + d.sample_type.slice(1),
    value: d.count
  }))

  const dailyData = (stats.daily_collections || []).map(d => ({
    date: d.date.slice(5),
    collections: d.count
  }))

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Laboratory overview & key metrics</div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="bi-people-fill" iconClass="blue" label="Total Participants" value={stats.total_participants} sub={`+${stats.participants_this_month} this month`} />
        <StatCard icon="bi-droplet-fill" iconClass="teal" label="Total Samples" value={stats.total_samples} sub={`+${stats.samples_this_month} this month`} />
        <StatCard icon="bi-gear-fill" iconClass="blue" label="Processings" value={stats.total_processings} />
        <StatCard icon="bi-box-seam-fill" iconClass="teal" label="Stored Samples" value={stats.total_storage} />
        <StatCard icon="bi-clipboard2-pulse-fill" iconClass="green" label="Stock Items" value={stats.total_stock_items} />
        <StatCard icon="bi-exclamation-triangle-fill" iconClass="orange" label="Expiring Soon" value={stats.stock_expiring_soon} sub="Within 30 days" />
        <StatCard icon="bi-x-circle-fill" iconClass="red" label="Expired Stock" value={stats.stock_expired} sub="Needs removal" />
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title"><i className="bi bi-bar-chart-fill"></i> Daily Collections (Last 14 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} margin={{top:4,right:8,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{fontSize:11}} />
              <YAxis tick={{fontSize:11}} allowDecimals={false} />
              <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
              <Bar dataKey="collections" fill="#1a6b8a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title"><i className="bi bi-pie-chart-fill"></i> Sample Type Distribution</div>
          {sampleDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sampleDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`} labelLine={false}>
                  {sampleDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
                <Legend wrapperStyle={{fontSize:12}} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{padding:'40px 0'}}>
              <i className="bi bi-pie-chart"></i>
              <p>No sample data yet</p>
            </div>
          )}
        </div>
      </div>

      {(stats.stock_expiring_soon > 0 || stats.stock_expired > 0) && (
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          {stats.stock_expiring_soon > 0 && (
            <div className="alert alert-warning" style={{flex:1,minWidth:240}}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              <strong>{stats.stock_expiring_soon}</strong> stock item(s) expiring within 30 days. Visit Inventory to review.
            </div>
          )}
          {stats.stock_expired > 0 && (
            <div className="alert alert-danger" style={{flex:1,minWidth:240}}>
              <i className="bi bi-x-circle-fill"></i>
              <strong>{stats.stock_expired}</strong> expired item(s) in inventory. Immediate action required.
            </div>
          )}
        </div>
      )}
    </>
  )
}
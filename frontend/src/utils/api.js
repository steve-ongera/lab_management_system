import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('lims_token')
  if (token) cfg.headers.Authorization = `Token ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lims_token')
      localStorage.removeItem('lims_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
}

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats/'),
}

const makeResource = (path) => ({
  list: (params) => api.get(`/${path}/`, { params }),
  get: (id) => api.get(`/${path}/${id}/`),
  create: (data) => api.post(`/${path}/`, data),
  update: (id, data) => api.put(`/${path}/${id}/`, data),
  patch: (id, data) => api.patch(`/${path}/${id}/`, data),
  remove: (id) => api.delete(`/${path}/${id}/`),
  export: () => api.get(`/${path}/export_excel/`, { responseType: 'blob' }),
})

export const participantsAPI = makeResource('participants')
export const phlebotomyAPI = makeResource('phlebotomy')
export const processingAPI = makeResource('processing')
export const storageAPI = makeResource('storage')
export const stockAPI = {
  ...makeResource('stock'),
  lowStock: () => api.get('/stock/low_stock/'),
  expiring: () => api.get('/stock/expiring/'),
}
export const auditAPI = {
  list: (params) => api.get('/audit-logs/', { params }),
}

export const downloadExcel = async (apiFn, filename) => {
  const res = await apiFn()
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  window.URL.revokeObjectURL(url)
}

export default api
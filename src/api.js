import axios from 'axios'

export const API_BASE = 'https://sensus-api-wd2o.onrender.com'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
})

export default api

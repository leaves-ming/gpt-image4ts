import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  timeout: 120000
})

request.interceptors.response.use(
  response => response,
  error => {
    console.error('Request error:', error)
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = 'API Key无效或已过期'
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 429:
          message = '请求过于频繁，请稍后重试'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `请求错误: ${error.response.status}`
      }
      if (error.response.data?.error?.message) {
        message += `: ${error.response.data.error.message}`
      }
    } else if (error.request) {
      message = '网络错误，请检查网络连接或代理配置'
    } else {
      message = error.message
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request

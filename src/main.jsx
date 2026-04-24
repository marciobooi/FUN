import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
   axios.interceptors.request.use((config) => {
      const requestUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url
      config.metadata = { startTime: performance.now() }
      const serializedParams = config.params instanceof URLSearchParams
         ? config.params.toString()
         : config.params

      console.groupCollapsed(`[API] ${String(config.method || 'get').toUpperCase()} ${requestUrl}`)
      if (serializedParams) {
         console.log('Params:', serializedParams)
      }
      if (config.data !== undefined && config.data !== null) {
         console.log('Data:', config.data)
      }
      console.groupEnd()

      return config
   })

   axios.interceptors.response.use(
      (response) => {
         const duration = response.config.metadata?.startTime
            ? Math.round(performance.now() - response.config.metadata.startTime)
            : null

         console.log(
            `[API] ${response.status} ${response.config.url}${duration !== null ? ` (${duration} ms)` : ''}`,
            response.data
         )

         return response
      },
      (error) => {
         const duration = error.config?.metadata?.startTime
            ? Math.round(performance.now() - error.config.metadata.startTime)
            : null

         console.error(
            `[API] ERROR ${error.config?.url || 'unknown request'}${duration !== null ? ` (${duration} ms)` : ''}`,
            error
         )

         return Promise.reject(error)
      }
   )
}

createRoot(document.getElementById('root')).render(
   <App />
)

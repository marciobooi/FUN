import { toast } from 'sonner'

const toastVariants = {
  success: (message, duration) => toast.success(message, { duration }),
  error: (message, duration) => toast.error(message, { duration }),
  alert: (message, duration) => toast.warning(message, { duration }),
  info: (message, duration) => toast(message, { duration }),
}

export function showToast(message, type = 'info', duration = 3000) {
  const handler = toastVariants[type] || toastVariants.info
  handler(message, duration)
}

export function Toast() {
  return null
}

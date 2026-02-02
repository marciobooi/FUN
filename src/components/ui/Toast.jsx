import toast from 'react-hot-toast'
import { useEffect } from 'react'

const toastStyles = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    textColor: 'text-gray-700',
    icon: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5"/>
      </svg>
    )
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    textColor: 'text-gray-700',
    icon: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
      </svg>
    )
  },
  alert: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-gray-700',
    icon: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4v.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
    )
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    textColor: 'text-gray-700',
    icon: (
      <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8h.01M12 16h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"/>
      </svg>
    )
  }
}

export function showToast(message, type = 'info', duration = 3000) {
  const style = toastStyles[type] || toastStyles.info

  toast.custom(
    (t) => (
      <div
        className={`flex items-center w-full max-w-sm p-4 ${style.bg} rounded-lg shadow-sm border ${style.border} transition-all duration-300 transform ${
          t.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        role="alert"
      >
        <div className={`inline-flex items-center justify-center shrink-0 w-7 h-7 ${style.iconBg} ${style.iconColor} rounded`}>
          {style.icon}
        </div>
        <div className={`ms-3 text-sm font-normal ${style.textColor}`}>
          {message}
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          type="button"
          className="ms-auto flex items-center justify-center text-gray-500 hover:text-gray-700 bg-transparent border border-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded text-sm h-7 w-7 focus:outline-none transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/>
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    ),
    {
      duration: duration,
      position: 'top-right'
    }
  )
}

export function Toast({ message, type = 'info' }) {
  useEffect(() => {
    if (message) {
      showToast(message, type)
    }
  }, [message, type])

  return null
}

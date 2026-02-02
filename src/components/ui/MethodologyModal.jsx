import { useState, useRef, useEffect } from 'react'

/**
 * MethodologyModal Component
 * 
 * Displays methodology and data sources information in a dropdown popup
 * positioned near the trigger info icon button.
 */

export function MethodologyModal({ title, children, triggerButton = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const modalRef = useRef(null)

  // Block scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Info Icon Button */}
      {triggerButton && (
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
          title="View methodology and data sources"
          aria-label="View methodology"
        >
          <span className="text-sm font-semibold">ℹ</span>
        </button>
      )}

      {/* Background Blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-xs z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Popup Modal */}
      {isOpen && (
        <div 
          ref={modalRef}
          className="fixed z-40 bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm mr-4"
          style={{
            top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: buttonRef.current ? Math.min(buttonRef.current.getBoundingClientRect().left - 180, window.innerWidth - 380) : 0,
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Popup Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Close"
            >
              <span className="text-sm font-bold">✕</span>
            </button>
          </div>

          {/* Popup Content */}
          <div className="p-4 text-xs text-gray-700 space-y-2">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

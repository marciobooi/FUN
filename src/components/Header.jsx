export function Header({ viewMode, setViewMode }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Energy Universe</h1>
            <p className="text-xs text-gray-500 font-medium">Eurostat nrg_bal_c Explorer</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'storyteller', label: 'Story Mode', icon: '📖' },
            { id: 'infographics', label: 'Immersive', icon: '🎨' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                viewMode === mode.id
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span>{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

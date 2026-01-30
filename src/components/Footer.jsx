export function Footer({ viewMode }) {
  return (
    viewMode !== 'infographics' && (
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">Energy Universe Dashboard</p>
          <p className="text-gray-400 text-xs">
            Data sourced from Eurostat API (nrg_bal_c). Not an official EU product.
          </p>
        </div>
      </footer>
    )
  )
}

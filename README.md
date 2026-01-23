# Energy Universe - Eurostat Energy Comparison Tool

A modern React + Vite + Tailwind CSS web application for exploring and comparing energy data across EU countries using the Eurostat nrg_bal_c dataset.

## Features

### 🌍 Core Functionality
- **Country Selector**: Select up to 3 EU countries for side-by-side comparison
- **Year Selection**: Choose analysis year (defaults to latest available: 2023)
- **Energy Categories**: Compare 7 key energy metrics:
  - ⚡ Energy Production
  - 📥 Energy Imports
  - 📤 Energy Exports
  - 🔄 Transformation & Conversion
  - 🏭 Final Consumption
  - 📊 Energy Dependence
  - 💡 Gross Available Energy

### 🎨 Design
- **Eurostat Branding**: Official color palette
  - Dark Blue: #003399
  - Light Blue: #0099FF
  - Orange: #FF6600
  - Green: #009966
- **Card-based Layout**: Clean, visual energy snapshots
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 7.3
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **JavaScript**: JavaScript + SWC for faster compilation

## Project Structure

```
src/
├── components/
│   ├── CountrySelector.jsx      # Multi-select country picker (max 3)
│   ├── YearSelector.jsx         # Year dropdown with available years
│   └── ComparisonGrid.jsx       # 7-category energy comparison grid
├── hooks/
│   └── useEurostatData.js       # Data fetching hook for Eurostat API
├── App.jsx                       # Main app component
├── App.css                       # App styles
├── index.css                     # Global Tailwind imports
└── main.jsx                      # React entry point
```

## Getting Started

### Prerequisites
- Node.js 18+ (with npm)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

## Current Data

The application currently uses **mock data** for demonstration purposes. Real data integration with the Eurostat nrg_bal_c API is planned for Phase 2.

### Available Years
- 2015 - 2023 (mock data range)

### Available Countries
All 27 EU member states:
Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

## Usage

1. **Select Countries**: Click "Choose countries..." to open the dropdown
   - Search by country name or code (e.g., "FR" for France)
   - Check up to 3 countries
   - Selected countries appear as blue tags at the top

2. **Choose Year**: Select desired year from the year dropdown

3. **View Comparison**: Instantly see energy metrics for all selected countries

## Future Enhancements

### Phase 2
- Real Eurostat API integration
- Sparkline charts in cards
- Per-capita metrics toggle
- Export/share functionality

### Phase 3
- Sankey diagrams for trade flows
- Multi-year trend analysis
- Energy identity cards
- Decomposition trees

## API Integration Notes

The Eurostat nrg_bal_c dataset endpoint:
```
https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_bal_c
```

Query parameters:
- `format`: JSON
- `time`: Year(s) to fetch
- `geo`: Country codes (e.g., FR,DE,IT)
- `unit`: KTOE (Kilotonnes of Oil Equivalent)

## Styling

All components use Tailwind CSS utility classes with custom Eurostat colors defined in `tailwind.config.js`:

```javascript
colors: {
  eurostat: {
    darkBlue: '#003399',
    lightBlue: '#0099FF',
    orange: '#FF6600',
    green: '#009966',
    lightGray: '#F2F2F2',
    darkGray: '#333333',
  }
}
```

Usage: `text-eurostat-darkBlue`, `bg-eurostat-orange`, etc.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Open source - Eurostat data


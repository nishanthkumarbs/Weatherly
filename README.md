# 🌤️ Weatherly — Advanced Hyperlocal Weather & Radar

An advanced, responsive weather forecasting web application built with **Next.js (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**. 

Powered by **OpenWeatherMap One Call API 3.0** as the primary forecasting engine and **Tomorrow.io** for minute-by-minute precipitation nowcasting, air quality indices, and airborne allergen/pollen tracking.

---

## ✨ Features

### 🌡️ Core Forecasting
- **Current Conditions**: Temperature, "Feels Like", Min/Max, Humidity, Wind speed & directional compass, Barometric pressure, UV index with safety rating, Visibility, and Dew point.
- **48-Hour Hourly Outlook**: Dual-mode visualization featuring an interactive **Recharts trend curve** (with precipitation probability fill) and a scrollable hourly card ribbon.
- **7-Day Extended Forecast**: Daily temperature range bars relative to weekly extremes, condition summaries, and expandable deep dives (morning, afternoon, evening, overnight temperatures, and humidity).
- **60-Minute Precipitation Nowcast (Tomorrow.io)**: Minute-by-minute precipitation intensity and probability bar chart with instant headline summaries (e.g., *"Rain stopping in ~18 minutes"*).
- **Historical Trends & "Compare to Normal"**: Compares current conditions against 30-year seasonal climate normals and reports all-time record highs/lows for the date.

### ⚡ Advanced Capabilities
- **Severe Weather Alerts**: Prominent, collapsible in-app banners for urgent meteorological warnings, watches, and advisories issued by national weather services.
- **Interactive Leaflet Weather Map**:
  - Multi-spectral tile layers: **Precipitation / Radar**, **Cloud Cover**, **Wind Speed**, and **Temperature**.
  - Dynamic tile proxy keeping your API keys hidden from client bundles.
  - Opacity control, real-time legend scales, and a full-screen modal mode.
- **Air Quality & Health (AQI)**: US EPA 0–500 index gauge with detailed pollutant breakdown (**PM2.5**, **PM10**, **O₃**, **NO₂**, **CO**, **SO₂**) and health guidance.
- **Pollen & Allergen Tracker**: Dedicated monitors for **Tree**, **Grass**, and **Weed** pollen risk levels from Tomorrow.io.
- **Astronomy & Sun/Moon Tracking**: Parabolic daylight trajectory arc showing daylight remaining and sunrise/sunset times, coupled with a photorealistic lunar phase generator with illumination percentage.
- **Hyperlocal Geolocation & Autocomplete**: HTML5 GPS detection alongside a debounced global city search.
- **Outdoor Activity Advisor**: Automated suitability scores and gear advisories (running, cycling, outdoor dining, stargazing, umbrella/sunscreen/coat reminders).
- **Customizable Dashboard**: Reorder widgets up/down or toggle them on/off, with automatic persistence in `localStorage`.
- **Unit Conversions**: Switch between **°C / °F**, **km/h / mph / m/s**, **mm / inches**, and **hPa / inHg** without needing to re-fetch data.
- **Dynamic Atmospheric Backgrounds**: Ambient background gradients and procedural falling rain particles matching current sky conditions and the day/night cycle.
- **Zero-Config Demo Mode**: Works straight out of the box with a high-fidelity simulated engine if API keys are not yet configured.

---

## 🏗️ Architecture & Modular Structure

```
Weatherly/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── weather/           # Centralized backend proxy for OWM + Tomorrow.io
│   │   │   ├── geocoding/         # Direct & reverse geocoding proxy
│   │   │   ├── historical/        # Historical climate baseline endpoint
│   │   │   └── map-tiles/         # Secure tile layer proxy (never leaks API key)
│   │   ├── globals.css            # Glassmorphic tokens, Leaflet styles & animations
│   │   ├── layout.tsx             # Root layout with SEO metadata & fonts
│   │   └── page.tsx               # Primary dashboard page
│   ├── components/
│   │   ├── activities/            # Outdoor activity advisor & gear warnings
│   │   ├── airquality/            # AQI and Pollen widgets
│   │   ├── alerts/                # Severe weather banners & modals
│   │   ├── astronomy/             # Sun trajectory & moon phase tracker
│   │   ├── background/            # Dynamic procedural atmospheric sky FX
│   │   ├── dashboard/             # WidgetContainer, Customizer & Dashboard grid
│   │   ├── forecast/              # CurrentHero, HourlyChart, DailyList, MinutelyNowcast, Historical
│   │   ├── map/                   # Leaflet WeatherMap, MapWidgetWrapper, MapModal
│   │   ├── navigation/            # Header, Search Autocomplete, Settings & Unit toggles
│   │   └── providers/             # React Context Providers wrapper
│   └── lib/
│       ├── api/
│       │   ├── cache.ts           # Server-side in-memory cache with TTL eviction
│       │   ├── mock-weather.ts    # High-fidelity realistic mock data generator
│       │   ├── openweather.ts     # OpenWeatherMap API abstraction client
│       │   ├── tomorrow.ts        # Tomorrow.io API abstraction client
│       │   └── weather-service.ts # Unified aggregator & fallback coordinator
│       ├── context/               # WeatherContext, UnitsContext, ThemeContext, WidgetOrderContext
│       ├── types/                 # TypeScript interfaces
│       └── utils/                 # Unit formatters & weather icon mapping
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **npm**, **pnpm**, or **yarn**

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/nishanthkumarbs/Weatherly.git
cd Weatherly
npm install
```

### 3. Environment Configuration
Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your API keys:

```ini
# OpenWeatherMap API Key (One Call 3.0, Geocoding, Map Tiles, History)
# Sign up at: https://openweathermap.org/api/one-call-3
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Tomorrow.io API Key (1-min Nowcasting, Pollen, Air Quality)
# Sign up at: https://www.tomorrow.io/weather-api/
TOMORROW_API_KEY=your_tomorrow_api_key_here

# Optional Defaults
NEXT_PUBLIC_DEFAULT_CITY=New York
NEXT_PUBLIC_DEFAULT_LAT=40.7128
NEXT_PUBLIC_DEFAULT_LON=-74.0060
```

> 💡 **Note on Demo Mode:**
> If you run the app without entering API keys or while your keys are pending activation, Weatherly automatically operates in **Demo Mode**. It generates realistic, physically accurate weather telemetry for any city or coordinate searched, so you can test all features immediately!

### 4. Running the Development Server
Start the local Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Performance Highlights

- **Server-Side API Proxying**: API keys are only accessed server-side within Next.js Route Handlers (`/api/*`). No third-party API credentials are ever exposed in client browser bundles or network traces.
- **Multi-Tier In-Memory Caching**: A server-side TTL cache dramatically reduces outbound API calls, preventing rate-limit issues while keeping data fresh:
  - Forecasts & Current: cached for 5 minutes
  - Minutely Nowcasting: cached for 2 minutes
  - Geocoding Searches: cached for 1 hour
  - Climate Normals: cached for 24 hours
- **Client-Side Leaflet Protection**: Leaflet is dynamically loaded (`ssr: false`) to avoid server-side window references, and map tiles are streamed via the backend tile proxy.

---

## 🛠️ Scripts

- `npm run dev` — Starts the development server with Hot Module Replacement.
- `npm run build` — Builds the application for production.
- `npm run start` — Runs the compiled production build.
- `npm run lint` — Runs ESLint checks.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

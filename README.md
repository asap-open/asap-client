<p align="center">
  <img src="public/logo-2.webp" alt="ASAP" width="96" />
</p>

<h1 align="center">ASAP — Client</h1>

<p align="center">
  React + TypeScript frontend for the <strong>Applied Strength & Advancement Platform</strong>.
  A self-hosted, data-driven workout tracker built for serious lifters.
</p>

<p align="center">
  <a href="https://asap-open.github.io/asap-docs/">Docs</a> ·
  <a href="https://asap-open.github.io/asap-docs/guide/features/sessions">Features</a> ·
  <a href="https://asap-open.github.io/asap-docs/installation">Deployment</a>
</p>

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth UI transitions
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   │   ├── exercises/  # Exercise management
│   │   ├── history/    # Workout history
│   │   └── progress/   # Progress tracking
│   ├── session/        # Workout session components
│   └── ui/             # Generic UI components
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication state
├── layouts/            # Layout components
│   └── DashboardLayout.tsx
├── pages/              # Page components
│   ├── dashboard/      # Dashboard pages
│   ├── GetStarted.tsx
│   ├── Login.tsx
│   └── Signup.tsx
├── utils/              # Utilities
│   └── api.tsx         # API client
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## Development

### Prerequisites

- Node.js 18+
- Yarn

### Setup

1. **Install dependencies**

```bash
yarn install
```

2. **Set up environment variables**

Create a `.env` file in the client directory:

```env
BACKEND_SERVER_URL=http://localhost:3000
DOMAIN_NAME=localhost
CAPACITOR_ANDROID_STUDIO_PATH=/home/<your-user>/.android-studio/bin/studio.sh
```

| Variable             | Required | Description                                                             |
| -------------------- | -------- | ----------------------------------------------------------------------- |
| `BACKEND_SERVER_URL` | ✅       | API server URL (used by Vite proxy and API utility fallback resolution) |
| `DOMAIN_NAME`        |          | Hostname for HMR/allowed hosts (can be comma-separated)                 |

3. **Start development server**

```bash
yarn dev
```

The app will be available at http://localhost:5173

### Available Scripts

- `yarn dev` - Start development server with HMR
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally
- `yarn lint` - Run ESLint

## Building for Production

### Docker Build

```bash
docker build -t asap-client .
docker run \
  -e BACKEND_SERVER_URL="http://localhost:3000" \
  -e DOMAIN_NAME="localhost" \
  -p 80:80 \
  asap-client
```

### Manual Build

```bash
yarn build
```

The built files will be in the `dist/` directory. Serve them with any static file server or reverse proxy like Nginx.

## Key Features

### Authentication

- JWT-based authentication
- Protected routes with `AuthContext`
- Automatic token refresh

### Dashboard

- **Exercises** - Browse and manage exercise library
- **History** - View past workout sessions
- **Progress** - Track strength gains and body metrics
- **Create Session** - Log new workouts

### Workout Sessions

- Add exercises from library
- Log sets with weight, reps, and RPE
- Real-time volume calculations
- Session duration tracking

### Progress Tracking

- V2 progress dashboard with modular panels
- Personal best timeline and strength trend (e1RM)
- Workload analytics (ACWR and ramp rate)
- Calendar drilldown with day detail and streaks
- Muscle-balance filters and exercise/session breakdown

## Styling

The app uses TailwindCSS with a custom design system that matches the documentation site:

- **Light primary**: `#13ecd6` (teal)
- **Dark primary**: `#9bdf57` (lime green)
- **Font**: Epilogue
- **Dark theme background**: `#171413` / `#1c1918`

## Contributing

See the [CONTRIBUTING](CONTRIBUTING) for contribution guidelines.

## License

This project is licensed under the **GPLv3 License** — see [LICENSE](LICENSE) for details.

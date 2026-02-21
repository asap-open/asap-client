# ASAP Client

Frontend application for the ASAP (Applied Strength & Advancement Platform) workout tracking system.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **TailwindCSS** - Utility-first styling
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
- npm or yarn

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

3. **Start development server**

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Building for Production

### Docker Build

```bash
docker build -t asap-client .
docker run -p 80:80 asap-client
```

### Manual Build

```bash
npm run build
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

- Personal best records
- Volume statistics over time
- Body weight tracking with charts
- Muscle group distribution
- Training consistency heatmap

## Styling

The app uses TailwindCSS with a custom design system:

- **Primary Color**: `#13ecd6` (Cyan/Teal)
- **Typography**: Epilogue font family
- **Dark Theme**: Default color scheme
- **Components**: Custom button, modal, and card styles

### Customization

Modify [tailwind.config.js](tailwind.config.js) to adjust the theme:

```js
theme: {
  extend: {
    colors: {
      primary: '#13ecd6',
      // Add more colors
    }
  }
}
```

## API Integration

The app communicates with the backend via the API client in `utils/api.tsx`.

Base URL is configured via `VITE_API_URL` environment variable.

### Example Usage

```typescript
import { api } from '@/utils/api';

// Fetch exercises
const exercises = await api.get('/api/exercises');

// Create session
const session = await api.post('/api/sessions', {
  name: 'Push Day',
  exercises: [...]
});
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:3000`)

## Deployment

### With Docker Compose

The app is automatically built and deployed with the full stack:

```bash
docker-compose up -d
```

### Standalone Deployment

1. Build the app: `npm run build`
2. Upload `dist/` contents to your hosting provider
3. Configure your web server to serve the SPA
4. Set `VITE_API_URL` to your backend URL

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
    }
}
```

## Contributing

See the main [repository README](../README.md) for contribution guidelines.

## License

MIT

# Frontend Architecture

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form (if needed)
- **Date Handling**: date-fns

## Project Structure

```
fe/
├── app/                      # Next.js App Router
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── shared/          # Shared components (Login, ImageWithFallback)
│   │   ├── admin/           # Admin-specific features
│   │   └── tenant/          # Tenant-specific features
│   ├── context/             # React Context providers
│   │   ├── AppContext.tsx   # Global app state
│   │   ├── types.ts         # TypeScript types
│   │   ├── useApp.ts        # Custom hook
│   │   └── index.ts         # Exports
│   ├── services/            # API services
│   │   └── api.ts          # API client
│   ├── styles/              # Global styles
│   ├── admin/               # Admin routes
│   ├── api/                 # API routes
│   ├── data/                # Static data
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── docs/                     # Documentation
│   ├── STATE_MANAGEMENT_GUIDE.md
│   └── STATE_MANAGEMENT_SUMMARY.md
├── public/                  # Static assets
└── [config files]           # Next.js, TypeScript, Tailwind configs
```

## Component Organization

### UI Components (`/app/components/ui/`)

Reusable, design-system components from shadcn/ui:

- `button.tsx`, `card.tsx`, `input.tsx`, etc.
- These are low-level, generic components
- Used throughout the application

### Shared Components (`/app/components/shared/`)

Components used across both admin and tenant features:

- `Login.tsx` - Authentication component
- `ImageWithFallback.tsx` - Image component with fallback

### Admin Components (`/app/components/admin/`)

Admin-specific features:

- `AdminDashboard.tsx` - Main dashboard
- `RoomManagement.tsx` - Room CRUD
- `TenantData.tsx` - Tenant management
- `FinancialReports.tsx` - Reports and analytics

### Tenant Components (`/app/components/tenant/`)

Tenant-specific features:

- `homepage.tsx` - Landing page
- `RoomDetail.tsx` - Room details view
- `booking-flow.tsx` - Booking process
- `booking-history.tsx` - User bookings
- `Gallery.tsx` - Image gallery

## State Management

Uses React Context API for global state. See [State Management Guide](./docs/STATE_MANAGEMENT_GUIDE.md) for details.

### Key Concepts

- `AppContext` provides global state
- `useApp()` hook to access state
- LocalStorage persistence
- Real-time sync between admin and tenant views

## Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes
- Follow mobile-first approach
- Use design tokens from `tailwind.config.ts`

### Color Scheme

- **Main Color**: Stone (stone-700, stone-800, stone-900)
- **Side Color**: Slate (for backgrounds and accents)
- **Accent**: Amber (for ratings, highlights)

### Dark Mode

- All components support dark mode via `dark:` Tailwind prefix
- Theme state is managed by `ThemeContext` and persisted in `localStorage`
- Global CSS transition (`globals.css`) ensures **all elements animate simultaneously** at `500ms ease-in-out`
- Avoid `transition-all` on UI components (use `transition-colors`) to prevent font rendering artifacts

### Animation Guidelines (Framer Motion)

- **Page transitions**: Use `AnimatePresence` + `motion.div` with a unique `key` prop
- **Entrance animations**: Use `initial/animate` with `opacity: 0→1` and `y: 20→0`
- **Staggered lists**: Use `variants` with `staggerChildren` on the parent container
- **Exit handled by**: `AnimatePresence mode="wait"` — waits for exit to complete before entering

```tsx
// Standard entrance animation pattern
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.4 }}
>
  ...content
</motion.div>
```

## Adding New Features

### 1. Create Component

```tsx
// Location: app/components/[admin|tenant]/MyFeature.tsx
"use client";

import { useApp } from "@/app/context";

export function MyFeature() {
  const { rooms } = useApp();

  return <div>Feature content</div>;
}
```

### 2. Update Routes (if needed)

```tsx
// Location: app/my-route/page.tsx
import { MyFeature } from "@/app/components/tenant/MyFeature";

export default function MyRoutePage() {
  return <MyFeature />;
}
```

### 3. Add State Logic (if needed)

Update `app/context/AppContext.tsx` with new state and functions.

## Development Workflow

### Local Development

```bash
npm run dev
```

Application runs on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Best Practices

### Component Guidelines

1. Use `'use client'` directive for client components
2. Keep components focused and single-responsibility
3. Extract reusable logic into custom hooks
4. Use TypeScript types for all props and state

### Performance

1. Use `React.memo()` for expensive components
2. Lazy load images with `ImageWithFallback`
3. Use dynamic imports for heavy components
4. Optimize re-renders with proper state management

### Code Quality

1. Follow ESLint rules
2. Use TypeScript strictly (no `any` types)
3. Write meaningful component and variable names
4. Comment complex logic

## API Integration

### Backend API

API client is in `app/services/api.ts`:

```tsx
import { api } from "@/app/services/api";

// Example usage
const rooms = await api.getRooms();
const reviews = await api.getReviews(roomId);
```

### Endpoints

- `GET /api/kamar` - Get all rooms
- `GET /api/kamar/:id` - Get room by ID
- `GET /api/reviews/:kamar_id` - Get reviews for room
- `POST /api/reviews` - Create review

## Common Issues

### Hydration Errors

- Ensure client-only code uses `useEffect`
- Check for SSR/CSR mismatches
- Use `suppressHydrationWarning` sparingly

### Import Errors

- Always use `@/` alias for imports
- Check import paths match new structure
- Ensure `jsconfig.json` or `tsconfig.json` is configured

### Dark Mode Issues

- Test all components in both modes
- Use CSS variables from `globals.css`
- Follow Tailwind's dark mode conventions

## Testing

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Room search and filters work
- [ ] Booking flow completes
- [ ] Admin dashboard displays data
- [ ] Dark mode toggle works (all sections transition simultaneously)
- [ ] No typography glitch on buttons upon theme change
- [ ] Admin page transitions animate correctly
- [ ] Staggered animations appear for admin content
- [ ] Mobile responsive on all pages
- [ ] Images load with fallbacks

## Documentation

- [State Management Guide](./docs/STATE_MANAGEMENT_GUIDE.md) - How to use global state
- [State Management Summary](./docs/STATE_MANAGEMENT_SUMMARY.md) - Quick reference

## Contributing

When adding new components:

1. Follow existing folder structure
2. Use TypeScript
3. Follow naming conventions
4. Update this documentation if adding major features

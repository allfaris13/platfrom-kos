# Dark/Light Mode Theme Implementation

## Overview
Implementasi lengkap sistem dark/light mode (tema gelap/terang) untuk aplikasi kos-kosan menggunakan React Context API, TypeScript, dan Tailwind CSS.

## Fitur yang Diimplementasikan

### 1. Theme Context Management (`app/context/ThemeContext.tsx`)
- **Type Definition**: `Theme = 'light' | 'dark'`
- **State Management**: 
  - `theme`: Current theme state
  - `mounted`: Track client-side hydration to prevent SSR mismatches
- **Features**:
  - Automatic detection of system preference (`prefers-color-scheme`)
  - localStorage persistence (`app_theme` key)
  - Automatic DOM manipulation (adds/removes `dark` class to `<html>`)
  - Proper hydration handling for SSR

### 2. Theme Hook (`app/context/useTheme.ts`)
Custom hook untuk akses theme context dengan:
- Error handling untuk missing provider
- Fallback default values untuk SSR/build time
- Type-safe context access

### 3. Theme Toggle Button (`app/components/ui/ThemeToggleButton.tsx`)
Icon-only button component dengan:
- **Display**: Moon icon (light mode) → Sun icon (dark mode)
- **Features**:
  - Mounted state check untuk SSR safety
  - Smooth transitions
  - Hover effects (light: `hover:bg-slate-200`, dark: `hover:bg-slate-800`)
  - Accessibility title attribute
  - Disabled state during SSR

### 4. Layout Integration (`app/layout.tsx`)
- ThemeProvider wraps entire application
- Root layout applies dark mode classes:
  ```tsx
  <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
  ```

### 5. Component Dark Mode Support

#### User Platform (`app/components/tenant/user-platform.tsx`)
- **Header**: 
  - Background: `bg-white/90 dark:bg-slate-950/90`
  - Border: `border-slate-200/60 dark:border-slate-800/60`
  - Logo text: `dark:text-white`
- **Navigation**:
  - Buttons: `dark:text-slate-300 dark:hover:bg-slate-800`
  - Contact button: `dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900`
- **Mobile Menu**:
  - Background: `dark:bg-slate-900`
  - Border: `dark:border-slate-700`
- **Main Container**:
  - Gradient: `dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`
- **Integration**: ThemeToggleButton di desktop dan mobile navigation

#### Admin Sidebar (`app/components/admin/AdminSidebar.tsx`)
- Already dark-themed (slate-950 background)
- ThemeToggleButton ditambahkan di footer section
- Mobile menu button styling: `dark:hover:bg-slate-800`

## Files Created/Modified

### Created Files
1. `app/context/ThemeContext.tsx` - Theme context provider
2. `app/context/useTheme.ts` - Custom hook untuk theme access
3. `app/components/ui/ThemeToggleButton.tsx` - Icon-only toggle button
4. `THEME_IMPLEMENTATION.md` - Dokumentasi ini

### Modified Files
1. `app/context/types.ts` - Added `Theme` type dan `ThemeContextType` interface
2. `app/context/index.ts` - Exported theme-related exports
3. `app/layout.tsx` - Added ThemeProvider wrapper dan dark mode classes
4. `app/components/tenant/user-platform.tsx` - Added dark mode classes dan ThemeToggleButton
5. `app/components/admin/AdminSidebar.tsx` - Added 'use client' directive dan ThemeToggleButton

## Tailwind CSS Dark Mode Configuration
Menggunakan Tailwind's built-in dark mode dengan `dark:` prefix:
```tsx
// Example usage
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
```

## localStorage Keys
- **`app_theme`**: Stores user's theme preference ('light' atau 'dark')

## System Integration

### Initialization Flow
1. **Build Time**: ThemeProvider provides fallback (light mode)
2. **First Load**: useEffect checks localStorage
3. **If No Storage**: Detects system preference with `window.matchMedia('prefers-color-scheme: dark')`
4. **Applied**: Adds/removes `dark` class to `<html>` element
5. **Persisted**: Updates localStorage on toggle

### Browser Support
- Works dengan semua modern browsers yang support:
  - CSS `prefers-color-scheme` media query
  - `window.matchMedia`
  - localStorage API

## Usage Examples

### Using Theme Toggle Button
```tsx
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';

export function MyComponent() {
  return (
    <div>
      <ThemeToggleButton />
    </div>
  );
}
```

### Accessing Theme in Component
```tsx
'use client';

import { useTheme } from '@/app/context';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Adding Dark Mode to Custom Components
```tsx
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
  <h1 className="text-slate-900 dark:text-white">Title</h1>
  <p className="text-slate-600 dark:text-slate-400">Description</p>
</div>
```

## Color Palette Reference

### Light Mode
- Background: `bg-white`
- Text Primary: `text-slate-900`
- Text Secondary: `text-slate-600`
- Border: `border-slate-200`
- Hover: `hover:bg-slate-100`

### Dark Mode
- Background: `dark:bg-slate-950`
- Text Primary: `dark:text-white`
- Text Secondary: `dark:text-slate-400`
- Border: `dark:border-slate-800`
- Hover: `dark:hover:bg-slate-800`

## Testing Checklist
- [x] Build kompiles successfully
- [x] Theme toggle button renders
- [x] Light/dark icons switch correctly
- [x] localStorage persists theme choice
- [x] System preference detection works
- [x] Dark mode classes apply correctly
- [x] SSR doesn't cause hydration mismatch
- [x] Mobile menu dark mode styling
- [x] Admin sidebar integration
- [x] User platform navigation dark mode

## Future Enhancements
1. Add more component dark mode styling
2. Add theme preference animation transitions
3. Add auto-switch at specific times
4. Add theme preview/palette selector
5. Add smooth color transitions between themes

## Troubleshooting

### "useTheme must be used within a ThemeProvider"
- Ensure component is wrapped with ThemeProvider in layout.tsx
- Add fallback in useTheme hook (already implemented)

### Dark mode not applying
- Check if dark mode class is on `<html>` element
- Verify Tailwind config has `darkMode: 'class'`
- Clear browser cache and localStorage

### Hydration mismatch errors
- ThemeToggleButton uses mounted state to prevent SSR issues
- useTheme provides fallback for build time

## Build Status
✅ Successfully compiles with `npm run build`
- All routes prerendered (/, /admin, /_not-found)
- No compile errors
- No TypeScript errors

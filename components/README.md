# SoloSuccess AI - Component Library

This directory contains the core UI components and design system for SoloSuccess AI.

## Component Structure

```
components/
├── ui/                    # Base UI components
│   ├── GlassmorphicCard.tsx
│   ├── GlassmorphicPanel.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── AnimatedGradientBackground.tsx
│   ├── GradientText.tsx
│   ├── LoadingSpinner.tsx
│   ├── Toast.tsx
│   ├── ProgressBar.tsx
│   ├── Skeleton.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
└── layouts/               # Layout components
    ├── DashboardLayout.tsx
    ├── DashboardSidebar.tsx
    ├── DashboardHeader.tsx
    ├── MobileNav.tsx
    ├── Breadcrumbs.tsx
    └── index.ts
```

## Design System Features

### 1. Glassmorphism Components

Modern frosted glass effect components with blur and transparency:

- **GlassmorphicCard**: Card component with elevation variants (low, medium, high)
- **GlassmorphicPanel**: Panel component with customizable blur levels

### 2. Dynamic Gradients

Animated gradient backgrounds and text:

- **AnimatedGradientBackground**: Full-screen animated gradient with theme support
- **GradientText**: Text with animated gradient effects

### 3. Interactive Components

- **Button**: Multiple variants (primary, secondary, outline, ghost, gradient)
- **Input**: Glassmorphic input fields with icons, labels, and error states

### 4. Loading & Feedback

- **LoadingSpinner**: Glassmorphic loading spinner with size variants
- **LoadingOverlay**: Full-screen loading overlay
- **Toast**: Toast notification system with context provider
- **ProgressBar**: Linear and circular progress indicators
- **Skeleton**: Skeleton loaders for content placeholders

### 5. Theme System

- **ThemeProvider**: Context provider for theme management
- **ThemeToggle**: Toggle component for light/dark/system themes
- **Color Themes**: Blue, purple, teal, sunset, and ocean color palettes

### 6. Layout Components

- **DashboardLayout**: Main dashboard layout with sidebar
- **DashboardSidebar**: Collapsible sidebar with navigation
- **DashboardHeader**: Header with search, notifications, and user menu
- **MobileNav**: Mobile navigation drawer
- **Breadcrumbs**: Dynamic breadcrumb navigation

## Usage Examples

### Basic Components

```tsx
import { GlassmorphicCard, Button, Input } from '@/components/ui';

function MyComponent() {
  return (
    <GlassmorphicCard elevation="medium" gradient>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Login</h2>
        <Input label="Email" type="email" placeholder="Enter email" />
        <Button variant="gradient" className="mt-4">
          Sign In
        </Button>
      </div>
    </GlassmorphicCard>
  );
}
```

### Theme Provider

```tsx
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { ThemeToggle } from '@/components/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4">
        <ThemeToggle variant="dropdown" />
        {/* Your app content */}
      </div>
    </ThemeProvider>
  );
}
```

### Toast Notifications

```tsx
import { ToastProvider, useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
    });
  };

  return <button onClick={handleClick}>Show Toast</button>;
}

function App() {
  return (
    <ToastProvider>
      <MyComponent />
    </ToastProvider>
  );
}
```

### Dashboard Layout

```tsx
import { DashboardLayout } from '@/components/layouts';

function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      {/* Your dashboard content */}
    </DashboardLayout>
  );
}
```

## Demo

Visit `/demo` to see all components in action with interactive examples.

## Design Principles

1. **Glassmorphism**: Frosted glass effects with transparency and depth
2. **Dynamic Gradients**: Smooth, animated color transitions
3. **Responsive**: Mobile-first design with touch-friendly interactions
4. **Accessible**: WCAG 2.1 AA compliant with keyboard navigation
5. **Performance**: Optimized animations with Framer Motion
6. **Theme Support**: Light, dark, and system theme modes

## Color Themes

- **Blue**: Professional and trustworthy (default)
- **Purple**: Creative and innovative
- **Teal**: Fresh and modern
- **Sunset**: Warm and energetic
- **Ocean**: Calm and serene

## Animation Guidelines

- Hover effects: 200ms duration
- Page transitions: 300ms duration
- Loading states: Smooth infinite loops
- Micro-interactions: 150ms for immediate feedback

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

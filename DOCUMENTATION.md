# Quiz Money Admin PWA Documentation

## Overview

Quiz Money Admin is a Progressive Web Application (PWA) built with Next.js 15 and React 19, designed for managing the Quiz Money gaming platform. It provides administrative tools for managing games, players, sales, and other platform operations.

## Tech Stack

### Core Framework

- **Next.js 15.3.2** - React-based web framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript

### Styling & UI

- **Tailwind CSS 4** - utility-first CSS framework
- **Radix UI** - Accessible UI components (@radix-ui/themes, @radix-ui/react-\*)
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **Swiper** - Touch slider component

### State Management

- **Redux Toolkit (@reduxjs/toolkit)** - State management
- **React Redux** - React bindings for Redux
- **Redux Persist** - Persist Redux state to storage
- **TanStack React Query** - Server state management

### Backend & API

- **Parse SDK** - Backend-as-a-Service integration
- **Axios** - HTTP client
- **Firebase 11.6.1** - Authentication and push notifications

### PWA Features

- **next-pwa 5.6.0** - Service worker and PWA capabilities
- **LocalForage** - Client-side storage

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Conventional commit messages

## Project Structure

```
src/
├── app/                          # Next.js 15 App Router structure
│   ├── (screens)/               # Route groups
│   │   ├── (preAuthScreen)/     # Authentication screens
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-forgot-password/
│   │   └── (protected)/         # Protected routes
│   │       ├── (tabs)/          # Main application tabs
│   │       │   ├── dashboard/
│   │       │   ├── game-zone/
│   │       │   ├── players/
│   │       │   ├── leaderboard/
│   │       │   ├── products/
│   │       │   ├── sales/
│   │       │   ├── wallet/
│   │       │   ├── settings/
│   │       │   └── ...
│   │       └── notification/
│   ├── api/                     # API integration layer
│   │   ├── parse/              # Parse server client
│   │   ├── queries/            # TanStack Query definitions
│   │   └── *.ts               # API service files
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Shared components
│   │   ├── modal/             # Modal components
│   │   ├── ui/                # Radix UI styled components
│   │   └── [feature]/         # Feature-specific components
│   ├── store/                 # Redux store configuration
│   │   ├── store.ts          # Main store setup
│   │   └── *Slice.ts         # Feature slices
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── firebase/             # Firebase configuration
│   ├── security/             # Authentication & route protection
│   └── pwa/                  # PWA-specific components
└── lib/                      # Shared utilities
```

## Key Features

### Authentication & Authorization

- JWT-based authentication via Parse Server
- Protected route system with role-based access
- Encrypted user data persistence using Redux Persist

### Dashboard & Analytics

- Real-time dashboard with key metrics
- Sales tracking and revenue analytics
- Player statistics and engagement metrics
- Game performance monitoring

### Game Management

- CRUD operations for quiz games
- Game categorization and difficulty levels
- Question management system
- Game history tracking

### Player Management

- User profile management
- Player statistics and game history
- Account status management (active/suspended)
- Referral system tracking

### Financial Operations

- Wallet management
- Withdrawal request processing
- QM Coins (virtual currency) management
- Transaction history and reporting

### Notification System

- Push notifications via Firebase Cloud Messaging (FCM)
- In-app notification center
- iOS PWA notification support

### Additional Features

- Leaderboard management
- Product catalog management
- Sales reporting
- Memory game and number guessing game modules
- Perfect score tracking

## State Management Architecture

### Redux Store Structure

```typescript
{
  auth: {
    userEncryptedData: EncryptedUserData,
    isAuthenticated: boolean,
    isRehydrated: boolean
  },
  notifications: NotificationState,
  salseData: SalesState,
  players: PlayersState,
  dashboard: DashboardState,
  leaderboard: LeaderboardState,
  game: GameState,
  withdraw: WithdrawalState
}
```

### Data Persistence

- **Redux Persist** with LocalForage for offline capability
- Selective persistence using transform filters
- Encrypted user data storage for security

## API Integration

### Parse Server

- Primary backend service for data operations
- Real-time queries and subscriptions
- File storage and user management

### Firebase Services

- **Authentication**: Secure user authentication
- **Cloud Messaging**: Push notification delivery
- **Analytics**: User behavior tracking

## PWA Features

### Service Worker

- Caching strategies for offline functionality
- Background sync for data synchronization
- Push notification handling

### App Manifest

- Install prompts for mobile devices
- Native app-like experience
- Custom icons and splash screens

### Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for various screen sizes

## Security Features

### Headers Configuration

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict referrer policy

### Authentication Security

- Encrypted user data storage
- Secure token management
- Protected route middleware

## Development Workflow

### Scripts

- `npm run dev` - Development server with Turbopack (port 3001)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint checking
- `npm run format` - Prettier formatting
- `npm run ts-error` - TypeScript error checking

### Code Quality

- Pre-commit hooks via Husky
- Conventional commit messages via Commitlint
- Automated formatting with Pretty Quick
- TypeScript strict mode enabled

## Deployment

### Production Configuration

- Console logging disabled in production
- Image optimization for remote domains
- PWA service worker registration
- Security headers enforcement

### Environment Variables

- Parse server configuration
- Firebase service keys
- API endpoints and credentials

## Browser Support & Compatibility

- Modern browsers with ES2020+ support
- PWA features on supported platforms
- iOS Safari PWA optimization
- Android Chrome install prompts

This documentation provides a comprehensive overview of the Quiz Money Admin PWA codebase, its architecture, and key features for developers and maintainers.

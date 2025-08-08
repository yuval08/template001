# Intranet Frontend

A modern React 19 application built with Vite, TypeScript, and a comprehensive set of features for enterprise intranet portals.

## Features

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **shadcn/ui** component library
- **React Router v6** for routing
- **Authentication** with oidc-client-ts and SSO integration
- **State Management** with Zustand
- **API Integration** with TanStack Query (React Query)
- **Real-time Features** with SignalR
- **Forms** with React Hook Form and Zod validation
- **Tables** with TanStack Table (advanced features)
- **Charts** with Recharts
- **PDF Preview** with react-pdf
- **Dark/Light Theme** support
- **Responsive Design** with mobile-first approach

## Pages

1. **Dashboard** - Overview with charts and statistics
2. **Forms** - Comprehensive form showcase with all input types
3. **Tables** - Advanced table with sorting, filtering, pagination
4. **Users** - User management with role-based access control
5. **Reports** - PDF preview and download functionality

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update environment variables with your configuration
# Edit .env file with your actual values
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_OIDC_AUTHORITY=https://your-identity-provider
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
VITE_OIDC_SCOPE=openid profile email
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/notifications
```

### Development

```bash
# Start development server
npm run dev

# The application will be available at http://localhost:3000
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Sidebar, Topbar, Layout)
│   ├── ui/             # shadcn/ui base components
│   ├── forms/          # Form-specific components
│   └── tables/         # Table-specific components
├── pages/              # Page components
├── stores/             # Zustand stores
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Key Technologies

- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema declaration and validation
- **Recharts**: Composable charting library
- **SignalR**: Real-time web functionality

### Authentication Flow

1. User accesses protected route
2. Redirected to SSO login page
3. After successful authentication, redirected back with tokens
4. Token stored securely and used for API calls
5. Real-time SignalR connection established with authentication

### State Management

- **Auth State**: User information, authentication status
- **Theme State**: Dark/light mode preferences
- **Toast State**: Global toast notifications
- **Server State**: API data managed by TanStack Query

### API Integration

- RESTful API calls with proper error handling
- Automatic token refresh
- Request/response interceptors
- Optimistic updates
- Background refetching

### Real-time Features

- Job completion notifications
- Project update broadcasts
- User activity notifications
- System announcements

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Add proper TypeScript types

### Component Development

- Use functional components with hooks
- Implement proper prop types
- Add proper accessibility attributes
- Follow mobile-first responsive design
- Use shadcn/ui components as base

### State Management

- Use Zustand for global state
- Use TanStack Query for server state
- Avoid prop drilling
- Keep state as local as possible

## Security Features

- Token-based authentication
- Role-based access control
- Secure token storage
- CSRF protection
- Content Security Policy ready

## Performance Optimizations

- Code splitting with lazy loading
- Optimized bundle size
- Efficient re-renders with proper memoization
- Background data fetching
- Optimistic updates

## Accessibility

- WCAG 2.1 AA compliance
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
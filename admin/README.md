# CampusSync Admin Dashboard

A modern, feature-rich admin dashboard for managing the CampusSync platform.

## Features

- **Dashboard**: Overview of key metrics and statistics
- **User Management**: Manage platform users and their roles
- **Books Management**: Verify and manage book listings
- **Lost & Found**: Handle lost and found items
- **Analytics**: Detailed platform statistics and insights
- **Settings**: Configure platform settings and preferences
- **Modern UI**: Built with Tailwind CSS and Lucide icons
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Recharts for visualizations
- Lucide React for icons
- React Router for navigation

## Getting Started

### Prerequisites
- Node.js 16+ installed

### Installation

1. Navigate to the admin folder:
```bash
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

## Project Structure

```
src/
├── components/        # Reusable components (Sidebar, Navbar, Cards, Tables, etc.)
├── contexts/          # React contexts for state management
├── pages/             # Page components (Dashboard, Users, Books, etc.)
├── services/          # API services (to be implemented)
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Available Pages

- **Dashboard** (`/`): Main overview with statistics and charts
- **Users** (`/users`): User management interface
- **Books** (`/books`): Book listing management and verification
- **Items** (`/items`): Lost and found item management
- **Analytics** (`/analytics`): Platform analytics and insights
- **Settings** (`/settings`): Admin settings and configuration

## Building for Production

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Future Enhancements

- Authentication and login page
- API integration for real data
- Advanced filtering and search
- Export functionality
- User activity logs
- System notifications
- Dark mode support

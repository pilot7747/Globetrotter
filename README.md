# Globetrotter

A travel tracking application that helps users log and visualize their journeys around the world.

## Features

- Interactive world map showing visited locations
- Log visited countries, regions, and cities with optional notes and photos
- User authentication and data persistence
- Shareable travel reports
- Cross-platform mobile app (iOS & Android)

## Project Structure

This is a monorepo containing both frontend and backend code:

- `frontend/` - Expo React Native application
- `backend/` - FastAPI Python backend

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Follow the setup instructions in `backend/README.md`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Development

- Backend API runs on http://localhost:8000
- Frontend development uses Expo Go app for testing
- API documentation available at http://localhost:8000/docs

## Tech Stack

- Frontend: React Native + Expo
- Backend: FastAPI + SQLAlchemy
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Maps: React Native Maps
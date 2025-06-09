# Globetrotter Backend

FastAPI backend for the Globetrotter travel tracking application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=your_supabase_postgres_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

## Development

Run the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation will be available at http://localhost:8000/docs

## Project Structure

- `app/` - Main application package
  - `main.py` - FastAPI application entry point
  - `routers/` - API route modules
  - `models.py` - Database models
  - `schemas.py` - Pydantic schemas
  - `deps.py` - Dependencies and utilities
  - `services/` - Business logic
- `tests/` - Test cases 
# 🚆 AI Railway Block Planner & Optimization System

An intelligent, AI-powered system designed to optimize railway block maintenance and prevent train delays. It integrates heterogeneous data from multiple railway legacy systems (TMS, SMMS, TDMS, COA, BDMS), standardizes them into a unified domain model, calculates explainable priority scores and cascade failure risks, generates optimal shadow block schedules using CP-SAT constraint solvers, and persists all data into **PostgreSQL / SQLite** with **Beekeeper Studio** support.

---

## 🌟 Key Features

- **Integrated Data Ingestion**: Ingests defect and timetable data across 5 core railway management systems:
  - **TMS** (Track Management System — Engineering)
  - **SMMS** (Signal Maintenance Management System — S&T)
  - **TDMS** (Traction Distribution Management System — Electrical/OHE)
  - **COA** (Control Office Application — Express & Freight Train Timetables)
  - **BDMS** (Block Management System — Possession Requests)
- **Database Persistence & ORM**: Full persistence using SQLAlchemy ORM for PostgreSQL and SQLite.
- **Beekeeper Studio Ready**: Visual GUI inspection for all 4 primary database tables (`maintenance_tasks`, `train_schedules`, `block_requests`, `block_recommendations`).
- **AI Priority Engine**: Scores and ranks maintenance tasks (0–100) based on defect severity, due-date proximity, and department criticality with explainable mathematical factor breakdowns.
- **Domino AI Engine**: Evaluates cascade propagation risk, secondary asset dependencies, and delay chains across intersecting train timetables.
- **Block Optimizer (CP-SAT Solver)**: Multi-department co-location algorithm grouping spatial tasks ($\le 3\text{ km}$) and finding conflict-free maintenance windows.
- **Executive React Dashboard**: Formal high-contrast black-and-white theme featuring live Digital Twin corridor simulations, Gantt chart "Block Tetris", and ROI analytics.

---

## 🏗️ System Architecture

```mermaid
graph TD
    TMS[TMS Adapter] --> Normalizer[Data Normalizer Service]
    SMMS[SMMS Adapter] --> Normalizer
    TDMS[TDMS Adapter] --> Normalizer
    COA[COA Timetable] --> Normalizer
    BDMS[BDMS Requests] --> Normalizer

    Normalizer --> DB[(PostgreSQL / SQLite DB)]
    DB --> Priority[AI Priority Engine]
    DB --> Domino[Domino Risk AI Engine]
    DB --> Optimizer[CP-SAT Block Optimizer]

    Priority --> API[FastAPI REST Router /api/v1]
    Domino --> API
    Optimizer --> API

    API --> React[React Executive Dashboard]
    DB <--> Beekeeper[Beekeeper Studio GUI]
```

---

## 💾 Database Schemas & Tables

| Table Name | Description | Key Attributes |
| :--- | :--- | :--- |
| `maintenance_tasks` | Maintenance defects across track, signal, and traction assets | `task_id`, `asset_id`, `department`, `defect_type`, `severity`, `due_date`, `location_start_km` |
| `train_schedules` | Express and freight train timetables & movement priorities | `train_id`, `train_number`, `train_name`, `train_type`, `scheduled_arrival`, `scheduled_departure` |
| `block_requests` | Line possession block requests submitted by departments | `request_id`, `department`, `requested_duration_minutes`, `requested_date`, `priority` |
| `block_recommendations` | Solved optimal maintenance windows co-locating multi-dept tasks | `block_id`, `start_km`, `end_km`, `start_time`, `end_time`, `allocated_tasks`, `participating_departments` |

---

## 🚀 Getting Started

### Prerequisites

* **Python**: 3.10+
* **Node.js**: 18+ & npm
* **PostgreSQL** *(optional, falls back automatically to local SQLite)*
* **Beekeeper Studio** *(GUI database management)*

---

### 1. Backend Setup (FastAPI & AI Engines)

1. Navigate to the project root directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Initialize and seed the database:
   ```bash
   python -m backend.app.seed
   ```
5. Run the backend API server:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   Interactive API docs are available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup (React Executive Dashboard)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard in your browser at `http://localhost:5173`.

---

## 🐝 Inspecting Database with Beekeeper Studio

### Option A: SQLite (Local Project File)
1. Open **Beekeeper Studio** $\rightarrow$ Click **+ New Connection**.
2. Select **SQLite** as Connection Type.
3. For **Database File**, select: `D:\SIH\railway_planner.db`.
4. Click **Connect** to inspect all 4 tables.

### Option B: PostgreSQL
1. Create database in PostgreSQL: `CREATE DATABASE railway_planner;`.
2. Configure `.env` in project root:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/railway_planner
   ```
3. Run seed script: `python -m backend.app.seed`.
4. In Beekeeper Studio, select **Postgres** connection type, set **Host**: `localhost`, **Database**: `railway_planner`, **User**: `postgres` and click **Connect**.

---

## 🧪 Testing

Run the end-to-end integration pipeline test suite:
```bash
python tests/unit/test_pipeline.py
```

---

## 🛠️ Technology Stack

* **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy ORM, psycopg2-binary, python-dotenv
* **AI & Optimization**: Google OR-Tools (CP-SAT Solver), Custom Priority Scorer, Domino Cascade Risk Evaluator
* **Database**: PostgreSQL / SQLite (with Beekeeper Studio inspection)
* **Frontend**: React 18, Vite, TypeScript, Lucide-React
* **Styling**: Pure CSS (Formal high-contrast executive theme)
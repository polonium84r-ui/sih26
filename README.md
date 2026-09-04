# 🚆 AI Railway Block Planner & Optimization System

This project is an AI-powered system designed to optimize railway block maintenance and prevent train delays. It integrates data from various existing railway systems to intelligently schedule and group maintenance tasks across different departments (Engineering, Signal & Telecom, Traction), minimizing disruption to train schedules.

## 🌟 Key Features

*   **Integrated Data Ingestion**: Pulls defect and maintenance data from multiple mock source systems:
    *   **TMS** (Track Management System)
    *   **SMMS** (Signal Maintenance Management System)
    *   **TDMS** (Traction Distribution Management System)
    *   **COA** (Control Office Application - Timetable & Movements)
    *   **BDMS** (Block Management System)
*   **Data Normalization**: Standardizes diverse incoming data into a unified domain model.
*   **AI Priority Engine**: Scores and ranks maintenance tasks based on severity, due dates, and department criticality, providing clear explanations for rankings.
*   **Domino AI Engine**: Evaluates the cascade risk of delaying maintenance tasks, predicting downstream impacts on train schedules and other assets.
*   **Block Optimizer (CP-SAT Solver)**: Uses Constraint Programming (Google OR-Tools) to find optimal maintenance windows (blocks) that accommodate multiple department tasks while avoiding conflicts with scheduled train movements.
*   **Professional Dashboard**: A React-based, formal black-and-white themed UI to visualize priorities, cascade risks, schedule Gantt charts, and system analytics.

## 🏗️ System Architecture

The system acts as an intelligence layer above existing railway infrastructure.

```text
                         ┌──────────────────────────────┐
                         │ EXISTING RAILWAY SYSTEMS     │
                         └──────────────────────────────┘
                                      │
              ┌───────────┬───────────┼───────────┬───────────┐
              ▼           ▼           ▼           ▼           ▼
            TMS         SMMS        TDMS         COA        BDMS
        Track Data    Signal Data  OHE Data   Train Data  Block Data
              │           │           │           │           │
              └───────────┴───────────┼───────────┴───────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │    YOUR PROPOSED SYSTEM   │
                        │                           │
                        │  1. Normalizer Service    │
                        │  2. AI Priority Engine    │
                        │  3. Domino AI (Risk)      │
                        │  4. Block Optimizer       │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                                API / FRONTEND
```

## 🚀 Getting Started

### Prerequisites

*   Python 3.10+
*   Node.js 18+ & npm
*   Git

### Backend Setup (FastAPI & AI Engines)

1.  Navigate to the project root directory.
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the backend server:
    ```bash
    uvicorn backend.app.main:app --reload --port 8000
    ```
    The API documentation will be available at `http://localhost:8000/docs`.

### Frontend Setup (React Dashboard)

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Access the dashboard in your browser at `http://localhost:5173`.

## 🛠️ Technology Stack

*   **Backend**: Python, FastAPI, Pydantic
*   **AI/Optimization**: Google OR-Tools (CP-SAT)
*   **Frontend**: React, Vite, TypeScript, Lucide-React
*   **Styling**: Pure CSS (Formal monochrome theme)

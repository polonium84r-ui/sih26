# 🚆 Backend: AI & Optimization Engine

This directory contains the Python-based backend for the AI Railway Block Planner & Optimization System. It is built using FastAPI and integrates several advanced AI and optimization techniques to manage railway maintenance blocks efficiently.

## 🏗️ Architecture Modules

The backend is composed of four main intelligence modules:

### 1. Data Ingestion & Normalizer (`integrations/`)
- **Purpose**: Acts as the adapter layer to external railway systems.
- **External Systems Mocked**: TMS (Track), SMMS (Signals), TDMS (OHE), COA (Train Timetable), BDMS (Block Data).
- **Function**: Standardizes disparate incoming data formats into a unified internal model for the AI to process.

### 2. AI Priority Engine (`ai/priority_engine/`)
- **Purpose**: Dynamically ranks maintenance tasks based on urgency and criticality.
- **Logic**: Evaluates parameters like defect severity, department (e.g., Track vs. Signal), and due dates to generate a priority score (0-100).
- **Output**: A sorted list of maintenance tasks with detailed reasoning for their ranking.

### 3. Domino AI Engine (`ai/domino/`)
- **Purpose**: Evaluates the cascading risk of delaying maintenance.
- **Logic**: Predicts how a delayed repair on one asset (e.g., a cracked rail) might force speed restrictions, subsequently delaying specific express trains and causing a domino effect across the network.
- **Output**: Cascade risk scores and downstream impact warnings.

### 4. CP-SAT Block Optimizer (`optimizer/`)
- **Purpose**: Computes the optimal schedule for maintenance blocks.
- **Logic**: Uses Google OR-Tools Constraint Programming (CP-SAT). It finds time windows where multiple departments can work simultaneously (co-location) while strictly avoiding collisions with scheduled train movements.
- **Output**: Optimal block recommendations with start/end times and participating departments.

## 🚀 Running the Backend Locally

1. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## 📖 API Documentation
Once running, interactive API documentation is available at `http://localhost:8000/docs`.

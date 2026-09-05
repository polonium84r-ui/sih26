# 🚆 Backend: AI & Optimization Engine

This directory contains the Python-based backend for the AI Railway Block Planner & Optimization System. It is built using FastAPI, SQLAlchemy ORM, and integrates several advanced AI and optimization techniques to manage railway maintenance blocks efficiently.

## 🏗️ Architecture Modules

### 1. Database & Persistence Layer (`database.py`, `models/orm.py`, `seed.py`)
- **ORM Models**: `TaskORM`, `TrainORM`, `BlockRequestORM`, `BlockRecommendationORM`.
- **Database Support**: PostgreSQL (via `psycopg2-binary`) with automatic fallback to local SQLite (`railway_planner.db`).
- **Seeding Script**: `python -m backend.app.seed` populates schema tables directly from system adapters and solver calculations.

### 2. Data Ingestion & Normalizer (`integrations/`)
- **Adapters**: TMS (Track), SMMS (Signals), TDMS (OHE), COA (Train Timetable), BDMS (Block Data).
- **Function**: Standardizes disparate incoming data formats into unified domain models.

### 3. AI Priority Engine (`ai/priority_engine/`)
- **Logic**: Evaluates parameters like defect severity, department criticality, and due dates to generate explainable priority scores (0–100).

### 4. Domino AI Engine (`ai/domino_ai/`)
- **Logic**: Predicts cascading delays and downstream impacts if maintenance is deferred across intersecting train timetables.

### 5. CP-SAT Block Optimizer (`optimizer/`)
- **Logic**: Uses Google OR-Tools Constraint Programming (CP-SAT) and spatial proximity grouping ($\le 3\text{ km}$) to find multi-department co-located block windows that avoid train movement schedule conflicts.

## 🚀 Quick Commands

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Seed Database**:
   ```bash
   python -m backend.app.seed
   ```

3. **Run Server**:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```

4. **Run Integration Tests**:
   ```bash
   python tests/unit/test_pipeline.py
   ```

## 📖 Interactive API Documentation
Once running, interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

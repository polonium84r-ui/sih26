# 🖥️ Frontend: Executive Dashboard & Digital Twin

This directory contains the React-based frontend for the AI Railway Block Planner & Optimization System. It provides a formal, professional interface for railway engineers and control room executives to monitor and manage maintenance operations.

## 🌟 Key Dashboard Areas

1. **Risk & Priority Center**: Displays the AI Priority Engine's output, ranking maintenance tasks by urgency and explaining the reasoning behind each rank.
2. **Block Tetris Scheduler**: A Gantt chart visualization powered by the CP-SAT Block Optimizer. It shows AI-recommended maintenance windows interweaved with train schedules to prove zero conflict.
3. **Live Digital Twin**: A real-time corridor monitor simulating train movements, active block zones, and the health status of physical track, signal, and OHE assets.
4. **Executive ROI Analytics**: A high-level comparative analysis showing the efficiency gains of using AI optimization (e.g., block utilization rates, reduced delay times) versus traditional manual scheduling.
5. **Field Assistant**: A simulated communication log showing interactions between the central system and on-ground engineering teams.

## 🎨 Design Philosophy

The application uses a **professional black-and-white theme** tailored for formal, high-stakes environments like a railway control room. It prioritizes data visibility, crisp typography, and clear contrast over flashy colors.

## 🚀 Running the Frontend Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Access the dashboard in your browser at `http://localhost:5173`.

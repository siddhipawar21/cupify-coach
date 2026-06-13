#!/bin/bash
# MatchMind — Quick Start Script
# Run this from the project root to start both backend and frontend

echo "⚽ Starting MatchMind..."
echo ""

# Check if knowledge base exists
if [ ! -d "backend/knowledge/vector_store" ]; then
  echo "📚 Building knowledge base first (Docling)..."
  cd backend && python knowledge/knowledge_pipeline.py && cd ..
  echo ""
fi

# Start Flask in background
echo "🚀 Starting Flask backend on port 5000..."
cd backend && python app.py &
BACKEND_PID=$!
cd ..

sleep 2

# Start React frontend
echo "🎨 Starting React frontend on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ MatchMind is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and clean up
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped.'" INT
wait
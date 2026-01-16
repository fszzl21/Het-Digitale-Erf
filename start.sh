#!/bin/bash
echo "🚀 Starting Het Digitale Erf..."

# Start backend in background
echo "📦 Starting backend on http://localhost:8000..."
cd backend && python3 server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🌐 Starting frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000 (or 3001 if 3000 is busy)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait

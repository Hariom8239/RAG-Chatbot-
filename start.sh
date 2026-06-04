#!/bin/bash

echo "Starting RAG Research Assistant..."

# Start backend
cd /home/happy/AIML-projects/RAG/backend
source ../.venv/bin/activate
../.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
cd /home/happy/AIML-projects/RAG/frontend
npm run dev -- --host &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "RAG Assistant is running!"
echo "Open browser at: http://172.28.99.159:5173"
echo ""
echo "Press Ctrl+C to stop everything"

# Wait and stop both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped'; exit" SIGINT
wait

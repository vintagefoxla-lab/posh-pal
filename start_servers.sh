#!/bin/bash
pkill -9 -f "node"
pkill -9 -f "vite"
sleep 2
cd /home/team/shared/posh-pal
nohup node server.js > backend.log 2>&1 &
# nohup npm run dev -- --host 0.0.0.0 --port 3000 > frontend.log 2>&1 &
sleep 5
ps aux | grep -E "node" | grep -v grep
ss -Htln | grep ":3000"

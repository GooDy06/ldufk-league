#!/bin/zsh
cd "$(dirname "$0")"

PORT_PIDS=$(lsof -ti tcp:3000)
if [ -n "$PORT_PIDS" ]; then
  echo "$PORT_PIDS" | xargs kill
  sleep 1
fi

rm -rf .next
npm run dev -- -p 3000

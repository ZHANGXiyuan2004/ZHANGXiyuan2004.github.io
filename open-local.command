#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="${0:A:h}"
cd "$SCRIPT_DIR"

PORT=8765
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

LOG_FILE="$SCRIPT_DIR/.local-server-${PORT}.log"
URL="http://127.0.0.1:${PORT}/index.html"

echo "Starting local preview server..."
echo "Directory: $SCRIPT_DIR"
echo "URL: $URL"
echo

nohup python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

sleep 1

if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  echo "Failed to start local server. Log:"
  cat "$LOG_FILE"
  echo
  echo "Press any key to close this window."
  read -k 1
  exit 1
fi

open "$URL"

echo "Opened $URL"
echo
echo "Keep this Terminal window open while previewing."
echo "Press Ctrl+C or close this window when you are done."

trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' INT TERM EXIT
wait "$SERVER_PID"

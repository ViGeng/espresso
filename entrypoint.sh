#!/bin/sh
set -e

# Run custom migration script
echo "Checking database..."
node scripts/migrate.js

# Optional: Check for updates if GIT_UPDATE is set
if [ "$GIT_UPDATE" = "true" ]; then
  echo "Pulling latest code..."
  # This implies source code is mounted or git is installed. 
  # For a production image, git might not be there.
  # But we'll leave this placeholder.
fi

echo "Starting application..."
exec node server.js

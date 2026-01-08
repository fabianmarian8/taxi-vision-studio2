#!/bin/bash

# Vercel Ignored Build Step
# Exit code 0 = Skip build (ignore deployment)
# Exit code 1 = Continue build (deploy)
#
# This script prevents unnecessary Vercel deployments when only staged files change

echo "Checking if build should be skipped..."

# Získaj zoznam zmenených súborov v tomto commite
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")

echo "Changed files:"
echo "$CHANGED_FILES"

# Ak sa zmenili LEN staged súbory, preskoč deployment
if [ -n "$CHANGED_FILES" ]; then
  # Odstráň staged súbory zo zoznamu zmenených súborov
  NON_STAGED_FILES=$(echo "$CHANGED_FILES" | grep -v "staged-changes.json" | grep -v "staged-suggestions.json" | grep -v "^$")

  if [ -z "$NON_STAGED_FILES" ]; then
    echo "✓ Only staged files changed. Skipping deployment."
    exit 0
  fi
fi

# Ak sa zmenili iné súbory, pokračuj s deploymentom
echo "✓ Non-staged files changed. Proceeding with deployment."
exit 1

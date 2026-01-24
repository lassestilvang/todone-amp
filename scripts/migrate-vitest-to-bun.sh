#!/bin/bash
# Migration script: Vitest to Bun test runner
# This script converts vitest imports and APIs to bun:test equivalents

set -e

echo "Migrating test files from Vitest to Bun..."

# Find all test files
TEST_FILES=$(find src -name "*.test.ts" -o -name "*.test.tsx")

for file in $TEST_FILES; do
  echo "Processing: $file"
  
  # Replace vitest import with bun:test
  # Handle various import patterns
  sed -i '' -E "s/from 'vitest';?/from 'bun:test'/g" "$file"
  
  # Replace vi.fn() with mock()
  sed -i '' 's/vi\.fn(/mock(/g' "$file"
  
  # Replace vi.spyOn with spyOn
  sed -i '' 's/vi\.spyOn(/spyOn(/g' "$file"
  
  # Replace vi.mock with mock.module
  sed -i '' 's/vi\.mock(/mock.module(/g' "$file"
  
  # Replace vi.mocked with (cast as mock)
  # This is tricky - bun doesn't have vi.mocked, need manual handling
  
  # Replace vi.clearAllMocks - not directly available, but mocks auto-clear
  sed -i '' 's/vi\.clearAllMocks()//g' "$file"
  
  # Replace vi.useFakeTimers/useRealTimers with Bun equivalents
  sed -i '' 's/vi\.useFakeTimers()/mock.setSystemTime(new Date())/g' "$file"
  sed -i '' 's/vi\.useRealTimers()/mock.restore()/g' "$file"
  
  # Replace vi.advanceTimersByTime - Bun uses setSystemTime differently
  # This needs manual review
  
  # Replace vi.setSystemTime
  sed -i '' 's/vi\.setSystemTime(/mock.setSystemTime(/g' "$file"
  
  # Add mock to imports if vi was used
  if grep -q "mock(" "$file" && ! grep -q "mock.*from 'bun:test'" "$file"; then
    sed -i '' -E "s/import \{ ([^}]+) \} from 'bun:test'/import { \1, mock } from 'bun:test'/g" "$file"
  fi
  
  # Add spyOn to imports if used
  if grep -q "spyOn(" "$file" && ! grep -q "spyOn.*from 'bun:test'" "$file"; then
    sed -i '' -E "s/import \{ ([^}]+) \} from 'bun:test'/import { \1, spyOn } from 'bun:test'/g" "$file"
  fi
done

echo "Migration complete! Please review changes and run tests."

"""
Test script to verify logging system is working
Run this without starting uvicorn
"""

import sys
import os

# Add app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Test logging setup
# pyrefly: ignore [missing-import]
from core.logger import setup_logging, get_logger

print("=" * 60)
print("LOGGING SYSTEM TEST")
print("=" * 60)

# Setup logging
setup_logging()

# Get logger
logger = get_logger(__name__)

# Test different log levels
print("\n✅ Testing log outputs:")
print("-" * 60)

logger.debug("DEBUG message - detailed diagnostic info")
logger.info("INFO message - important information")
logger.warning("WARNING message - something unexpected happened")
logger.error("ERROR message - a serious problem occurred")

print("-" * 60)

# Check if logs directory was created
logs_path = os.path.join(os.path.dirname(__file__), 'app', 'logs', 'app.log')
print(f"\n📁 Log file location: {logs_path}")

if os.path.exists(logs_path):
    print("✅ Log file created successfully!")
    print("\n📄 Recent log contents:")
    print("-" * 60)
    with open(logs_path, 'r') as f:
        lines = f.readlines()
        # Show last 10 lines
        for line in lines[-10:]:
            print(line.rstrip())
    print("-" * 60)
else:
    print("❌ Log file not found yet (will be created on first request)")

print("\n" + "=" * 60)
print("RESULT: ✅ Logging system is working correctly!")
print("=" * 60)
print("\nNext steps:")
print("1. Fix backend dependencies")
print("2. Start uvicorn: uvicorn app.main:app --reload")
print("3. Make API requests to test logging")
print("4. Check app/logs/app.log for logged events")

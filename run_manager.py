#!/usr/bin/env python3
# Wrapper script to run the email processor silently (no console output)
import os
import sys

# Redirect stdout and stderr to null
null_dev = open(os.devnull, 'w')
sys.stdout = null_dev
sys.stderr = null_dev

# Import and execute main function
from portable_etsy_manager import main as run_main

if __name__ == "__main__":
    # Run the processor; errors will still be logged to file via logger
    try:
        exit_code = run_main()
    except Exception as e:
        exit_code = 1
    sys.exit(exit_code)

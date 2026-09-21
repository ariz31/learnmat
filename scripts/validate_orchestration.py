#!/usr/bin/env python3
import sys
from orchestration_lib import validate

if __name__ == '__main__':
    try:
        count = validate()
        print(f'PASS: five disjoint owners; {count} reserved tasks; runtime/task records valid.')
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        sys.exit(1)

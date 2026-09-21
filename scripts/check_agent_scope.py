#!/usr/bin/env python3
import argparse
from pathlib import Path
import subprocess
import sys
from orchestration_lib import ROOT, scope

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Check committed, staged, unstaged and untracked worker changes.')
    parser.add_argument('--agent', required=True)
    parser.add_argument('--base', help='Integrator override: full immutable base commit SHA')
    parser.add_argument('--root', type=Path, default=ROOT,
                        help='Worker checkout to inspect using this trusted script')
    args = parser.parse_args()
    try:
        paths = scope(args.agent, root=args.root.resolve(), base=args.base)
        print(f'PASS: {len(paths)} changed paths belong to {args.agent}.')
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        sys.exit(1)

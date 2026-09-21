#!/usr/bin/env python3
"""Create five isolated local worktrees. Does not launch agents or push anything."""
import argparse
from pathlib import Path
import subprocess
import sys
from orchestration_lib import ROOT, SLUG, git, need, policy, save


def prepare(run, destination, base):
    need(SLUG.fullmatch(run), 'Run ID must be kebab-case')
    need(not git('status', '--porcelain'), 'Commit/reconcile current work before preparing worktrees')
    base = git('rev-parse', '--verify', f'{base}^{{commit}}')
    owners, _ = policy(base=base)  # Scaffold must already exist in the base commit.
    destination = Path(destination).resolve()
    need(destination != ROOT and ROOT not in destination.parents, 'Use a destination outside the repository')
    common = Path(git('rev-parse', '--path-format=absolute', '--git-common-dir'))
    # One launch transaction at a time for this shared Git database.
    gate = common/'learnmat-prepare.lock'
    gate.mkdir(exist_ok=False)
    created = []
    try:
        branches = [line.removeprefix('branch refs/heads/') for line in
                    git('worktree', 'list', '--porcelain').splitlines()
                    if line.startswith('branch refs/heads/')]
        for agent in owners['agents']:
            branch = f'agents/{agent}/{run}'
            target = destination/agent
            need(not target.exists(), f'Worktree already exists: {target}')
            exists = subprocess.run(['git', 'show-ref', '--verify', '--quiet', f'refs/heads/{branch}'], cwd=ROOT).returncode == 0
            need(not exists, f'Branch already exists: {branch}')
            need(not (common/'learnmat-agent-locks'/agent).exists(), f'Agent already active: {agent}')
            need(not any(b.startswith(f'agents/{agent}/') for b in branches),
                 f'{agent} already has a worker worktree; finish and retire the prior run first')
        destination.mkdir(parents=True, exist_ok=True)
        for agent in owners['agents']:
            branch, target = f'agents/{agent}/{run}', destination/agent
            subprocess.run(['git', 'worktree', 'add', '-b', branch, str(target), base], cwd=ROOT, check=True)
            save(target/'.agent-workspace.json', {'repository':'ariz31/learnmat', 'agent':agent,
                 'runId':run, 'branch':branch, 'base':base})
            created.append(str(target))
    finally:
        gate.rmdir()
    print('Prepared worktrees (agents have NOT been launched):\n'+'\n'.join(created))


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--run', required=True)
    parser.add_argument('--destination', required=True)
    parser.add_argument('--base', default='HEAD')
    args=parser.parse_args()
    try:
        prepare(args.run, args.destination, args.base)
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as exc:
        print(f'FAIL: {exc}. Existing worktrees are preserved; inspect before retrying.', file=sys.stderr)
        sys.exit(1)

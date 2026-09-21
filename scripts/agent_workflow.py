#!/usr/bin/env python3
"""Bounded task bookkeeping with local worktree fencing, no model/API execution."""
import argparse
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess
import sys
import uuid
from orchestration_lib import (ROOT, asset_path, fingerprint, git, need, policy,
                               read, save, scope, validate, validate_ready, workspace)


def now():
    return datetime.now(timezone.utc).isoformat()


def lock_paths(agent, root=ROOT):
    common=Path(git('rev-parse', '--path-format=absolute', '--git-common-dir', root=root))
    return common/'learnmat-agent-locks'/agent, root/'.agent-state/session.json'


def acquire(agent, task, cfg, root=ROOT):
    lock, session=lock_paths(agent, root)
    lock.parent.mkdir(parents=True, exist_ok=True)
    lock.mkdir(exist_ok=False)  # Atomic across worktrees sharing this Git database.
    record={'agent':agent,'task':task,'runId':cfg['runId'],'workspace':str(root.resolve()),
            'token':uuid.uuid4().hex,'createdAt':now()}
    try:
        save(lock/'owner.json', record)
        save(session, record)
    except Exception:
        # Only remove the lock created by this acquire, never a different owner's.
        shutil.rmtree(lock)
        raise
    return record


def held(agent, task, cfg, root=ROOT):
    lock, session=lock_paths(agent, root)
    local, owner=read(session), read(lock/'owner.json')
    need(local == owner and owner['agent'] == agent and owner['task'] == task
         and owner['runId'] == cfg['runId'] and owner['workspace'] == str(root.resolve()),
         'Lock is owned by a different session; do not change or delete it')
    return lock, session


def release(agent, task, cfg, root=ROOT):
    lock, session=held(agent, task, cfg, root)
    (lock/'owner.json').unlink()
    lock.rmdir()
    session.unlink()


def scaffold(agent, task, root=ROOT):
    directory=asset_path(task)
    dest=root/directory
    dest.mkdir(parents=True, exist_ok=False)
    for folder in ['src','demo','previews','checks']:
        (dest/folder).mkdir()
    shutil.copyfile(root/'templates/component/asset.mjs', dest/'src/asset.mjs')
    shutil.copyfile(root/'templates/component/demo.html', dest/'demo/index.html')
    shutil.copyfile(root/'templates/ASSET-README.md',dest/'README.md')
    shutil.copyfile(root/'templates/REVIEW.md',dest/'REVIEW.md')
    metadata=read(root/'templates/asset-metadata.json')
    metadata.update(id=task['id'], title=task['objective'], description=task['objective'],
                    category=task['category'], topics=[task['id']],
                    learningObjectives=[task['objective']], kind='component',
                    entrypoint=directory+'/demo/index.html',readme=directory+'/README.md',
                    reviewFile=directory+'/REVIEW.md')
    metadata['source']={'type':'original','reference':f"Reserved task {task['id']}; record authorship and sources before review.",'sha256':None}
    metadata['rights']['attribution']='Original repository contribution; document authorship and third-party notices before release.'
    metadata['verification']['notes']='Unimplemented agent scaffold; no engineering or browser checks performed.'
    save(dest/'asset.json',metadata)
    save(dest/'component.json',{'contractVersion':'1.0.0','implemented':False,
         'module':directory+'/src/asset.mjs','lengthUnit':'m','timeUnit':'s',
         'coordinates':'right-handed-y-up-north-minus-z','boundsDescription':None,
         'parameters':{},'assetDependencies':[]})
    save(root/f"work/{agent}/{task['id']}/evidence.json",{'reviewType':'self-review',
         'assetFingerprint':None,'checks':{key:{'status':'not-reviewed','details':''} for key in
         ['engineering','pedagogy','functionality','animation','accessibility','visual','reuse']},'unresolvedBlockers':[]})


def transition(state, action, limit, reason=None):
    """Pure transition function; no silent resets or retry-budget changes."""
    s=dict(state)
    need(s['status'] not in ['ready','blocked','integrated'], 'Terminal task cannot be restarted by a worker')
    if action == 'checking':
        need(s['status'] == 'building', 'checking requires building state')
        s['status']='checking'
    elif action == 'repair':
        need(s['status'] == 'checking', 'repair requires checking state')
        need(s['attempts'] < limit, 'Retry limit reached; block with evidence')
        s.update(status='building',attempts=s['attempts']+1)
    elif action == 'ready':
        need(s['status'] == 'checking', 'ready requires checking state')
        s['status']='ready'
    elif action == 'block':
        need(isinstance(reason,str) and len(reason.strip()) >= 12, 'Provide a useful blocker reason')
        s.update(status='blocked',reason=reason.strip())
    else:
        raise ValueError('Unknown transition')
    s['updatedAt']=now()
    s['history']=[*s.get('history',[]),{'action':action,'attempt':s['attempts'],'at':s['updatedAt']}]
    return s


def run(action, agent, tid, reason=None, root=ROOT):
    cfg=workspace(root, agent)
    owners,queues=policy(root, cfg['base'])
    need(agent in queues and tid in queues[agent], 'Task not assigned to agent')
    task=queues[agent][tid]
    state_path=root/f'work/{agent}/{tid}/state.json'
    if action == 'fingerprint':
        need((root/asset_path(task)).is_dir(), 'Asset does not exist')
        print(fingerprint(root/asset_path(task)))
        return
    scope(agent,root,cfg['base'])
    if action == 'release':
        # Recovery if interrupted after writing terminal state but before releasing lock.
        need(read(state_path)['status'] in ['ready','blocked'], 'Only terminal locks may be released')
        release(agent,tid,cfg,root)
        print('Released this session’s terminal lock.')
        return
    if action == 'begin':
        if state_path.exists():
            state=read(state_path)
            need(state['status'] in ['building','checking'] and state['runId'] == cfg['runId'],
                 'Task already has a different/terminal run; integrator must resolve it')
            held(agent,tid,cfg,root)
            print(f"Resume {tid}: {state['status']}, attempt {state['attempts']}; budget unchanged.")
            return
        started=[]
        for path in (root/f'work/{agent}').glob('*/state.json'):
            prior=read(path)
            need(prior['status'] not in ['building','checking'], 'Resume the unfinished task first')
            if prior['runId'] == cfg['runId']:
                started.append(prior)
        need(len(started)<owners['maxTasksPerRun'], 'Run task budget exhausted; hand off to integrator')
        need(not (root/asset_path(task)).exists(), 'Asset directory already exists; do not overwrite')
        acquire(agent,tid,cfg,root)
        stamp=now()
        state={'agent':agent,'task':tid,'runId':cfg['runId'],'base':cfg['base'],
               'status':'building','attempts':1,'updatedAt':stamp,
               'history':[{'action':'begin','attempt':1,'at':stamp}]}
        # Write state before scaffold: an interrupted scaffold remains visible and resumable.
        save(state_path,state)
        scaffold(agent,task,root)
        print(f"Started {tid} in {asset_path(task)} (attempt 1/{owners['maxAttemptsPerTask']}).")
        return
    held(agent,tid,cfg,root)
    state=read(state_path)
    need(state['runId'] == cfg['runId'] and state['base'] == cfg['base'], 'Task/base identity changed')
    next_state=transition(state,action,owners['maxAttemptsPerTask'],reason)
    if action == 'ready':
        subprocess.run([sys.executable,str(root/'scripts/validate_catalog.py')],cwd=root,check=True)
        validate(root)
        validate_ready(root,task,agent)
    save(state_path,next_state)
    if action in ['ready','block']:
        release(agent,tid,cfg,root)
    print(f"{tid}: {next_state['status']} (attempt {next_state['attempts']}).")


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('action',choices=['begin','checking','repair','ready','block','fingerprint','release'])
    parser.add_argument('--agent',required=True)
    parser.add_argument('--task',required=True)
    parser.add_argument('--reason')
    args=parser.parse_args()
    try:
        run(args.action,args.agent,args.task,args.reason)
    except (ValueError,KeyError,TypeError,OSError,subprocess.CalledProcessError) as exc:
        print(f'FAIL: {exc}',file=sys.stderr)
        sys.exit(1)

"""Shared structural checks for cooperative LearnMat contributors (not a sandbox)."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import os
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SLUG = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')


def need(condition, message):
    if not condition:
        raise ValueError(message)


def git(*args, root=ROOT):
    return subprocess.check_output(['git', *args], cwd=root).decode().strip()


def read(path):
    return json.loads(Path(path).read_text())


def save(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix='.write-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as stream:
            stream.write(json.dumps(value, indent=2) + '\n')
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def safe(path, root=ROOT, exists=True):
    p = PurePosixPath(path)
    need(isinstance(path, str) and path and not p.is_absolute()
         and '..' not in p.parts and '\\' not in path, f'Unsafe path: {path}')
    resolved = root / p
    need(root.resolve() in resolved.resolve().parents, f'Path escape: {path}')
    for part in (resolved, *resolved.parents):
        if part == root:
            break
        need(not part.is_symlink(), f'Symlink not allowed: {path}')
    if exists:
        need(resolved.is_file(), f'Missing file: {path}')
    return resolved


def policy(root=ROOT, base=None):
    def load(path):
        return json.loads(git('show', f'{base}:{path}', root=root)) if base else read(root/path)
    owners = load('orchestration/owners.json')
    need(owners['version'] == 1 and len(owners['agents']) == 5, 'Expected five owners')
    need(owners['maxTasksPerRun'] == 3 and owners['maxAttemptsPerTask'] == 3,
         'Unexpected loop limits')
    queues = {}
    ids, prefixes, categories = set(), set(), set()
    for agent, config in owners['agents'].items():
        need(SLUG.fullmatch(agent), 'Invalid agent ID')
        prefix = config['prefix']
        need(SLUG.fullmatch(prefix) and prefix not in prefixes, 'Duplicate/invalid prefix')
        prefixes.add(prefix)
        for category in config['categories']:
            need(category not in categories, f'Overlapping category: {category}')
            categories.add(category)
        queue = load(config['queue'])
        need(queue['agent'] == agent, 'Queue/owner mismatch')
        queues[agent] = {}
        for task in queue['tasks']:
            tid = task['id']
            need(SLUG.fullmatch(tid) and tid.startswith(prefix+'-') and tid not in ids,
                 f'Duplicate/invalid reserved ID: {tid}')
            need(task['category'] in config['categories'], f'Unowned category: {tid}')
            need(isinstance(task['objective'], str) and task['objective'], 'Missing objective')
            queues[agent][tid] = task
            ids.add(tid)
    return owners, queues


def workspace(root=ROOT, agent=None):
    cfg = read(root/'.agent-workspace.json')
    need(cfg.get('repository') == 'ariz31/learnmat', 'Wrong workspace repository')
    need(agent is None or cfg['agent'] == agent, 'Wrong agent workspace')
    need(SLUG.fullmatch(cfg['runId']), 'Invalid run ID')
    need(re.fullmatch('[0-9a-f]{40}', cfg['base']), 'Base must be a full commit SHA')
    need(git('branch', '--show-current', root=root) == cfg['branch']
         and cfg['branch'] == f"agents/{cfg['agent']}/{cfg['runId']}", 'Wrong worker branch')
    need(subprocess.run(['git', 'merge-base', '--is-ancestor', cfg['base'], 'HEAD'],
                        cwd=root, stdout=subprocess.DEVNULL).returncode == 0,
         'Workspace base is not an ancestor of HEAD')
    remote = git('remote', 'get-url', 'origin', root=root).lower().removesuffix('.git')
    need(remote in ['https://github.com/ariz31/learnmat', 'git@github.com:ariz31/learnmat',
                    'ssh://git@github.com/ariz31/learnmat'], 'Wrong origin repository')
    return cfg


def changed_paths(root=ROOT, base=None):
    need(base is not None, 'An immutable base is required')
    # --no-renames exposes both sides so moves cannot bypass ownership checks.
    paths = set()
    for args in [('diff', '--no-renames', '--name-only', '-z', base, '--'),
                 ('ls-files', '--others', '--exclude-standard', '-z')]:
        out = subprocess.check_output(['git', *args], cwd=root)
        paths.update(x.decode() for x in out.split(b'\0') if x)
    # Detect staged changes even when the working tree has been reverted afterward.
    out = subprocess.check_output(['git', 'diff', '--cached', '--no-renames',
                                   '--name-only', '-z', base, '--'], cwd=root)
    paths.update(x.decode() for x in out.split(b'\0') if x)
    return paths


def scope(agent, root=ROOT, base=None):
    if base is None:
        base = workspace(root, agent)['base']
    need(re.fullmatch('[0-9a-f]{40}', base), 'Scope base must be a full immutable commit SHA')
    _, queues = policy(root, base)
    need(agent in queues, 'Unknown agent')
    allowed = []
    for tid, task in queues[agent].items():
        allowed += [f"assets/{task['category']}/{tid}/", f'work/{agent}/{tid}/']
    paths = changed_paths(root, base)
    checked_tasks = set()
    for path in paths:
        need(any(path.startswith(prefix) for prefix in allowed),
             f'{agent} cannot modify {path}')
        safe(path, root, exists=False)
        need(not path.endswith('/AGENTS.md') and '/.git' not in path
             and not path.endswith('/.git'), f'Nested control file forbidden: {path}')
        parts = PurePosixPath(path).parts
        if parts[2] not in checked_tasks:
            checked_tasks.add(parts[2])
            prior_path = f'work/{agent}/{parts[2]}/state.json'
            prior = subprocess.run(['git', 'show', f'{base}:{prior_path}'], cwd=root,
                                   capture_output=True, text=True)
            if prior.returncode == 0:
                need(json.loads(prior.stdout)['status'] not in ['ready', 'blocked', 'integrated'],
                     'Terminal task from the base cannot be changed by a worker')
        if parts[0] == 'assets':
            meta = root / Path(*parts[:3]) / 'asset.json'
            if meta.exists():
                need(read(meta)['status'] in ['candidate', 'in-review'],
                     'Workers cannot modify or create approved/deprecated assets')
        if parts[0] == 'work':
            state = root / Path(*parts[:3]) / 'state.json'
            if state.exists():
                need(read(state)['status'] != 'integrated', 'Workers cannot mark tasks integrated')
    return paths


def asset_path(task):
    return f"assets/{task['category']}/{task['id']}"


def fingerprint(directory):
    directory = Path(directory)
    digest = hashlib.sha256()
    for path in sorted(directory.rglob('*')):
        need(not path.is_symlink(), f'Asset symlink forbidden: {path}')
        if path.is_file():
            name = path.relative_to(directory).as_posix().encode()
            data = path.read_bytes()
            digest.update(len(name).to_bytes(8, 'big') + name)
            digest.update(len(data).to_bytes(8, 'big') + data)
    return digest.hexdigest()


def validate(root=ROOT):
    owners, queues = policy(root)
    category_values = read(root/'schemas/asset.schema.json')['properties']['category']['enum']
    reserved = {tid: (agent, task) for agent, tasks in queues.items() for tid, task in tasks.items()}
    for agent, config in owners['agents'].items():
        safe(config['prompt'], root)
        need(set(config['categories']) <= set(category_values), 'Category absent from schema')
    for leaf in (root/'assets').glob('*/*') if (root/'assets').exists() else []:
        need(leaf.is_dir() and (leaf/'asset.json').is_file(), f'Missing asset metadata: {leaf}')
    for meta_path in (root/'assets').rglob('asset.json') if (root/'assets').exists() else []:
        meta = read(meta_path)
        tid = meta['id']
        need(tid in reserved, f'Unreserved asset ID: {tid}')
        _, task = reserved[tid]
        directory = asset_path(task)
        need(meta_path.relative_to(root).as_posix() == directory+'/asset.json',
             f'Asset directory/category mismatch: {tid}')
        need(meta['category'] == task['category'], 'Task/metadata category mismatch')
        for key in ['entrypoint', 'readme', 'previewImage', 'reviewFile']:
            if meta[key] is not None:
                need(meta[key].startswith(directory+'/'), f'Cross-asset path: {key}')
                safe(meta[key], root)
        comp = read(safe(directory+'/component.json', root))
        need(comp['contractVersion'] == '1.0.0', 'Unsupported runtime contract')
        need(comp['module'] == directory+'/src/asset.mjs', 'Unexpected component module')
        safe(comp['module'], root)
        need(comp['coordinates'] == 'right-handed-y-up-north-minus-z', 'Wrong coordinates')
        need(comp['lengthUnit'] == 'm' and comp['timeUnit'] == 's', 'Wrong base units')
        need(isinstance(comp['parameters'], dict) and isinstance(comp['assetDependencies'], list),
             'Invalid component declaration')
        for dependency in comp['assetDependencies']:
            need(set(dependency) == {'id', 'version'}, 'Invalid asset dependency')
            need(dependency['id'] != tid and dependency['id'] in reserved,
                 'Invalid cross-asset dependency')
            _, dep_task = reserved[dependency['id']]
            dep = read(safe(asset_path(dep_task)+'/asset.json', root))
            need(dep['version'] == dependency['version'] and dep['status'] == 'approved',
                 'Dependencies must reference an integrated approved version')
        # Assets may not contain symlinks, hidden control files, or shared-runtime overrides.
        for p in meta_path.parent.rglob('*'):
            safe(p.relative_to(root).as_posix(), root, exists=False)
            need(p.name != 'AGENTS.md' and not p.name.startswith('.git'),
                 'Nested control files are not allowed in assets')
    for state_file in (root/'work').glob('*/*/state.json') if (root/'work').exists() else []:
        state = read(state_file)
        agent, tid = state_file.relative_to(root).parts[1:3]
        need(agent in queues and tid in queues[agent], 'Unowned task state')
        need(state['agent'] == agent and state['task'] == tid, 'Task state identity mismatch')
        need(state['status'] in ['building', 'checking', 'ready', 'blocked', 'integrated'], 'Unknown task state')
        need(type(state['attempts']) is int and 1 <= state['attempts'] <= owners['maxAttemptsPerTask'],
             'Invalid task attempts')
        need(SLUG.fullmatch(state['runId']), 'Invalid recorded run ID')
        if state['status'] == 'blocked':
            need(bool(state.get('reason')), 'Blocked task lacks reason')
        if state['status'] == 'ready':
            validate_ready(root, queues[agent][tid], agent)
        if state['status'] == 'integrated':
            need(bool(state.get('integrationEvidence')), 'Integrated task requires independent review evidence')
    return len(reserved)


def validate_ready(root, task, agent):
    directory = asset_path(task)
    meta = read(safe(directory+'/asset.json', root))
    need(meta['status'] in ['candidate', 'in-review'], 'Workers cannot self-approve')
    need(meta['previewImage'] and meta['reviewFile'], 'Actual preview/review required')
    for path in [meta['previewImage'], meta['reviewFile']]:
        need(safe(path, root).stat().st_size > 0, 'Empty evidence file')
    comp = read(root/directory/'component.json')
    need(comp.get('boundsDescription') and comp.get('implemented') is True,
         'Unimplemented component or missing bounds description')
    module = safe(comp['module'], root).read_text()
    need('LEARNMAT_SCAFFOLD' not in module, 'Unimplemented scaffold')
    evidence = read(safe(f"work/{agent}/{task['id']}/evidence.json", root))
    need(evidence['assetFingerprint'] == fingerprint(root/directory), 'Stale asset evidence')
    need(evidence.get('reviewType') == 'self-review', 'Do not invent an independent review')
    for key in ['engineering', 'functionality', 'accessibility', 'visual', 'reuse']:
        item = evidence['checks'][key]
        need(item['status'] == 'passed' and bool(item['details']), f'Missing readiness check: {key}')
    need(not evidence.get('unresolvedBlockers'), 'Unresolved task blockers')

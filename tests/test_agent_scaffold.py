"""Critical data-integrity regressions for isolation, retry state and evidence.

These target multi-worktree overwrites, stale-writer lock release, lost retry
budgets and stale review acceptance. Static catalog validation cannot reproduce
these history-dependent cases. No browser/E2E or per-asset test suite is required.

Synthetic review evidence here tests bookkeeping only, never actual asset quality.
"""
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

REPO=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(REPO/'scripts'))
import orchestration_lib as lib
import agent_workflow as flow
import validate_catalog as catalog


class ScaffoldTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)/'repo'
        shutil.copytree(REPO,self.root,ignore=shutil.ignore_patterns(
            '.git','.build','.agent-state','.agent-workspace.json','__pycache__','assets','work'))
        self.git('init','-q')
        self.git('config','user.name','Scaffold Test')
        self.git('config','user.email','test@example.invalid')
        self.git('remote','add','origin','https://github.com/ariz31/learnmat.git')
        self.git('add','.')
        self.git('commit','-qm','test baseline')
        self.base=self.git('rev-parse','HEAD').strip()
        self.git('switch','-qc','agents/surveying/test-run')
        lib.save(self.root/'.agent-workspace.json',{'repository':'ariz31/learnmat',
            'agent':'surveying','runId':'test-run','branch':'agents/surveying/test-run','base':self.base})
        self.old_catalog_root=catalog.ROOT
        catalog.ROOT=self.root

    def tearDown(self):
        catalog.ROOT=self.old_catalog_root
        self.temp.cleanup()

    def git(self,*args):
        return subprocess.check_output(['git',*args],cwd=self.root,stderr=subprocess.DEVNULL).decode()

    def act(self,action,tid='sur-walking-person',reason=None):
        with redirect_stdout(io.StringIO()):
            return flow.run(action,'surveying',tid,reason,root=self.root)

    def test_guard_rejects_shared_file_and_uses_base_policy(self):
        p=self.root/'README.md';p.write_text('unowned edit')
        with self.assertRaisesRegex(ValueError,'cannot modify README.md'):
            lib.scope('surveying',self.root,self.base)
        self.git('restore','README.md')
        p=self.root/'orchestration/owners.json';obj=lib.read(p)
        obj['agents']['surveying']['categories'].append('buildings');lib.save(p,obj)
        with self.assertRaisesRegex(ValueError,'cannot modify orchestration/owners.json'):
            lib.scope('surveying',self.root,self.base)

    def test_guard_rejects_untracked_cross_domain_and_unreserved_id(self):
        p=self.root/'assets/buildings/bld-building-envelope/test.txt';p.parent.mkdir(parents=True);p.write_text('x')
        with self.assertRaisesRegex(ValueError,'cannot modify'):
            lib.scope('surveying',self.root,self.base)
        shutil.rmtree(self.root/'assets')
        p=self.root/'assets/surveying/sur-unreserved/test.txt';p.parent.mkdir(parents=True);p.write_text('x')
        with self.assertRaisesRegex(ValueError,'cannot modify'):
            lib.scope('surveying',self.root,self.base)

    def test_guard_covers_commits_deletions_renames_and_staged_reverts(self):
        self.git('mv','README.md','REMOVED.md')
        with self.assertRaises(ValueError):lib.scope('surveying',self.root,self.base)
        self.git('reset','--hard','HEAD')
        (self.root/'README.md').write_text('staged violation')
        self.git('add','README.md')
        original=self.git('show','HEAD:README.md')
        (self.root/'README.md').write_text(original)
        with self.assertRaises(ValueError):lib.scope('surveying',self.root,self.base)
        self.git('reset','--hard','HEAD')
        (self.root/'README.md').write_text('committed violation')
        self.git('add','README.md');self.git('commit','-qm','bad')
        with self.assertRaises(ValueError):lib.scope('surveying',self.root,self.base)

    def test_guard_rejects_symlinks_and_worker_approval(self):
        self.act('begin')
        p=self.root/'assets/surveying/sur-walking-person/escape'
        p.symlink_to(self.root/'README.md')
        with self.assertRaisesRegex(ValueError,'Symlink'):
            lib.scope('surveying',self.root,self.base)
        p.unlink()
        p=self.root/'assets/surveying/sur-walking-person/asset.json';obj=lib.read(p)
        obj['status']='approved';lib.save(p,obj)
        with self.assertRaisesRegex(ValueError,'cannot modify or create approved'):
            lib.scope('surveying',self.root,self.base)

    def test_second_owner_cannot_steal_lock_but_other_domain_can_acquire(self):
        self.act('begin')
        cfg=lib.workspace(self.root,'surveying')
        with self.assertRaises(FileExistsError):
            flow.acquire('surveying','sur-staff-holder',cfg,self.root)
        owner=flow.acquire('structures','str-support-reactions',cfg,self.root)
        self.assertEqual(owner['agent'],'structures')

    def test_changed_token_prevents_release(self):
        self.act('begin')
        lock,_=flow.lock_paths('surveying',self.root)
        obj=lib.read(lock/'owner.json');obj['token']='different';lib.save(lock/'owner.json',obj)
        with self.assertRaisesRegex(ValueError,'different session'):
            self.act('block',reason='Blocked for synthetic test')
        self.assertTrue(lock.exists())

    def test_resume_retries_and_persistent_run_budget(self):
        self.act('begin');self.act('begin')
        self.act('checking');self.act('repair');self.act('checking');self.act('repair');self.act('checking')
        with self.assertRaisesRegex(ValueError,'Retry limit'):self.act('repair')
        self.act('block',reason='Three attempts exhausted in synthetic test')
        with self.assertRaisesRegex(ValueError,'terminal run'):self.act('begin')
        for tid in ['sur-staff-holder','sur-tripod-level']:
            self.act('begin',tid);self.act('block',tid,'Blocked for synthetic test')
        with self.assertRaisesRegex(ValueError,'budget exhausted'):
            self.act('begin','sur-tape-team')

    def test_ready_rejects_unimplemented_or_stale_evidence(self):
        self.act('begin');self.act('checking')
        with self.assertRaisesRegex(ValueError,'preview/review required'):
            self.act('ready')
        _,q=lib.policy(self.root);task=q['surveying']['sur-walking-person']
        d=self.root/lib.asset_path(task)
        p=d/'asset.json';obj=lib.read(p);obj['previewImage']=str((d/'previews/fixture.svg').relative_to(self.root));lib.save(p,obj)
        (d/'previews/fixture.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        p=d/'component.json';obj=lib.read(p);obj.update(implemented=True,boundsDescription='Synthetic fixture');lib.save(p,obj)
        (d/'src/asset.mjs').write_text('export function createAsset() {}')
        e=self.root/'work/surveying/sur-walking-person/evidence.json'
        evidence=lib.read(e);evidence['assetFingerprint']=lib.fingerprint(d)
        for check in evidence['checks'].values():check.update(status='passed',details='Synthetic gate test only')
        lib.save(e,evidence)
        lib.validate_ready(self.root,task,'surveying')
        (d/'src/asset.mjs').write_text('export function createAsset() { return null; }')
        with self.assertRaisesRegex(ValueError,'Stale asset evidence'):
            lib.validate_ready(self.root,task,'surveying')
        evidence['assetFingerprint']=lib.fingerprint(d);lib.save(e,evidence)
        self.act('ready')
        state=lib.read(self.root/'work/surveying/sur-walking-person/state.json')
        self.assertEqual(state['status'],'ready')
        lock,_=flow.lock_paths('surveying',self.root)
        self.assertFalse(lock.exists())
        self.act('begin','sur-staff-holder')

    def test_partial_task_cannot_be_replaced_or_reset(self):
        self.act('begin')
        shutil.rmtree(self.root/'assets/surveying/sur-walking-person')
        self.act('begin')  # Resume reports state; does not overwrite partial work.
        self.assertFalse((self.root/'assets/surveying/sur-walking-person').exists())
        with self.assertRaisesRegex(ValueError,'unfinished task'):
            self.act('begin','sur-staff-holder')

    def test_prepare_creates_five_distinct_worktrees_without_agents(self):
        self.git('switch','-qc','integration')
        (self.root/'.agent-workspace.json').unlink()
        dest=Path(self.temp.name)/'workers'
        cmd=[sys.executable,'scripts/prepare_agent_worktrees.py','--run','new-run','--destination',str(dest)]
        result=subprocess.run(cmd,cwd=self.root,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(len(list(dest.glob('*/.agent-workspace.json'))),5)
        # Even a different run ID cannot schedule another worker per domain.
        other=[sys.executable,'scripts/prepare_agent_worktrees.py','--run','other-run',
               '--destination',str(Path(self.temp.name)/'other-workers')]
        result=subprocess.run(other,cwd=self.root,capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('already has a worker worktree',result.stderr)
        result=subprocess.run(cmd,cwd=self.root,capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(len(list(dest.glob('*/.agent-workspace.json'))),5)
        # Two independent contributor branches integrate without editing a registry.
        for agent,tid in [('surveying','sur-walking-person'),('structures','str-support-reactions')]:
            worker=dest/agent
            with redirect_stdout(io.StringIO()):
                flow.run('begin',agent,tid,root=worker)
                flow.run('block',agent,tid,'Synthetic integration fixture, not a reviewed asset',root=worker)
            lib.scope(agent,worker,self.base)
            subprocess.run(['git','add','assets','work'],cwd=worker,check=True)
            subprocess.run(['git','commit','-qm','isolated contribution'],cwd=worker,check=True)
            self.git('merge','--no-edit',f'agents/{agent}/new-run')
        with redirect_stdout(io.StringIO()):self.assertEqual(len(catalog.main()),7)
        self.assertEqual(lib.validate(self.root),40)

    def test_integrated_task_cannot_be_reopened_by_changing_metadata(self):
        self.act('begin');self.act('block',reason='Needs independent follow-up task')
        self.git('add','assets','work');self.git('commit','-qm','terminal task')
        newer=self.git('rev-parse','HEAD').strip()
        p=self.root/'assets/surveying/sur-walking-person/README.md'
        p.write_text('Attempt to reopen terminal task')
        with self.assertRaisesRegex(ValueError,'Terminal task from the base'):
            lib.scope('surveying',self.root,newer)


if __name__ == '__main__':
    unittest.main()

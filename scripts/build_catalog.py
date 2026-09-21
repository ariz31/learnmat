#!/usr/bin/env python3
"""Generate ignored catalog output; workers never edit a shared index."""
import argparse
import sys
from orchestration_lib import ROOT, save, validate
from validate_catalog import main, collect_records

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--public',action='store_true',help='Include approved assets only')
    args=parser.parse_args()
    try:
        assets=main()
        validate()
        allowed={x['id'] for x in assets if not args.public or x['status']=='approved'}
        records=sorted((x for x in collect_records() if x['id'] in allowed),key=lambda x:x['id'])
        output=ROOT/'.build'/('public-catalog.json' if args.public else 'catalog.json')
        save(output,{'schemaVersion':'1.0.0','audience':'public' if args.public else 'internal','assets':records})
        print(f'Wrote {len(records)} entries to {output.relative_to(ROOT)}; no hosting files copied.')
    except (ValueError,KeyError,TypeError,OSError) as exc:
        print(f'FAIL: {exc}',file=sys.stderr)
        sys.exit(1)

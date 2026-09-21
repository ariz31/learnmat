#!/usr/bin/env python3
"""Validate LearnMat metadata and archived source integrity using Python 3 only.

Supports exactly the JSON Schema keywords used in schemas/asset.schema.json.
This is a structural check, not an engineering or runtime review.
"""
from pathlib import Path, PurePosixPath
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def local_file(value):
    require(isinstance(value, str) and value, 'Expected nonempty relative path')
    p = PurePosixPath(value)
    require(not p.is_absolute() and '..' not in p.parts and '\\' not in value,
            f'Invalid local path: {value}')
    resolved = (ROOT / value).resolve()
    require(ROOT in resolved.parents, f'Path escapes repository: {value}')
    require(resolved.is_file(), f'Missing file: {value}')
    return resolved


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def collect_records():
    """Keep the legacy intake index stable; discover new per-asset manifests."""
    catalog = read_json(local_file('catalog/catalog.json'))
    require(catalog.get('schemaVersion') == '1.0.0', 'Unsupported catalog version')
    legacy = catalog.get('assets')
    require(isinstance(legacy, list), 'Invalid catalog assets')
    records = list(legacy)
    indexed = {x['metadata'] for x in records}
    for path in sorted((ROOT / 'assets').rglob('asset.json')):
        rel = path.relative_to(ROOT).as_posix()
        require(len(path.relative_to(ROOT).parts) == 4, f'Invalid asset layout: {rel}')
        require(rel not in indexed, f'New assets must not edit the shared legacy index: {rel}')
        record = read_json(local_file(rel))
        records.append({'id': record['id'], 'metadata': rel})
    return records


def check(value, schema, location):
    allowed = {'$schema', 'title', 'type', 'const', 'enum', 'pattern', 'minLength',
               'properties', 'required', 'additionalProperties', 'items',
               'minItems', 'uniqueItems'}
    require(set(schema) <= allowed, f'{location}: unsupported schema keyword')
    types = schema.get('type')
    if types:
        types = [types] if isinstance(types, str) else types
        checks = {'string': isinstance(value, str), 'null': value is None,
                  'boolean': isinstance(value, bool), 'array': isinstance(value, list),
                  'object': isinstance(value, dict)}
        require(all(t in checks for t in types), f'{location}: unsupported schema type')
        require(any(checks[t] for t in types), f'{location}: invalid type')
    if 'const' in schema:
        require(value == schema['const'], f'{location}: wrong constant')
    if 'enum' in schema:
        require(value in schema['enum'], f'{location}: unexpected value {value!r}')
    if isinstance(value, str):
        require(len(value) >= schema.get('minLength', 0), f'{location}: too short')
        if 'pattern' in schema:
            require(re.search(schema['pattern'], value) is not None,
                    f'{location}: invalid format')
    if isinstance(value, list):
        require(len(value) >= schema.get('minItems', 0), f'{location}: too few items')
        if schema.get('uniqueItems'):
            require(len({json.dumps(x, sort_keys=True) for x in value}) == len(value),
                    f'{location}: duplicate items')
        for i, item in enumerate(value):
            check(item, schema.get('items', {}), f'{location}[{i}]')
    if isinstance(value, dict):
        props = schema.get('properties', {})
        require(set(schema.get('required', [])) <= set(value),
                f'{location}: missing required fields')
        if schema.get('additionalProperties') is False:
            require(set(value) <= set(props), f'{location}: unexpected fields')
        for key in value:
            if key in props:
                check(value[key], props[key], f'{location}.{key}')


def main():
    schema = read_json(local_file('schemas/asset.schema.json'))
    records = collect_records()
    require(isinstance(records, list) and records, 'Empty or invalid catalog')
    seen = set()
    assets = []
    for item in records:
        require(isinstance(item, dict) and set(item) == {'id', 'metadata'},
                'Invalid catalog index entry')
        record = read_json(local_file(item['metadata']))
        check(record, schema, item['metadata'])
        require(item['id'] == record['id'], 'Index ID differs from metadata')
        require(record['id'] not in seen, f'Duplicate ID: {record["id"]}')
        seen.add(record['id'])
        assets.append(record)
        for key in ['entrypoint', 'readme', 'previewImage', 'reviewFile']:
            if record[key] is not None:
                local_file(record[key])
        rights = record['rights']
        if rights['licenseFile'] is not None:
            local_file(rights['licenseFile'])
        if record['status'] in ['approved', 'deprecated']:
            require(all(record['verification'][x] == 'passed' for x in
                        ['engineeringReview', 'browserReview', 'accessibilityReview']),
                    f'{record["id"]}: incomplete release reviews')
            require(rights['status'] == 'cleared' and rights['licenseExpression']
                    and rights['licenseFile'], f'{record["id"]}: rights not cleared')
            require(record['previewImage'] and record['reviewFile'],
                    f'{record["id"]}: missing preview/review evidence')
    for record in assets:
        if record['derivedFrom']:
            require(record['derivedFrom'] in seen and record['derivedFrom'] != record['id'],
                    f'{record["id"]}: invalid derivation reference')
    provenance = read_json(local_file('catalog/provenance.json'))
    paths = set()
    for item in provenance['files']:
        require(item['path'] not in paths, 'Duplicate provenance path')
        paths.add(item['path'])
        data = local_file(item['path']).read_bytes()
        require(len(data) == item['sizeBytes'], f'{item["path"]}: size changed')
        require(hashlib.sha256(data).hexdigest() == item['sha256'],
                f'{item["path"]}: original source bytes changed')
        matching = [x for x in assets if x['entrypoint'] == item['path']]
        require(len(matching) == 1 and matching[0]['source']['sha256'] == item['sha256'],
                f'{item["path"]}: metadata provenance mismatch')
    print(f'PASS: {len(assets)} metadata records; {len(paths)} unchanged source files.')
    print('Structural validation only; no engineering, browser, or rights approval.')
    return assets


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(f'FAIL: {exc}', file=sys.stderr)
        sys.exit(1)

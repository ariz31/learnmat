#!/usr/bin/env python3
"""Build the dependency-free LearnMat catalog viewer for static/Vercel hosting."""

from __future__ import annotations

import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import sys
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
DIST = ROOT / "dist"

sys.path.insert(0, str(ROOT / "scripts"))
from validate_catalog import collect_records, main as validate_catalog  # noqa: E402


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_repo_file(value: str) -> Path:
    require(isinstance(value, str) and value, "Expected non-empty repository path")
    pure = PurePosixPath(value)
    require(not pure.is_absolute() and ".." not in pure.parts and "\\" not in value,
            f"Unsafe repository path: {value}")
    path = (ROOT / pure).resolve()
    require(ROOT.resolve() in path.parents, f"Path escapes repository: {value}")
    require(path.is_file() and not path.is_symlink(), f"Missing/unsupported file: {value}")
    return path


def source_commit() -> str:
    for name in ("VERCEL_GIT_COMMIT_SHA", "GITHUB_SHA"):
        value = os.environ.get(name, "").strip()
        if len(value) == 40 and all(char in "0123456789abcdefABCDEF" for char in value):
            return value.lower()
    try:
        value = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stderr=subprocess.DEVNULL
        ).strip()
        if len(value) == 40:
            return value
    except (OSError, subprocess.CalledProcessError):
        pass
    return "unknown"


def reset_dist() -> None:
    if DIST.exists():
        require(not DIST.is_symlink(), "Refusing to remove symlinked dist directory")
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)


def copy_file(source: Path, destination: Path) -> None:
    require(source.is_file() and not source.is_symlink(), f"Cannot publish {source}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def copy_site_shell() -> None:
    for name in ("index.html", "styles.css", "app.js", "favicon.svg"):
        copy_file(safe_repo_file(f"site/{name}"), DIST / name)


def should_publish_runtime_file(relative_to_asset: Path) -> bool:
    parts = relative_to_asset.parts
    if not parts:
        return False
    if parts[0] == "checks":
        return False
    if relative_to_asset.name in {"asset.json", "README.md", "REVIEW.md"}:
        return False
    if relative_to_asset.name.startswith("."):
        return False
    return True


def copy_asset_runtime(metadata_path: str) -> None:
    metadata = safe_repo_file(metadata_path)
    asset_root = metadata.parent
    for source in sorted(asset_root.rglob("*")):
        if source.is_dir():
            continue
        require(not source.is_symlink(), f"Symlink not allowed in published asset: {source}")
        rel_asset = source.relative_to(asset_root)
        if not should_publish_runtime_file(rel_asset):
            continue
        rel_repo = source.relative_to(ROOT)
        copy_file(source, DIST / rel_repo)


def copy_license(record: dict) -> str | None:
    value = record.get("rights", {}).get("licenseFile")
    if not value:
        return None
    source = safe_repo_file(value)
    destination = DIST / value
    copy_file(source, destination)
    return "/" + PurePosixPath(value).as_posix()


def component_metadata(metadata_path: str) -> dict | None:
    component = (ROOT / PurePosixPath(metadata_path)).parent / "component.json"
    if not component.is_file():
        return None
    relative = component.relative_to(ROOT).as_posix()
    data = read_json(safe_repo_file(relative))
    return {
        "contractVersion": data.get("contractVersion"),
        "implemented": data.get("implemented"),
        "lengthUnit": data.get("lengthUnit"),
        "timeUnit": data.get("timeUnit"),
        "coordinates": data.get("coordinates"),
        "boundsDescription": data.get("boundsDescription"),
        "parameters": data.get("parameters", {}),
        "assetDependencies": data.get("assetDependencies", []),
    }


def build_catalog() -> dict:
    validated_assets = validate_catalog()
    validated_by_id = {record["id"]: record for record in validated_assets}
    records = collect_records()
    commit = source_commit()

    output = []
    for pointer in records:
        asset_id = pointer["id"]
        metadata_path = pointer["metadata"]
        require(asset_id in validated_by_id, f"Validated record missing: {asset_id}")
        record = validated_by_id[asset_id]
        entrypoint = safe_repo_file(record["entrypoint"])
        require(entrypoint.suffix.lower() == ".html",
                f"Viewer requires an HTML entrypoint for {asset_id}: {record['entrypoint']}")

        copy_asset_runtime(metadata_path)

        preview_url = None
        if record.get("previewImage"):
            safe_repo_file(record["previewImage"])
            preview_url = "/" + PurePosixPath(record["previewImage"]).as_posix()

        license_url = copy_license(record)

        source_ref = commit if commit != "unknown" else "main"
        encoded_metadata = quote(metadata_path, safe="/")
        encoded_entrypoint = quote(record["entrypoint"], safe="/")
        origin = "curated" if metadata_path.startswith("assets/") else "legacy-example"
        original_component = (
            origin == "curated"
            and record.get("source", {}).get("type") == "original"
        )

        item = dict(record)
        item.update({
            "metadataPath": metadata_path,
            "entrypointUrl": "/" + PurePosixPath(record["entrypoint"]).as_posix(),
            "previewUrl": preview_url,
            "licenseUrl": license_url,
            "origin": origin,
            "previewPolicy": "repository-component" if original_component else "isolated-candidate",
            "sourceUrl": (
                "https://github.com/ariz31/learnmat/blob/"
                + source_ref + "/" + encoded_metadata
            ),
            "entrypointSourceUrl": (
                "https://github.com/ariz31/learnmat/blob/"
                + source_ref + "/" + encoded_entrypoint
            ),
            "component": component_metadata(metadata_path),
        })
        output.append(item)

    output.sort(key=lambda item: (item.get("category", ""), item.get("title", item["id"]).lower()))
    return {
        "schemaVersion": "1.0.0",
        "audience": "development-viewer",
        "description": (
            "Internal/development viewer inventory. Candidate or in-review presence "
            "does not imply approval, rights clearance, or public-release eligibility."
        ),
        "sourceCommit": commit,
        "assetCount": len(output),
        "assets": output,
    }


def write_catalog(catalog: dict) -> None:
    (DIST / "catalog.json").write_text(
        json.dumps(catalog, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    reset_dist()
    copy_site_shell()
    catalog = build_catalog()
    write_catalog(catalog)
    print(
        f"Built LearnMat viewer: {catalog['assetCount']} catalog assets -> "
        f"{DIST.relative_to(ROOT)}/"
    )
    print("Development viewer includes non-approved records with explicit status/rights labels.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError, json.JSONDecodeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        sys.exit(1)

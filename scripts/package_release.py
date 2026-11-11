"""Build a source-only ZIP using an explicit allowlist; never include local env files."""
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "clustersense-ai-source.zip"
ROOT_FILES = {
    "README.md", "HowToSetup.md", "AGENTS.md", "CHANGELOG.md", "LICENSE-NOTE.md",
    ".env.example", ".gitignore", ".dockerignore", "docker-compose.yml",
    "setup.sh", "start.sh", "stop.sh", "reset_db.sh", "train_models.py",
}
TREES = {"backend/app", "backend/data", "backend/mock", "frontend/src", "frontend/public",
         "database", "docs", "deploy", "scripts", "tests"}
EXTRA = {"backend/requirements.txt", "backend/.env.example", "backend/Dockerfile",
         "frontend/.env.example", "frontend/Dockerfile", "frontend/package.json",
         "frontend/package-lock.json", "frontend/index.html", "frontend/vite.config.js",
         "frontend/tailwind.config.js", "frontend/postcss.config.js"}
BLOCKED = {"venv", ".venv", "node_modules", "__pycache__", ".git", "dist", "build"}

def release_files():
    for path in sorted(ROOT.rglob("*")):
        rel = path.relative_to(ROOT)
        if path.is_symlink() or not path.is_file() or BLOCKED.intersection(rel.parts):
            continue
        name = rel.as_posix()
        if path.suffix in {".pkl", ".pyc", ".zip"} or (path.name.startswith(".env") and path.name != ".env.example"):
            continue
        if name in ROOT_FILES | EXTRA or any(name.startswith(tree + "/") for tree in TREES):
            yield path, name

def main():
    files = list(release_files())
    # Refuse common embedded Google API keys and private-key material.
    key_pattern = re.compile(rb"AIza[0-9A-Za-z_-]{30,}|AQ\.[0-9A-Za-z_-]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")
    for path, name in files:
        if key_pattern.search(path.read_bytes()):
            raise SystemExit("Possible embedded secret in " + name + "; archive not created")
    with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, name in files:
            archive.write(path, name)
    print(f"Created {OUTPUT.name}: {len(files)} source files; no environments, dependencies, models or build output")

if __name__ == "__main__":
    main()

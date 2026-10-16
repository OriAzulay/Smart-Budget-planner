"""Rebuild the table of contents of a learning topic and print it to PDF.

Usage (from the repo root):
    python .claude/skills/learn-note/scripts/build_pdf.py <category>/<topic>
    python .claude/skills/learn-note/scripts/build_pdf.py --all

Source:  learning/_src/<category>/<topic>.html
Output:  learning/<category>/<topic>.pdf

The PDF is rendered by Microsoft Edge (or Chrome) in headless mode, which
handles Hebrew / right-to-left text correctly.
"""
import html
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path.cwd() / "learning"
SRC = ROOT / "_src"

BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]

ARTICLE_RE = re.compile(
    r'<article[^>]*\bid="([^"]+)"[^>]*>\s*<h2>(.*?)</h2>\s*<p class="meta">(.*?)</p>',
    re.S,
)
TOC_RE = re.compile(r"<!--TOC-->.*?<!--/TOC-->", re.S)


def find_browser() -> str:
    for path in BROWSERS:
        if Path(path).exists():
            return path
    for name in ("msedge", "chrome", "chromium"):
        found = shutil.which(name)
        if found:
            return found
    sys.exit("Error: Microsoft Edge or Google Chrome was not found; it is needed to create the PDF.")


def rebuild_toc(source: Path) -> int:
    text = source.read_text(encoding="utf-8")
    entries = ARTICLE_RE.findall(text)
    items = []
    for anchor, title, meta in entries:
        date = re.sub(r"<[^>]+>", "", meta).split("·")[0].strip()
        items.append(
            f'  <li><a href="#{html.escape(anchor)}"><bdi>{title}</bdi></a> <span class="d">· {date}</span></li>'
        )
    toc = "<!--TOC-->\n<h3>תוכן עניינים</h3>\n<ol>\n" + "\n".join(items) + "\n</ol>\n<!--/TOC-->"
    if not entries:
        toc = "<!--TOC-->\n<!--/TOC-->"
    source.write_text(TOC_RE.sub(lambda _: toc, text, count=1), encoding="utf-8")
    return len(entries)


def build(rel: str, browser: str) -> None:
    rel = rel.replace("\\", "/").removesuffix(".html").removesuffix(".pdf")
    source = SRC / f"{rel}.html"
    if not source.exists():
        sys.exit(f"Error: source not found: {source}")
    count = rebuild_toc(source)

    out = ROOT / f"{rel}.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)
    # A separate profile, so it works even while the user's browser is open.
    with tempfile.TemporaryDirectory() as profile:
        subprocess.run(
            [
                browser,
                "--headless",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--user-data-dir={profile}",
                f"--print-to-pdf={out}",
                source.resolve().as_uri(),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=120,
        )
    if not out.exists():
        sys.exit(f"Error: PDF was not created: {out}")
    print(f"{out.relative_to(Path.cwd())}  ({count} entries)")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    browser = find_browser()
    if sys.argv[1] == "--all":
        for source in sorted(SRC.rglob("*.html")):
            build(source.relative_to(SRC).as_posix(), browser)
    else:
        build(sys.argv[1], browser)


if __name__ == "__main__":
    main()

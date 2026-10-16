---
name: learn-note
description: Write a short, beginner-friendly Hebrew learning explanation of a code change (what was added, how it's built, which technologies, a real code snippet, glossary) into per-topic PDFs under learning/<category>/<topic>.pdf. Use when the user runs /learn-note.
argument-hint: [what to explain — default: the latest change]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# learn-note: learning explanations of code changes, as PDFs by topic

Explains a code change to a **beginner**, in Hebrew, and adds it to topic PDFs. `learning/` is git-ignored, so it stays local.

```
learning/
  <category>/<topic>.pdf        ← what the user reads (generated, never edit)
  _src/<category>/<topic>.html  ← the source you edit
```

Categories (lowercase folder names): `backend`, `frontend`, `database`, `testing`, `devops`. Topics are lowercase English file names, e.g. `backend/architecture`, `backend/fastapi`, `backend/routers`, `frontend/react`, `frontend/nextjs`, `frontend/tailwind`, `frontend/auth`, `database/sqlalchemy`, `database/alembic`, `testing/vitest`, `devops/docker`. Run `Glob learning/_src/**/*.html` first and reuse an existing topic when one fits; create a new topic (or category) only if nothing fits.

## Steps

1. **Find the change.** Use the arguments if given. Otherwise use the changes made in this conversation, or `git diff`, or `git show HEAD`. Read the changed files enough to explain them accurately.
2. **Pick 1–3 topics.** A change usually touches one main topic; add a second only if there is real, different learning in it (e.g. a Login page → `frontend/auth` for the flow, `frontend/react` for `useState`). Don't repeat the same explanation in two topics.
3. **New topic?** Create `learning/_src/<category>/<topic>.html` from [template.html](template.html), replacing:
   - `{{CATEGORY}}` → category name (e.g. `Frontend`), `{{TOPIC}}` / `{{TOPIC_TITLE}}` → topic name (e.g. `React`)
   - `{{INTRO}}` → 2–4 sentences in `<p>`: what this technology is, and why/how it's used **in this project**.
4. **Write the entry** (Hebrew, beginner level, ⅓–½ page). Insert it right before `</body>`, after all existing entries. **Never change or delete existing entries.** Use exactly this structure:

   ```html
   <article id="e-YYYYMMDD-short-slug">
   <h2>כותרת קצרה</h2>
   <p class="meta">DD.MM.YYYY · קבצים: <code>path/file.tsx</code>, <code>path/other.ts</code></p>

   <h4>מה נוסף</h4>
   <p>1–2 משפטים.</p>

   <h4>איך זה בנוי</h4>
   <ol><li>3–5 שלבים של הזרימה, צעד אחר צעד</li></ol>

   <h4>טכנולוגיות</h4>
   <ul><li><b>שם</b> — שורה אחת של רקע</li></ul>

   <h4>קטע מהקוד — נושא קצר</h4>
   <pre><code>3–8 lines copied (lightly trimmed) from the real code</code></pre>
   <p>הסבר פשוט של הקטע.</p>

   <div class="glossary"><h4>מילון מונחים</h4>
   <ul><li><b>מונח</b> — הסבר במשפט</li></ul></div>
   </article>
   ```

   - Explain like to someone who knows basic programming but not this technology. Short sentences, no jargon without explaining it.
   - The snippet must come from the actual code. Any comment you add inside `<pre>` must be in **English** (Hebrew inside left-to-right code renders scrambled). Escape `<`, `>`, `&` inside `<pre>` (`&lt;` `&gt;` `&amp;`).
   - 2–3 glossary terms, only new ones not already defined earlier in that topic file.
5. **Build the PDF** for each topic you touched, from the repo root:
   ```bash
   python .claude/skills/learn-note/scripts/build_pdf.py <category>/<topic>
   ```
   It updates the table of contents and writes `learning/<category>/<topic>.pdf`. On Windows prefix with `PYTHONIOENCODING=utf-8`.
6. **Confirm** in 2–3 lines: which topics got an entry, the entry titles, and the PDF paths as links.

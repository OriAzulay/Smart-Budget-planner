---
name: app-note
description: Add a new note to the project's personal notes file (notes/project_notes.txt). Use when the user runs /app-note or asks to add/save/write a note (הערה) about the project.
argument-hint: <what the note is about>
allowed-tools: Read, Write, Edit
---

# app-note: add a note to notes/project_notes.txt

Appends one new note to `notes/project_notes.txt` (the `notes/` folder is git-ignored, so the notes stay local).

## Steps

1. **Get the content.** Use the text in the arguments. If none was given, ask the user what the note is about.
2. **Write the note** in the user's language (usually Hebrew), in exactly this format:

   ```
   כותרת: <short title>
   תיאור: <short summary, 1-2 lines max>
   ==================
   • <point>
   • <point>
   ```

   - The full description is bullet points (`•`), **at most 5 lines**.
   - Keep the user's facts. Don't invent details they didn't give. You may tighten the wording.
   - If the user's input is too long for 5 lines, keep the most important points.
3. **Append it.** Read `notes/project_notes.txt` (create it and the `notes/` folder if missing). Add the note at the end, separated from the previous note by one empty line. Never change or delete existing notes. Save as UTF-8.
4. **Confirm.** Show the user the note that was added, nothing more.

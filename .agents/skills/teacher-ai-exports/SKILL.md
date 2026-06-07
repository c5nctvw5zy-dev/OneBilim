---
name: AI Teacher Workspace exports
description: Teacher AI tools render H2 markdown sections as Cards with PDF (jsPDF), DOCX (docx), and PPTX (pptxgenjs) downloads
type: feature
---
TeacherAIWorkspace.tsx: 7 blocks (plan/presentation/tasks/personal/visuals/lab/analysis). Each prompt instructs the model to use `## Heading` sections; parseSections splits them and Cards render each. Analysis block also parses `ОҚУШЫ_БАЛЛДАР: name=score, ...` line into Progress-bar diagram. Exports: PDF (Helvetica fallback — Cyrillic may degrade, prefer DOCX), DOCX (full Unicode), PPTX shown only on presentation block. Tables in section bodies render as styled HTML tables.

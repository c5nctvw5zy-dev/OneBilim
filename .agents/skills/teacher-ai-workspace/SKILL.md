---
name: Teacher AI Workspace
description: Teacher AI tools render structured cards with PDF/DOCX/PPTX export, parsed from H2 markdown sections returned by Lovable AI Gateway
type: feature
---
The TeacherAIWorkspace component (src/components/TeacherAIWorkspace.tsx) has 7 specialized blocks. Each prompt instructs the model to return Markdown with H2 (`## ...`) sections, which are parsed into Cards. Exports use jsPDF (PDF), docx (DOCX), pptxgenjs (PPTX, presentation block only). Analysis block detects `ОҚУШЫ_БАЛЛДАР:` line and renders a Progress bar chart. Note: jsPDF uses Helvetica fallback so Cyrillic/Kazakh may degrade in PDF — prefer DOCX/PPTX for full Unicode fidelity.

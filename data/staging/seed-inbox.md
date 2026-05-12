# Seed Inbox

Use this file for raw incoming notes before anything is promoted into canonical data.

## Batch Template
- batch_id:
- date:
- source_type: resume | screenshot | raw_notes | interview_notes | project_writeup | email | other
- priority: high | medium | low
- public_safe_guess: yes | no | unsure
- related_role_id:
- related_project_id:
- raw_notes:
  - 
- questions_for_review:
  - 
- suggested_public_wording:
  - 

## Example
- batch_id: 2026-05-10-rsm-additions-01
- date: 2026-05-10
- source_type: screenshot
- priority: high
- public_safe_guess: yes
- related_role_id: role_rsm_2020_present
- related_project_id: project_documentation_agents
- raw_notes:
  - Created documentation agents to turn intake materials into structured briefs and reusable artifacts.
  - MigrateIQ uses semantic matching, LLM-assisted disambiguation, analyst review, and SQL export.
- questions_for_review:
  - Can MigrateIQ be named publicly?
  - Which of these items should appear in UI vs chat only?
- suggested_public_wording:
  - Built AI-assisted documentation workflows that convert raw intake materials into structured project artifacts.

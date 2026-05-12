# API Contract Draft

## POST /api/chat
Request body:
```json
{
  "question": "What kind of AI work has Igor actually done?",
  "detail_level": "default"
}
```

Response body:
```json
{
  "answer": "Igor's approved experience includes practical AI workflow work such as documentation agents, workflow orchestration, prompt libraries, migration accelerators, MCP-enabled workflows, and local LLM experimentation.",
  "answer_status": "answered",
  "citations": [
    { "label": "RSM role summary", "source_record_id": "role_rsm_2020_present" },
    { "label": "Projects", "source_record_id": "project_documentation_agents" }
  ]
}
```

## POST /api/reindex
Use this endpoint to rebuild retrieval chunks and refresh vector search after canonical data changes.

## GET /api/health
Use this endpoint to verify API and vector-store connectivity.

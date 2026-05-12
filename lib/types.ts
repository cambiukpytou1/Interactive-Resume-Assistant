export type Profile = {
  id: string;
  name: string;
  preferred_name: string | null;
  headline: string;
  tagline: string;
  location: string;
  contact_variants: {
    personal: { email: string; phone: string };
    client_facing: { email: string; phone: string };
  };
  experience_summary: {
    total_years_enterprise_experience: number;
    workflow_automation_and_orchestration_years: string;
    applied_ai_workflow_experience: string;
    big_four_years: number;
  };
  current_positioning: string[];
  best_fit_roles: string[];
  core_identity: string[];
  explicit_boundaries: string[];
  short_public_summary: string;
  medium_public_summary: string;
};

export type Role = {
  id: string;
  company: string;
  title: string;
  client_facing_title?: string;
  start_date: string;
  end_date: string;
  location: string;
  summary: string;
  highlights: string[];
  industries: string[];
  tools_platforms: string[];
  regulations_frameworks: string[];
  source_status: string;
  public_safe: boolean;
  implemented_or_conceptual: string;
  confidence: string;
  last_updated: string;
};

export type Project = {
  id: string;
  name: string;
  category: string;
  summary: string;
  tools: string[];
  implementation_status: string;
  public_safe: boolean;
  source_status: string;
  confidence: string;
};

export type SkillEntry = {
  name: string;
  level: string;
  status: string;
  source_status: string;
};

export type Skills = Record<string, SkillEntry[] | string[]>;

export type Guardrails = {
  safe_positioning: string[];
  avoid_positioning: string[];
  restricted_claims: string[];
  response_rules: string[];
  fit_statements: Record<string, string>;
  retrieval_filters: {
    exclude_source_status: string[];
    require_public_safe: boolean;
  };
};

export type ResumeData = {
  profile: Profile;
  roles: Role[];
  projects: Project[];
  skills: Skills;
  guardrails: Guardrails;
  interviewQa: string;
};

export type ChatCitation = {
  label: string;
  source_record_id: string;
};

export type ChatResult = {
  answer: string;
  answer_status: 'answered' | 'not_in_kb' | 'refused_guardrail';
  citations: ChatCitation[];
  matched_chunks?: RetrievalChunk[];
};

export type RetrievalChunkType =
  | 'profile_summary'
  | 'profile_positioning'
  | 'role_summary'
  | 'role_highlight'
  | 'project_card'
  | 'skill_group'
  | 'interview_qa'
  | 'guardrail_rule';

export type RetrievalChunk = {
  id: string;
  chunkType: RetrievalChunkType;
  title: string;
  text: string;
  sourceRecordId: string;
  sourceStatus: string;
  publicSafe: boolean;
  tags: string[];
  priority: number;
};

export type RetrievalManifest = {
  generated_at: string;
  chunk_count: number;
  version: string;
};

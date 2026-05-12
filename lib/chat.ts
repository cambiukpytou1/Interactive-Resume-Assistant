import { ChatCitation, ChatResult, ResumeData, RetrievalChunk, RetrievalMode } from '@/lib/types';
import { retrieveChunks } from '@/lib/retrieval';

const RESTRICTED_PATTERNS = [
  /proprietary prompt/i,
  /internal template/i,
  /confidential/i,
  /client name/i,
  /reveal .* methodology/i,
  /show .* prompt/i,
  /private prompt/i,
  /exact template/i
];

function addCitation(citations: ChatCitation[], label: string, source_record_id: string) {
  if (!citations.find((item) => item.source_record_id === source_record_id && item.label === label)) {
    citations.push({ label, source_record_id });
  }
}

function toSentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function answerFromTopChunks(chunks: RetrievalChunk[], citations: ChatCitation[]) {
  const top = chunks[0];
  const second = chunks[1];
  if (!top) return null;

  addCitation(citations, top.title, top.sourceRecordId);
  if (second) addCitation(citations, second.title, second.sourceRecordId);

  if (top.chunkType === 'interview_qa') {
    return top.text;
  }

  if (top.chunkType === 'project_card') {
    let answer = `${top.title} is one of the strongest matching examples in the approved knowledge base. ${top.text}`;
    if (second && second.sourceRecordId !== top.sourceRecordId && ['role_summary', 'role_highlight'].includes(second.chunkType)) {
      answer += ` Related experience context: ${toSentenceCase(second.text)}`;
    }
    return answer;
  }

  if (top.chunkType === 'role_summary' || top.chunkType === 'role_highlight') {
    let answer = top.text;
    if (second && second.chunkType === 'project_card') {
      answer += ` Related project example: ${second.text}`;
    }
    return answer;
  }

  if (top.chunkType === 'skill_group') {
    return `Relevant approved skills include ${top.text.replace(/^.*?:\s*/, '')}.`;
  }

  if (top.chunkType === 'profile_positioning' || top.chunkType === 'profile_summary') {
    return top.text;
  }

  return top.text;
}

export function isRestrictedQuestion(question: string) {
  return RESTRICTED_PATTERNS.some((pattern) => pattern.test(question));
}

export function buildGuardrailRefusal(retrievalMode: RetrievalMode = 'rule_based'): ChatResult {
  return {
    answer:
      'I can summarize the public-safe capabilities on record, but I can\'t provide proprietary prompts, confidential client details, or restricted internal materials.',
    answer_status: 'refused_guardrail',
    citations: [{ label: 'Guardrails', source_record_id: 'guardrails' }],
    retrieval_mode: retrievalMode
  };
}

function buildFallback(profileId: string, retrievalMode: RetrievalMode): ChatResult {
  const citations: ChatCitation[] = [];
  addCitation(citations, 'Profile', profileId);

  return {
    answer: 'I do not have that detail in the approved resume knowledge base. I can answer from the approved profile, roles, projects, skills, and interview Q&A that are currently included.',
    answer_status: 'not_in_kb',
    citations,
    matched_chunks: [],
    retrieval_mode: retrievalMode
  };
}

export function buildChunkAnswer(
  chunks: RetrievalChunk[],
  profileId: string,
  retrievalMode: RetrievalMode = 'rule_based'
): ChatResult | null {
  const citations: ChatCitation[] = [];
  const answer = answerFromTopChunks(chunks, citations);

  if (!answer) {
    return null;
  }

  return {
    answer,
    answer_status: 'answered',
    citations,
    matched_chunks: chunks,
    retrieval_mode: retrievalMode
  };
}

export function answerQuestion(
  question: string,
  data: ResumeData,
  retrievalMode: RetrievalMode = 'rule_based'
): ChatResult {
  if (isRestrictedQuestion(question)) {
    return buildGuardrailRefusal(retrievalMode);
  }

  const lowerQuestion = question.toLowerCase();
  const citations: ChatCitation[] = [];

  if (/years|how long|experience/.test(lowerQuestion) && /how many|total|overall/.test(lowerQuestion)) {
    addCitation(citations, 'Profile', data.profile.id);
    return {
      answer: `${data.profile.name} has ${data.profile.experience_summary.total_years_enterprise_experience} years of enterprise experience overall, including ${data.profile.experience_summary.workflow_automation_and_orchestration_years} years of workflow automation/orchestration and ${data.profile.experience_summary.applied_ai_workflow_experience} of applied AI workflow experience.`,
      answer_status: 'answered',
      citations,
      retrieval_mode: retrievalMode
    };
  }

  if (/contact|email|reach|phone/.test(lowerQuestion)) {
    addCitation(citations, 'Profile', data.profile.id);
    return {
      answer: 'Contact details are kept private in this public build. Please use the contact prompt on the page to get in touch.',
      answer_status: 'answered',
      citations,
      retrieval_mode: retrievalMode
    };
  }

  const matchedChunks = retrieveChunks(question, data, 6);
  const chunkResult = buildChunkAnswer(matchedChunks, data.profile.id, retrievalMode);

  if (chunkResult) {
    return chunkResult;
  }

  return buildFallback(data.profile.id, retrievalMode);
}

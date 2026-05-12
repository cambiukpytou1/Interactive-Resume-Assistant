import { ChatResult, ResumeData, ChatCitation, RetrievalChunk } from '@/lib/types';
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

function answerFromTopChunks(question: string, chunks: RetrievalChunk[], citations: ChatCitation[]) {
  const top = chunks[0];
  const second = chunks[1];
  if (!top) return null;

  addCitation(citations, top.title, top.sourceRecordId);
  if (second) addCitation(citations, second.title, second.sourceRecordId);

  if (top.chunkType === 'interview_qa') {
    return top.text;
  }

  if (top.chunkType === 'project_card') {
    let answer = `${top.title} is one of the strongest matching examples in Igor's approved knowledge base. ${top.text}`;
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

export function answerQuestion(question: string, data: ResumeData): ChatResult {
  if (RESTRICTED_PATTERNS.some((pattern) => pattern.test(question))) {
    return {
      answer:
        'I can summarize Igor\'s public-safe capabilities, but I can\'t provide proprietary prompts, confidential client details, or restricted internal materials.',
      answer_status: 'refused_guardrail',
      citations: [{ label: 'Guardrails', source_record_id: 'guardrails' }]
    };
  }

  const lowerQuestion = question.toLowerCase();
  const citations: ChatCitation[] = [];

  if (/years|how long|experience/.test(lowerQuestion) && /how many|total|overall/.test(lowerQuestion)) {
    addCitation(citations, 'Profile', data.profile.id);
    return {
      answer: `${data.profile.name} has ${data.profile.experience_summary.total_years_enterprise_experience} years of enterprise experience overall, including ${data.profile.experience_summary.workflow_automation_and_orchestration_years} years of workflow automation/orchestration and ${data.profile.experience_summary.applied_ai_workflow_experience} of applied AI workflow experience.`,
      answer_status: 'answered',
      citations
    };
  }

  if (/contact|email|reach|phone/.test(lowerQuestion)) {
    addCitation(citations, 'Profile', data.profile.id);
    return {
      answer: 'The approved profile currently contains both a personal and a client-facing contact variant. Final public display should follow the selections in the confirmation checklist before production launch.',
      answer_status: 'answered',
      citations
    };
  }

  const matchedChunks = retrieveChunks(question, data, 6);
  const answer = answerFromTopChunks(question, matchedChunks, citations);

  if (answer) {
    return {
      answer,
      answer_status: 'answered',
      citations,
      matched_chunks: matchedChunks
    };
  }

  addCitation(citations, 'Profile', data.profile.id);
  return {
    answer: 'I do not have that detail in the approved resume knowledge base. I can answer from the approved profile, roles, projects, skills, and interview Q&A that are currently included.',
    answer_status: 'not_in_kb',
    citations,
    matched_chunks: []
  };
}

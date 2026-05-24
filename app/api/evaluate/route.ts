import { NextRequest, NextResponse } from 'next/server';
import { loadResumeData } from '@/lib/data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'z-ai/glm-5.1';

const EVAL_SYSTEM_PROMPT = `You are an expert career coach and resume evaluator. Your job is to objectively evaluate how well a candidate's background fits a specific job description.

You will receive a structured summary of the candidate's background (referred to only as "I.Y.") and a job description.

Your response MUST follow this EXACT structure with these EXACT section headers:

## RECRUITER_SECTION_START

## Overall Fit Score
Give a score like "8/10" on the first line, then one sentence explaining it.

## Strengths
List 3–5 specific ways I.Y.'s background directly matches the job requirements. Reference both the JD and actual experience.

## Gaps
List 2–4 honest gaps where I.Y.'s background does not fully match. Be direct and specific.

## RECRUITER_SECTION_END

## CANDIDATE_SECTION_START

## Standout Differentiators
List 1–3 things about I.Y. that go beyond the requirements or make them uniquely competitive.

## Recommended Talking Points
List 4–6 specific talking points I.Y. should emphasize in interviews for this role. Be very specific and tie each point to the JD.

## Suggested Improvements
List 2–3 concrete things I.Y. could do or highlight to strengthen their candidacy for this type of role.

## CANDIDATE_SECTION_END

RULES:
- Be honest and balanced — do not oversell or undersell
- Always refer to the candidate as "I.Y." — never reveal personal details
- Ground every statement in the actual resume data provided
- Keep each section concise and actionable`;

function buildResumeContext(data: Awaited<ReturnType<typeof loadResumeData>>): string {
  const { profile, roles, projects, skills } = data;

  const rolesText = roles.map(r =>
    `• ${r.title} at ${r.company} (${r.start_date} – ${r.end_date}): ${r.summary} Key highlights: ${r.highlights.slice(0, 3).join('; ')}`
  ).join('\n');

  const skillGroups = Object.entries(skills)
    .filter(([key]) => key !== 'explicit_boundaries')
    .map(([group, items]) => {
      const arr = Array.isArray(items) ? items : [];
      const names = arr.map((i: any) => typeof i === 'string' ? i : i.name).join(', ');
      return `${group.replaceAll('_', ' ')}: ${names}`;
    }).join('\n');

  const projectsText = projects.slice(0, 8).map(p =>
    `• ${p.name} (${p.category}): ${p.summary}`
  ).join('\n');

  return `CANDIDATE BACKGROUND SUMMARY FOR I.Y.

PROFILE:
${profile.headline}
${profile.medium_public_summary}
Total experience: ${profile.experience_summary.total_years_enterprise_experience} years
Big Four background: ${profile.experience_summary.big_four_years} years
Workflow automation: ${profile.experience_summary.workflow_automation_and_orchestration_years} years
Applied AI workflow: ${profile.experience_summary.applied_ai_workflow_experience}

BEST-FIT ROLES: ${profile.best_fit_roles.join(', ')}

EXPERIENCE:
${rolesText}

SKILLS:
${skillGroups}

SELECTED PROJECTS:
${projectsText}

CERTIFICATIONS: ${(skills.certifications_and_education as string[] ?? []).join(', ')}`;
}

function parseEvaluation(raw: string): { recruiterOutput: string; candidateNotes: string; fitScore: number | null; jobTitle: string | null } {
  // Strip thinking tags
  const clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Split recruiter vs candidate sections
  const recruiterMatch = clean.match(/##\s*RECRUITER_SECTION_START([\s\S]*?)##\s*RECRUITER_SECTION_END/i);
  const candidateMatch = clean.match(/##\s*CANDIDATE_SECTION_START([\s\S]*?)##\s*CANDIDATE_SECTION_END/i);

  const recruiterOutput = recruiterMatch
    ? recruiterMatch[1].trim()
    : clean; // fallback: show everything

  const candidateNotes = candidateMatch
    ? candidateMatch[1].trim()
    : '';

  // Extract fit score
  const scoreMatch = recruiterOutput.match(/##\s*Overall Fit Score\s*\n(\d+)\s*(?:\/\s*10)?/i);
  const fitScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // Try to extract job title from first line of the JD (done in route handler)
  return { recruiterOutput, candidateNotes, fitScore, jobTitle: null };
}

function extractJobTitle(jobDescription: string): string | null {
  // Look for common patterns like "Job Title: X", "Position: X", or first non-empty line
  const titlePatterns = [
    /(?:job title|position|role|title)[:\s]+([^\n]+)/i,
    /^([^\n]{5,80})/,
  ];
  for (const pattern of titlePatterns) {
    const match = jobDescription.match(pattern);
    if (match) return match[1].trim().slice(0, 120);
  }
  return null;
}

function extractCompanyHint(jobDescription: string): string | null {
  const match = jobDescription.match(/(?:company|organization|firm|employer)[:\s]+([^\n]+)/i);
  return match ? match[1].trim().slice(0, 120) : null;
}

async function logToSupabase(entry: {
  jobTitle: string | null;
  companyHint: string | null;
  jobDescription: string;
  fitScore: number | null;
  recruiterOutput: string;
  candidateNotes: string;
  visitorIp: string;
  userAgent: string;
}) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY)?.trim();

  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/job_evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        job_title: entry.jobTitle,
        company_hint: entry.companyHint,
        job_description: entry.jobDescription,
        fit_score: entry.fitScore,
        recruiter_output: entry.recruiterOutput,
        candidate_notes: entry.candidateNotes,
        visitor_ip: entry.visitorIp,
        user_agent: entry.userAgent,
      }),
    });
  } catch (err) {
    // Logging failure must never break the user-facing response
    console.error('[evaluate] Supabase logging failed:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const jobDescription = typeof body?.jobDescription === 'string'
      ? body.jobDescription.slice(0, 5000).trim()
      : '';

    if (!jobDescription || jobDescription.length < 50) {
      return NextResponse.json(
        { error: 'Please provide a job description (at least 50 characters).' },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = process.env.NVIDIA_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured.' },
        { status: 503, headers: corsHeaders }
      );
    }

    const data = await loadResumeData();
    const resumeContext = buildResumeContext(data);

    const userMessage = `${resumeContext}

---

JOB DESCRIPTION TO EVALUATE AGAINST:

${jobDescription}

---

Please evaluate how well I.Y.'s background fits this job description using the exact structured format specified in your instructions.`;

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: EVAL_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        top_p: 1,
        max_tokens: 2048,
        stream: false,
        extra_body: {
          chat_template_kwargs: { enable_thinking: true, clear_thinking: true },
        },
      }),
    });

    if (!response.ok) {
      console.error('[evaluate] NVIDIA API error:', response.status);
      return NextResponse.json(
        { error: 'AI service error. Please try again.' },
        { status: 502, headers: corsHeaders }
      );
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const raw = payload.choices?.[0]?.message?.content?.trim() ?? '';
    if (!raw) {
      return NextResponse.json(
        { error: 'No evaluation generated. Please try again.' },
        { status: 502, headers: corsHeaders }
      );
    }

    const { recruiterOutput, candidateNotes, fitScore } = parseEvaluation(raw);
    const jobTitle = extractJobTitle(jobDescription);
    const companyHint = extractCompanyHint(jobDescription);

    // Get visitor info
    const visitorIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    // Log silently — never block the response
    logToSupabase({ jobTitle, companyHint, jobDescription, fitScore, recruiterOutput, candidateNotes, visitorIp, userAgent });

    // Return only recruiter-facing content to the public
    return NextResponse.json(
      { evaluation: recruiterOutput, fitScore },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('[evaluate] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

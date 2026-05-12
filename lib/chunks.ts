import { promises as fs } from 'fs';
import path from 'path';
import { ResumeData, RetrievalChunk, RetrievalManifest, SkillEntry } from '@/lib/types';

const generatedDir = path.join(process.cwd(), 'data', 'generated');
const chunksPath = path.join(generatedDir, 'retrieval-chunks.json');
const manifestPath = path.join(generatedDir, 'retrieval-manifest.runtime.json');

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseInterviewQa(markdown: string) {
  return markdown
    .split(/\n## /)
    .map((section, index) => ({
      raw: section.trim(),
      index
    }))
    .filter((entry) => entry.raw)
    .map((entry) => {
      const lines = entry.raw.split('\n').filter(Boolean);
      const title = lines[0].replace(/^#\s*/, '').trim();
      const answer = lines.slice(1).join(' ').trim();
      return { title, answer, index: entry.index };
    })
    .filter((entry) => entry.title && entry.answer);
}

function normalizeSkillEntries(entries: SkillEntry[] | string[]) {
  return entries.map((entry) => (typeof entry === 'string' ? entry : `${entry.name} (${entry.level}, ${entry.status.replaceAll('_', ' ')})`));
}

export function buildRetrievalChunks(data: ResumeData): RetrievalChunk[] {
  const chunks: RetrievalChunk[] = [];

  chunks.push({
    id: 'profile-summary',
    chunkType: 'profile_summary',
    title: 'Profile summary',
    text: `${data.profile.name}. ${data.profile.short_public_summary} ${data.profile.medium_public_summary}`,
    sourceRecordId: data.profile.id,
    sourceStatus: 'canonical_profile',
    publicSafe: true,
    tags: ['profile', 'summary', 'experience'],
    priority: 10
  });

  chunks.push({
    id: 'profile-positioning',
    chunkType: 'profile_positioning',
    title: 'Profile positioning',
    text: `Best-fit roles: ${data.profile.best_fit_roles.join(', ')}. Current positioning: ${data.profile.current_positioning.join(', ')}. Boundaries: ${data.profile.explicit_boundaries.join(', ')}`,
    sourceRecordId: data.profile.id,
    sourceStatus: 'canonical_profile',
    publicSafe: true,
    tags: ['positioning', 'fit', 'roles', 'boundaries'],
    priority: 9
  });

  for (const role of data.roles) {
    chunks.push({
      id: `${role.id}-summary`,
      chunkType: 'role_summary',
      title: `${role.title} at ${role.company}`,
      text: `${role.title} at ${role.company}. ${role.summary} Industries: ${role.industries.join(', ')}. Tools: ${role.tools_platforms.join(', ')}. Frameworks: ${role.regulations_frameworks.join(', ')}.`,
      sourceRecordId: role.id,
      sourceStatus: role.source_status,
      publicSafe: role.public_safe,
      tags: [role.company, role.title, ...role.industries, ...role.tools_platforms].map(slugify).filter(Boolean),
      priority: 8
    });

    role.highlights.forEach((highlight, index) => {
      chunks.push({
        id: `${role.id}-highlight-${index + 1}`,
        chunkType: 'role_highlight',
        title: `${role.company} highlight ${index + 1}`,
        text: `${role.title} at ${role.company}: ${highlight}`,
        sourceRecordId: role.id,
        sourceStatus: role.source_status,
        publicSafe: role.public_safe,
        tags: [role.company, role.title, highlight].map(slugify).filter(Boolean),
        priority: 7
      });
    });
  }

  for (const project of data.projects) {
    chunks.push({
      id: `${project.id}-project`,
      chunkType: 'project_card',
      title: project.name,
      text: `${project.name}. Category: ${project.category}. ${project.summary} Tools: ${project.tools.join(', ')}. Implementation status: ${project.implementation_status.replaceAll('_', ' ')}.`,
      sourceRecordId: project.id,
      sourceStatus: project.source_status,
      publicSafe: project.public_safe,
      tags: [project.name, project.category, ...project.tools].map(slugify).filter(Boolean),
      priority: 7
    });
  }

  for (const [group, entries] of Object.entries(data.skills)) {
    if (['explicit_boundaries', 'certifications', 'education'].includes(group)) continue;
    const normalized = normalizeSkillEntries(entries);
    chunks.push({
      id: `skills-${slugify(group)}`,
      chunkType: 'skill_group',
      title: group.replaceAll('_', ' '),
      text: `${group.replaceAll('_', ' ')}: ${normalized.join(', ')}`,
      sourceRecordId: 'skills',
      sourceStatus: 'canonical_skills',
      publicSafe: true,
      tags: [group, ...normalized].map(slugify).filter(Boolean),
      priority: 6
    });
  }

  for (const qa of parseInterviewQa(data.interviewQa)) {
    chunks.push({
      id: `qa-${slugify(qa.title)}-${qa.index}`,
      chunkType: 'interview_qa',
      title: qa.title,
      text: qa.answer,
      sourceRecordId: 'interview-qa',
      sourceStatus: 'canonical_qa',
      publicSafe: true,
      tags: [qa.title, qa.answer].map(slugify).filter(Boolean),
      priority: 9
    });
  }

  data.guardrails.restricted_claims.forEach((rule, index) => {
    chunks.push({
      id: `guardrail-${index + 1}`,
      chunkType: 'guardrail_rule',
      title: `Guardrail ${index + 1}`,
      text: rule,
      sourceRecordId: 'guardrails',
      sourceStatus: 'canonical_guardrails',
      publicSafe: true,
      tags: ['guardrail', rule].map(slugify).filter(Boolean),
      priority: 10
    });
  });

  return chunks.filter((chunk) => chunk.publicSafe);
}

export async function saveRetrievalArtifacts(chunks: RetrievalChunk[]) {
  await fs.mkdir(generatedDir, { recursive: true });
  const manifest: RetrievalManifest = {
    generated_at: new Date().toISOString(),
    chunk_count: chunks.length,
    version: 'runtime-v1'
  };

  await Promise.all([
    fs.writeFile(chunksPath, JSON.stringify(chunks, null, 2), 'utf8'),
    fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  ]);

  return manifest;
}

export async function loadSavedChunks() {
  try {
    const file = await fs.readFile(chunksPath, 'utf8');
    return JSON.parse(file) as RetrievalChunk[];
  } catch {
    return null;
  }
}

import { promises as fs } from 'fs';
import path from 'path';
import { ResumeData, Profile, Role, Project, Skills, Guardrails } from '@/lib/types';
import { buildRetrievalChunks, loadSavedChunks, saveRetrievalArtifacts } from '@/lib/chunks';

const canonicalBasePath = path.join(process.cwd(), 'data', 'canonical');

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(canonicalBasePath, fileName);
  const file = await fs.readFile(filePath, 'utf8');
  return JSON.parse(file) as T;
}

async function readTextFile(fileName: string): Promise<string> {
  const filePath = path.join(canonicalBasePath, fileName);
  return fs.readFile(filePath, 'utf8');
}

export async function loadResumeData(): Promise<ResumeData> {
  const [profile, roles, projects, skills, guardrails, interviewQa] = await Promise.all([
    readJsonFile<Profile>('profile.json'),
    readJsonFile<Role[]>('roles.json'),
    readJsonFile<Project[]>('projects.json'),
    readJsonFile<Skills>('skills.json'),
    readJsonFile<Guardrails>('guardrails.json'),
    readTextFile('interview-qa.md')
  ]);

  return { profile, roles, projects, skills, guardrails, interviewQa };
}

export async function ensureRetrievalArtifacts() {
  const saved = await loadSavedChunks();
  if (saved && saved.length > 0) {
    return saved;
  }

  const data = await loadResumeData();
  const chunks = buildRetrievalChunks(data);
  await saveRetrievalArtifacts(chunks);
  return chunks;
}

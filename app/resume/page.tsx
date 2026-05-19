import { ResumeView } from '@/components/resume-view';
import { loadResumeData } from '@/lib/data';

export const metadata = {
  title: 'Resume · I.Y.',
  description: 'Professional resume — Enterprise AI Workflow, Analytics & Governance Leader',
};

export default async function ResumePage() {
  const data = await loadResumeData();
  return <ResumeView data={data} />;
}

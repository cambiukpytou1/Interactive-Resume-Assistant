import { JobFitEvaluator } from '@/components/job-fit-evaluator';

export const metadata = {
  title: 'Job Fit Evaluator · I.Y.',
  description: 'Paste a job description and get an AI-powered evaluation of how well I.Y. fits the role.',
};

export default function EvaluatePage() {
  return <JobFitEvaluator />;
}

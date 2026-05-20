import { loadResumeData } from '@/lib/data';
import { buildRetrievalChunks, saveRetrievalArtifacts } from '@/lib/chunks';

async function run() {
  const data = await loadResumeData();
  const chunks = buildRetrievalChunks(data);
  const manifest = await saveRetrievalArtifacts(chunks);
  console.log('Regenerated', chunks.length, 'chunks');
  console.log('Generated at:', manifest.generated_at);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

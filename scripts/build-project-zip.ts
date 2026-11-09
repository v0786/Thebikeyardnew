import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { PROJECT_CODE_FILES } from '../src/lib/projectZipGenerator.ts';

async function generateDiskZip() {
  console.log('Generating production ZIP archive with Next.js 16 + Prisma 6.12 schema...');
  const zip = new JSZip();

  for (const file of PROJECT_CODE_FILES) {
    zip.file(file.path, file.content);
    console.log(`+ Added: ${file.path}`);
  }

  zip.file(
    '.env.example',
    `# The Bike Yard Dealership Environment Variables
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thebikeyard?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-secure-random-32-byte-hex-in-production"
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
DEFAULT_DEALERSHIP_CODE="TBY-THANE-01"
`
  );

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicDest = path.join(publicDir, 'the-bike-yard-next16-prisma.zip');
  fs.writeFileSync(publicDest, content);
  console.log(`Saved public zip to: ${publicDest} (${content.length} bytes)`);

  const artifactDir = '/.aistudio/artifacts/brain/ac3a8093-2544-4437-98ac-dbb4a1a3b3df';
  if (fs.existsSync(artifactDir)) {
    const artifactDest = path.join(artifactDir, 'the-bike-yard-next16-prisma.zip');
    fs.writeFileSync(artifactDest, content);
    console.log(`Saved artifact zip to: ${artifactDest}`);
  }

  console.log('Production ZIP generation complete!');
}

generateDiskZip().catch((err) => {
  console.error('Failed to generate ZIP:', err);
  process.exit(1);
});

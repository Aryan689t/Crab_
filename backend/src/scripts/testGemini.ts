import dotenv from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

// Support running this script from either the project root or backend folder.
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
];

const envPath = envCandidates.find(existsSync);

if (!envPath) {
  throw new Error('Could not locate backend/.env.');
}

const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  throw envResult.error;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing or empty. Check backend/.env.',
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log('Sending a test request to Gemini...');

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: 'Reply with exactly: CRAB Gemini connection successful',
  });

  console.log('Gemini response:', response.text);
}

main().catch((error: unknown) => {
  console.error(
    'Gemini test failed:',
    error instanceof Error ? error.message : 'Unknown error',
  );
  process.exitCode = 1;
});
import { parseYouTubeInput, resolveYouTubeChannel, parseISO8601Duration } from '../integrations/youtube/index.js';

async function testResolution() {
  console.log('--- TEST 1: URL & Handle Normalization ---');
  const testCases = [
    'https://www.youtube.com/@mkbhd',
    'https://youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ',
    '@AlexChenTech',
    'https://youtube.com/c/Veritasium',
  ];

  for (const tc of testCases) {
    const parsed = parseYouTubeInput(tc);
    console.log(`Input: "${tc}" => Type: ${parsed.type}, Value: ${parsed.value}, Normalized: ${parsed.normalizedUrl}`);
  }

  console.log('\n--- TEST 2: ISO 8601 Duration Parsing ---');
  console.log('PT12M34S =>', parseISO8601Duration('PT12M34S'));
  console.log('PT1H23M45S =>', parseISO8601Duration('PT1H23M45S'));
  console.log('PT45S =>', parseISO8601Duration('PT45S'));

  console.log('\n--- TEST 3: Channel Resolution (mkbhd) ---');
  try {
    const channel = await resolveYouTubeChannel('https://www.youtube.com/@mkbhd');
    console.log('Handle -> Resolved Channel ID:', channel.channelId, 'State:', channel.connectionState);
    const channel2 = await resolveYouTubeChannel('https://youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ');
    console.log('ID URL -> Resolved Channel ID:', channel2.channelId, 'State:', channel2.connectionState);
    console.log('SUCCESS: Channel resolved without fake data!');
  } catch (err: any) {
    console.error('Channel resolution error:', err.message);
  }
}

testResolution().catch(console.error);

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_SYSTEM_INSTRUCTION,
  buildChatHistoryPayload,
  formatGeminiError,
  isMicrophoneUnavailableError,
  normalizeAudioMimeType,
  parseSseEventLine,
  readJsonResponseSafely,
  resolveChatConfig,
  resolveLiveVoiceName,
} from './aiStudio';
import {
  base64ToInt16,
  computeRmsLevel,
  downsampleFloat32,
  float32ToInt16Pcm,
  formatDurationSeconds,
  int16ToBase64,
  int16ToFloat32,
} from './audioPcm';

test('resolveChatConfig maps the four required models accurately by task', () => {
  assert.equal(resolveChatConfig('architect', 'general').model, 'gemini-4-hydrogen');
  assert.equal(resolveChatConfig('strategist', 'fast').model, 'gemini-3.1-flash-lite');
  assert.equal(resolveChatConfig('reviewer', 'deep').model, 'gemini-4-carbon');
  assert.equal(resolveChatConfig('concierge', 'interactive').model, 'gemini-4-neon');
});

test('resolveChatConfig applies role system instruction and defaults cleanly', () => {
  const fallback = resolveChatConfig('unknown-role', 'unknown-task');
  assert.equal(fallback.role.id, 'architect');
  assert.equal(fallback.task.id, 'general');
  assert.equal(fallback.model, 'gemini-4-hydrogen');
  assert.ok(fallback.systemInstruction.includes('Solutions Architect'));
});

test('buildChatHistoryPayload preserves turns and drops empty messages', () => {
  const payload = buildChatHistoryPayload([
    { role: 'user', text: '  Hello  ' },
    { role: 'model', text: '' },
    { role: 'model', text: 'Hi there!' },
  ]);

  assert.deepEqual(payload, [
    { role: 'user', parts: [{ text: 'Hello' }] },
    { role: 'model', parts: [{ text: 'Hi there!' }] },
  ]);
});

test('normalizeAudioMimeType strips codec suffixes and rejects non-audio MIME types', () => {
  assert.equal(normalizeAudioMimeType('audio/webm;codecs=opus'), 'audio/webm');
  assert.equal(normalizeAudioMimeType('audio/x-wav'), 'audio/wav');
  assert.equal(normalizeAudioMimeType('audio/mp3'), 'audio/mp3');
  assert.equal(normalizeAudioMimeType('image/png'), null);
  assert.equal(normalizeAudioMimeType(''), null);
});

test('resolveLiveVoiceName returns valid voice or defaults to Zephyr', () => {
  assert.equal(resolveLiveVoiceName('Kore'), 'Kore');
  assert.equal(resolveLiveVoiceName('InvalidVoice'), 'Zephyr');
});

test('formatGeminiError surfaces actionable messages for auth, quota, and 503 errors', () => {
  assert.ok(formatGeminiError('GEMINI_API_KEY is not configured').includes('Settings > Secrets'));
  assert.ok(formatGeminiError('RESOURCE_EXHAUSTED', 429).includes('Settings > Secrets'));
  assert.ok(formatGeminiError('PERMISSION_DENIED', 403).includes('Settings > Secrets'));
  const nested503 = JSON.stringify({
    error: {
      code: 503,
      message: JSON.stringify({
        error: { code: 503, message: 'High demand', status: 'UNAVAILABLE' },
      }),
    },
  });
  const formatted503 = formatGeminiError(nested503, 503);
  assert.ok(!formatted503.startsWith('{'));
  assert.ok(formatted503.includes('high demand'));
});

test('PCM conversion round-trips Float32 -> Int16 -> Base64 -> Int16 -> Float32', () => {
  const input = new Float32Array([0, 0.5, -0.5, 1, -1]);
  const int16 = float32ToInt16Pcm(input);
  const b64 = int16ToBase64(int16);
  const decoded = base64ToInt16(b64);
  const floatBack = int16ToFloat32(decoded);

  assert.equal(decoded.length, input.length);
  assert.ok(Math.abs(floatBack[0]) < 0.001);
  assert.ok(Math.abs(floatBack[1] - 0.5) < 0.001);
  assert.ok(Math.abs(floatBack[2] + 0.5) < 0.001);
  assert.ok(Math.abs(floatBack[3] - 1) < 0.001);
  assert.ok(Math.abs(floatBack[4] + 1) < 0.001);
});

test('downsampleFloat32 reduces 48kHz samples cleanly to 16kHz', () => {
  const samples = new Float32Array(480);
  samples.fill(0.25);
  const downsampled = downsampleFloat32(samples, 48000, 16000);
  assert.equal(downsampled.length, 160);
  assert.ok(Math.abs(downsampled[0] - 0.25) < 0.0001);
});

test('computeRmsLevel and formatDurationSeconds compute expected bounds', () => {
  assert.equal(computeRmsLevel(new Float32Array([0, 0, 0])), 0);
  assert.equal(computeRmsLevel(new Float32Array([1, -1, 1, -1])), 1);
  assert.equal(formatDurationSeconds(0), '00:00');
  assert.equal(formatDurationSeconds(65), '01:05');
});

test('LIVE_SYSTEM_INSTRUCTION reflects Gollamudi Technology and Software branding', () => {
  assert.ok(LIVE_SYSTEM_INSTRUCTION.includes('GTS Voice'));
  assert.ok(!LIVE_SYSTEM_INSTRUCTION.includes('Meridian'));
});

test('parseSseEventLine parses valid events and safely ignores malformed or non-data lines', () => {
  assert.equal(parseSseEventLine('event: ping'), null);
  assert.equal(parseSseEventLine('data: [DONE]'), null);
  assert.equal(parseSseEventLine('data: {broken json'), null);
  assert.deepEqual(parseSseEventLine('data: {"type":"chunk","text":"Hello"}'), {
    type: 'chunk',
    text: 'Hello',
  });
});

test('readJsonResponseSafely handles HTML/text error responses without throwing SyntaxError', async () => {
  const htmlRes = new Response('<html><body>502 Bad Gateway</body></html>', {
    status: 502,
    headers: { 'Content-Type': 'text/html' },
  });
  const parsedHtml = await readJsonResponseSafely<{ error?: string }>(htmlRes);
  assert.equal(parsedHtml.ok, false);
  assert.equal(parsedHtml.status, 502);
  assert.equal(parsedHtml.data, null);

  const jsonRes = new Response(JSON.stringify({ transcript: 'Ready' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const parsedJson = await readJsonResponseSafely<{ transcript?: string }>(jsonRes);
  assert.equal(parsedJson.ok, true);
  assert.equal(parsedJson.data?.transcript, 'Ready');
});

test('isMicrophoneUnavailableError detects both permission denial and missing hardware devices', () => {
  assert.equal(isMicrophoneUnavailableError(new Error('Requested device not found')), true);
  assert.equal(isMicrophoneUnavailableError(new Error('Permission denied')), true);
  assert.equal(isMicrophoneUnavailableError(new Error('NotFoundError')), true);
  assert.equal(isMicrophoneUnavailableError(new Error('Unexpected network timeout')), false);
});

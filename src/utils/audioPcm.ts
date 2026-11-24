export function downsampleFloat32(
  samples: Float32Array,
  inputSampleRate: number,
  targetSampleRate = 16000
): Float32Array {
  if (
    samples.length === 0 ||
    inputSampleRate <= 0 ||
    targetSampleRate <= 0 ||
    inputSampleRate === targetSampleRate
  ) {
    return samples;
  }

  if (inputSampleRate < targetSampleRate) {
    return samples;
  }

  const ratio = inputSampleRate / targetSampleRate;
  const newLength = Math.max(1, Math.round(samples.length / ratio));
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += samples[j];
      count++;
    }
    result[i] = count > 0 ? sum / count : samples[Math.min(start, samples.length - 1)];
  }

  return result;
}

export function float32ToInt16Pcm(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    output[i] = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  }
  return output;
}

export function int16ToFloat32(pcm: Int16Array): Float32Array {
  const output = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    output[i] = pcm[i] / (pcm[i] < 0 ? 0x8000 : 0x7fff);
  }
  return output;
}

export function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(bytes.length, i + chunkSize));
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function base64ToInt16(base64: string): Int16Array {
  if (!base64) return new Int16Array(0);
  const binary = atob(base64);
  const byteLength = binary.length - (binary.length % 2);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export function computeRmsLevel(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sumSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSquares += s * s;
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  return Math.min(1, Number((rms * 4).toFixed(3)));
}

export function formatDurationSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

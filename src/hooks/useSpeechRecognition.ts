import { useState, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  allAlternatives: string[];
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [allAlternatives, setAllAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setAllAlternatives([]);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = true;        // Keep listening for multiple attempts
    recognition.interimResults = true;    // Show real-time interim results
    recognition.maxAlternatives = 10;     // Get more alternative interpretations

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalResult = '';
      const alternatives: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        if (result.isFinal) {
          // Collect ALL alternatives from the final result
          for (let j = 0; j < result.length; j++) {
            const alt = result[j].transcript.toLowerCase().trim();
            if (alt) alternatives.push(alt);
          }
          finalResult = alternatives[0] || '';
        } else {
          // Interim (in-progress) result
          interim += result[0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim.toLowerCase().trim());
      }

      if (finalResult) {
        setTranscript(finalResult);
        setAllAlternatives(alternatives);
        setInterimTranscript('');
        // Don't stop - let the evaluator decide whether to continue
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are not critical errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    // Auto-stop after 8 seconds (longer for kids)
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
        setError('timeout');
      }
    }, 8000);

    try {
      recognition.start();
    } catch (_) {
      // Already started
    }
  }, [SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setAllAlternatives([]);
    setError(null);
  }, []);

  return {
    isListening, transcript, interimTranscript, allAlternatives,
    error, startListening, stopListening, isSupported, reset,
  };
}

// --- Enhanced matching utilities ---

// Levenshtein distance for near-miss tolerance
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Phonetic similarity: common sound confusions (especially for kids)
const PHONETIC_MAP: Record<string, string> = {
  ph: 'f', gh: 'f', ght: 't',
  ck: 'k', ch: 'k', c: 'k', q: 'k',
  x: 'ks', wh: 'w',
  kn: 'n', wr: 'r', gn: 'n',
  th: 'd', dh: 'd',
  sh: 's', zh: 'z',
  ee: 'i', ea: 'i', ey: 'i',
  oo: 'u', ou: 'u',
  ai: 'a', ay: 'a', ei: 'a',
  ow: 'o', oa: 'o',
};

function toPhonetic(word: string): string {
  let result = word.toLowerCase();
  // Apply phonetic substitutions (longest match first)
  const sorted = Object.entries(PHONETIC_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sorted) {
    result = result.split(from).join(to);
  }
  // Remove double letters
  result = result.replace(/(.)\1+/g, '$1');
  return result;
}

/**
 * Enhanced word matching: checks if ANY of the STT alternatives
 * match the target word using multiple strategies.
 *
 * Returns { matched: boolean, bestMatch: string }
 */
export function matchWord(
  target: string,
  alternatives: string[],
  transcript: string
): { matched: boolean; bestMatch: string } {
  const targetLower = target.toLowerCase().trim();
  const targetPhonetic = toPhonetic(targetLower);
  const maxDist = targetLower.length <= 3 ? 1 : targetLower.length <= 5 ? 2 : 3;

  // Candidates: all alternatives + the primary transcript + words extracted from alternatives
  const candidates = new Set<string>();
  candidates.add(transcript.toLowerCase().trim());
  for (const alt of alternatives) {
    const a = alt.toLowerCase().trim();
    candidates.add(a);
    // Also try individual words within the alternative
    a.split(/\s+/).forEach(w => candidates.add(w));
  }

  let bestScore = Infinity;
  let bestMatch = '';

  const candidateArray = Array.from(candidates);
  for (const candidate of candidateArray) {
    if (!candidate) continue;

    // 1. Exact match
    if (candidate === targetLower) {
      return { matched: true, bestMatch: candidate };
    }

    // 2. Contains target word
    if (candidate.includes(targetLower)) {
      return { matched: true, bestMatch: candidate };
    }

    // 3. Target contains candidate (e.g. said "cat" but target is "cat")
    if (targetLower.includes(candidate) && candidate.length >= targetLower.length - 1) {
      return { matched: true, bestMatch: candidate };
    }

    // 4. Levenshtein distance
    const dist = levenshteinDistance(candidate, targetLower);
    if (dist <= maxDist && dist < bestScore) {
      bestScore = dist;
      bestMatch = candidate;
    }

    // 5. Phonetic matching
    const candidatePhonetic = toPhonetic(candidate);
    if (candidatePhonetic === targetPhonetic) {
      return { matched: true, bestMatch: candidate };
    }
    const phoneticDist = levenshteinDistance(candidatePhonetic, targetPhonetic);
    if (phoneticDist <= 1 && phoneticDist < bestScore) {
      bestScore = phoneticDist;
      bestMatch = candidate;
    }

    // 6. Starts-with for longer words (said beginning correctly)
    if (targetLower.length >= 4 && candidate.length >= 3) {
      if (targetLower.startsWith(candidate.substring(0, 3)) ||
          candidate.startsWith(targetLower.substring(0, 3))) {
        const partialDist = levenshteinDistance(candidate, targetLower);
        if (partialDist <= maxDist && partialDist < bestScore) {
          bestScore = partialDist;
          bestMatch = candidate;
        }
      }
    }
  }

  if (bestScore <= maxDist) {
    return { matched: true, bestMatch };
  }

  // Return best attempt even if not matched
  return { matched: false, bestMatch: bestMatch || transcript.toLowerCase().trim() };
}

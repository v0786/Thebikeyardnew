import { getWhatsappConfig } from './config';
import { knowledgePromptBlock } from './knowledge';
import { boundReply, fallbackReply, policySystemPrompt } from './policy';
import { safeLogError } from './security';

export interface AiTurn {
  role: 'user' | 'assistant';
  text: string;
}

export async function generateAssistantReply(params: {
  userText: string;
  history: AiTurn[];
  languageHint: 'en' | 'hi' | 'hinglish';
}): Promise<string> {
  const cfg = getWhatsappConfig();
  const boundedHistory = params.history.slice(-8).map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.text.slice(0, 500) }],
  }));

  const system = `${policySystemPrompt()}\n\n${knowledgePromptBlock()}\n\nCustomer language hint: ${params.languageHint}.`;

  try {
    if (cfg.aiProvider === 'gemini' && cfg.geminiApiKey) {
      const text = await generateGemini({
        apiKey: cfg.geminiApiKey,
        model: cfg.aiModel,
        system,
        history: boundedHistory,
        userText: params.userText.slice(0, 1000),
        timeoutMs: cfg.aiTimeoutMs,
      });
      if (text) return boundReply(text);
    }
  } catch (err) {
    safeLogError({ event: 'ai_failed', name: err instanceof Error ? err.name : 'Error' });
  }

  return fallbackReply();
}

async function generateGemini(params: {
  apiKey: string;
  model: string;
  system: string;
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
  userText: string;
  timeoutMs: number;
}): Promise<string | null> {
  const model = params.model.replace(/^models\//, '') || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': params.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.system }] },
        contents: [...params.history, { role: 'user', parts: [{ text: params.userText }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')?.trim();
    return text || null;
  } finally {
    clearTimeout(timeout);
  }
}

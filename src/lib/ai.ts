// src/lib/ai.ts

/**
 * getAICompletion({ messages, model, provider, ... })
 * provider: 'openrouter' | 'groq' (default: 'openrouter')
 * model: defaults to OpenRouter's default model if not specified
 */

const DEFAULT_MODEL = "deepseek/deepseek-r1-0528-qwen3-8b:free";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function getAICompletion({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  max_tokens = 512,
  provider = 'openrouter',
}: {
  messages: { role: string; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  provider?: 'openrouter' | 'groq';
}): Promise<string> {
  if (provider === 'groq') {
    if (!GROQ_API_KEY) throw new Error('Missing GROQ API key');
    const headers = {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      })),
      temperature,
      max_tokens,
    });
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(
        errorData.error?.message || `Groq API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } else {
    if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');
    const headers = {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Founder Launch Pilot',
    };
    const body = JSON.stringify({
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      })),
      temperature,
      max_tokens,
    });
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      throw new Error(
        errorData.error?.message || `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}


// });

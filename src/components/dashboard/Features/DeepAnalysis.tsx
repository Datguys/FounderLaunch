import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import { DeepAnalysisReport } from './DeepAnalysisReport';

interface IdeaResult {
  title: string;
  description: string;
  investment: string;
  timeframe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Util for caching analysis in localStorage
function getCachedAnalysis(ideaTitle: string): string | null {
  return localStorage.getItem(`deep_analysis_${ideaTitle}`);
}
function setCachedAnalysis(ideaTitle: string, analysis: string) {
  localStorage.setItem(`deep_analysis_${ideaTitle}`, analysis);
}

// Utility to robustly render any field
function renderField(value: any, fallback: string) {
  if (value == null || value === '') return <div className="text-base text-foreground leading-relaxed whitespace-pre-line">{fallback}</div>;
  if (typeof value === 'string' || typeof value === 'number') return <div className="text-base text-foreground leading-relaxed whitespace-pre-line">{value}</div>;
  // For arrays/objects, render as formatted JSON
  return <pre className="text-base text-foreground leading-relaxed whitespace-pre-line bg-muted/30 rounded p-2 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
}

export default function DeepAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting state: { idea: IdeaResult }
  const idea: IdeaResult | undefined = location.state?.idea;
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dotStep, setDotStep] = useState(0); // For animated dots
  const [rawOutput, setRawOutput] = useState<string | null>(null); // For debugging raw AI output
  const dotFrames = ['.', '..', '...'];

  // Animate loading dots
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDotStep((prev) => (prev + 1) % dotFrames.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!idea) return;
    const cached = getCachedAnalysis(idea.title);
    if (cached) {
      try {
        setAnalysis(JSON.parse(cached));
        return;
      } catch {
        // fallback to refetch if cache is corrupted
      }
    }
    setIsLoading(true);
    (async () => {
      try {
        const { getAICompletion } = await import('@/lib/ai');
        const prompt = `
You are an AI business analyst.

Your ONLY task is to output a valid JSON object. You MUST return only a pure, strict JSON object without any markdown, formatting, commentary, or extra text. No headings. No code fences. No explanations. No intro. No wrapping. No quotes around the entire object. No \`\`\`. No text before or after the JSON. No exceptions.

If you cannot fill a value, use an empty string ("") or empty array ([]). Use correct syntax. Use double quotes for all keys and string values. Do not include comments.

The following is a business idea to analyze:

Title: ${idea.title}  
Description: ${idea.description}  
Investment: ${idea.investment}  
Timeframe: ${idea.timeframe}  
Difficulty: ${idea.difficulty}

Your output MUST follow this JSON structure:

{
  "opportunity": "Summary paragraph",
  "pros": ["Pro 1", "Pro 2"],
  "cons": ["Con 1", "Con 2"],
  "budget": {
    "breakdown": [
      { "category": "Software", "amount": 500, "type": "One-time" },
      { "category": "Legal", "amount": 300, "type": "One-time" },
      { "category": "Contingency", "amount": 200, "type": "Buffer" }
    ],
    "total": ${idea.investment}
  },
  "billOfMaterials": [
    { "item": "Tool name", "purpose": "What it does", "cost": 99, "type": "Monthly" }
  ],
  "timeline": [
    { "weekRange": "Week 1–2", "milestone": "Planning", "summary": "Define strategy" },
    { "weekRange": "Week 3–4", "milestone": "Prototype", "summary": "Build MVP" }
  ],
  "market": {
    "audience": "Target market",
    "size": "Market size in dollars",
    "location": "Local / National / Global",
    "competitors": [
      { "name": "Competitor", "description": "Their product", "strength": "Advantage", "weakness": "Flaw" }
    ],
    "differentiation": "How this idea stands out"
  },
  "forecast": {
    "customerValue": 20,
    "monthlyBurn": 1000,
    "breakEvenMonth": "Month 6",
    "12MonthProjection": [
      { "month": "Month 1", "revenue": 0, "expenses": 1000, "profitLoss": -1000 },
      { "month": "Month 2", "revenue": 200, "expenses": 1000, "profitLoss": -800 }
    ]
  },
  "marketing": {
    "freeChannels": ["Reddit", "TikTok"],
    "paidChannels": ["Meta Ads", "Google Ads"],
    "retention": ["Email", "Referral"]
  },
  "legal": {
    "businessRegistration": "Details",
    "taxObligations": "Details",
    "privacy": "Data concerns",
    "other": "IP, contracts"
  },
  "recommendations": [
    "Start with...", "Avoid...", "Double your success by..."
  ]
}

REMINDER: Output ONLY the raw JSON object. No intro. No \`\`\`. No text. No notes.
`;


        const aiResponse = await getAICompletion({
          messages: [
            { role: 'system', content: 'You are a business analyst assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 5000,
          model: 'deepseek/deepseek-r1:free',
          provider: 'openrouter',
        });
        // Robust fallback parser for extracting JSON
        function extractJSON(str: string): any | null {
          try {
            str = str.replace(/```json|```/g, '').trim();
            const match = str.match(/{[\s\S]*}/);
            if (match) return JSON.parse(match[0]);
            return JSON.parse(str);
          } catch {
            return null;
          }
        }
        let parsed = null;
        if (typeof aiResponse === 'string') {
          parsed = extractJSON(aiResponse);
        } else {
          parsed = aiResponse;
        }
        if (!parsed) {
          setRawOutput(aiResponse);
          setError('AI did not return valid JSON. Try again or retry below.');
          setIsLoading(false);
          return;
        }
        // Map alternate field names for backwards compatibility
        if (parsed.billOfMaterials && !parsed.bom) parsed.bom = parsed.billOfMaterials;
        if (parsed.legalCompliance && !parsed.legal) parsed.legal = parsed.legalCompliance;
        if (parsed.strategicRecommendations && !parsed.recommendations) parsed.recommendations = parsed.strategicRecommendations;
        setCachedAnalysis(idea.title, JSON.stringify(parsed));
        setAnalysis(parsed);
        setRawOutput(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to analyze. Try again.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [idea]);

  if (!idea) {
    return (
      <div className="p-8">
        <div className="mb-4">No idea selected for analysis.</div>
        <Button onClick={() => navigate('/dashboard')}>Go Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="flex items-center justify-between p-6 border-b bg-background/80 shadow-sm">
        <Button variant="outline" onClick={() => navigate(-1)}>
          &larr; Go Back to Dashboard
        </Button>
        <Button variant="primary" className="flex items-center gap-2">
          <Bookmark className="w-4 h-4" /> Save
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center p-8 gap-8 overflow-auto">
        {idea && (
          <>
            <div className="w-full max-w-3xl text-center mb-4">
              <h1 className="text-3xl font-extrabold mb-2 text-primary drop-shadow-lg">{idea.title}</h1>
              <div className="text-lg text-muted-foreground mb-2">{idea.description}</div>
              <div className="flex flex-wrap justify-center gap-4 text-base mb-6">
                <span><b>Investment:</b> {idea.investment}</span>
                <span><b>Timeframe:</b> {idea.timeframe}</span>
                <span><b>Difficulty:</b> {idea.difficulty}</span>
              </div>
            </div>
            <div className="w-full max-w-3xl flex flex-col items-center">
              {isLoading && (
                <div className="text-xl font-semibold text-primary animate-pulse mb-4">
                  Creating analysis for <span className="font-bold">{idea.title}</span>{' '}
                  <span className="inline-block w-8 text-center">{dotFrames[dotStep]}</span>
                </div>
              )}
              {error && (
                <div className="text-center text-red-600">
                  {error}
                  {rawOutput && (
                    <details className="mt-2 bg-background/60 border border-red-400 rounded p-2 text-xs text-left">
                      <summary className="cursor-pointer text-red-700">Show Raw AI Output</summary>
                      <pre className="whitespace-pre-wrap break-all text-foreground/80">{typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2)}</pre>
                    </details>
                  )}
                  <button
                    className="mt-3 px-4 py-2 rounded bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {analysis && (
                <div className="flex flex-col gap-8">
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-4xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Summary of Business</h2>
                    <div className="text-lg whitespace-pre-line text-foreground leading-relaxed">{analysis.opportunity || 'No summary provided.'}</div>
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Pros and Cons</h2>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="font-semibold text-2xl mb-2 text-green-700 dark:text-green-400 tracking-tight">Pros</h3>
                        <ul className="list-disc pl-6">
                          {(analysis.pros || []).map((p: string, i: number) => <li key={i} className="text-base text-foreground leading-relaxed">{p}</li>)}
                        </ul>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-2xl mb-2 text-red-700 dark:text-red-400 tracking-tight">Cons</h3>
                        <ul className="list-disc pl-6">
                          {(analysis.cons || []).map((c: string, i: number) => <li key={i} className="text-base text-foreground leading-relaxed">{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Budget Breakdown</h2>
                    {renderField(analysis.budget, 'No budget breakdown provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Bill of Materials (BOM)</h2>
                    {renderField(analysis.bom, 'No BOM provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Timeline</h2>
                    {renderField(analysis.timeline, 'No timeline provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Market Analysis</h2>
                    {renderField(analysis.market, 'No market analysis provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Financial Forecast (12 Months)</h2>
                    {renderField(analysis.forecast, 'No forecast provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Marketing Strategy</h2>
                    {renderField(analysis.marketing, 'No marketing strategy provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Legal & Compliance</h2>
                    {renderField(analysis.legal, 'No legal info provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Competitor Benchmarking</h2>
                    {renderField(analysis.competitors, 'No competitors provided.')}
                  </div>
                  <div className="rounded-2xl shadow-lg bg-glass-background border border-primary/10 p-6">
                    <h2 className="text-3xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-lg">Strategic Recommendations</h2>
                    {renderField(analysis.recommendations, 'No recommendations provided.')}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {!idea && (
          <div className="text-center text-lg text-muted-foreground">No idea selected for analysis.</div>
        )}
      </div>
    </div>
  );
}

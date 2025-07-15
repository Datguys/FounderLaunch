import React, { useState, useEffect } from 'react';
import { useProjects } from './YourProject';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Sparkles, Info, Bookmark, Search, Loader2 } from 'lucide-react';



interface IdeaResult {
  title: string;
  description: string;
  investment: string;
  timeframe: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

import { useNavigate } from 'react-router-dom';

export function IdeaGenerator(props: { onSectionChange?: (section: string) => void }) {
  const navigate = useNavigate();
  const onSectionChange = props.onSectionChange || (() => {});
  const { addProject } = useProjects();
  const [formData, setFormData] = useState({
    budget: "",
    timeAvailability: "",
    skills: "",
    interests: "",
    location: "",
    additionalInfo: ""
  });


  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [aiIdeas, setAiIdeas] = useState<IdeaResult[]>([]);
  const [savedIdeaIds, setSavedIdeaIds] = useState<string[]>([]);
  // Analysis state per idea title
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<{ [title: string]: boolean }>({});
  const [analysis, setAnalysis] = useState<{ [title: string]: string }>({});
  const [analysisError, setAnalysisError] = useState<{ [title: string]: string | null }>({});

  // Fallback mock analysis if AI fails
  function mockAnalysis(idea: IdeaResult): string {
    return `
      <h3>Pros and Cons</h3>
      <ul><li><b>Pros:</b> Innovative, scalable, fits your budget.</li><li><b>Cons:</b> Market competition, requires technical expertise.</li></ul>
      <h3>Estimated Startup Budget</h3>
      <ul><li>Development: $3,000</li><li>Marketing: $1,500</li><li>Operations: $500</li></ul>
      <h3>Bill of Materials</h3>
      <ul><li>Cloud Hosting: $500</li><li>AI API: $1,000</li><li>Website: $1,000</li></ul>
      <h3>Timeline</h3>
      <ul><li>Month 1: MVP Build</li><li>Month 2: Beta Launch</li><li>Month 3: Marketing</li></ul>
      <h3>Market Analysis</h3>
      <ul><li>Market size: $1B+</li><li>Competitors: ExampleCo, StartupX</li></ul>
      <h3>Financial Forecast</h3>
      <ul><li>Year 1 Revenue: $20,000</li><li>Break-even: 8 months</li></ul>
      <h3>Marketing Strategy</h3>
      <ul><li>SEO, Social Media, Influencer Outreach</li></ul>
      <h3>Legal & Compliance</h3>
      <ul><li>LLC Registration, Privacy Policy</li></ul>
      <h3>Competitor Benchmarking</h3>
      <ul><li>Better pricing, more features than StartupX</li></ul>
    `;
  }

  // Render markdown to HTML (simple)
  function markdownToHtml(md: string): string {
    // Very basic conversion for demo; for production use a real markdown parser
    return md
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/^\* (.*)$/gm, '<li>$1</li>')
      .replace(/^\- (.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }

  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setShowResults(false);
    setAiIdeas([]);
    setError(null);
    const cacheKey = `ideas-${JSON.stringify(formData)}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAiIdeas(JSON.parse(cached));
      setShowResults(true);
      setIsLoading(false);
      return;
    }
    let retries = 0;
    const maxRetries = 2;
    const FALLBACK_MODELS = [
      'mistralai/mistral-7b-instruct:free',
      'huggingfaceh4/zephyr-7b-beta:free',
      'openchat/openchat-7b:free'
    ];
    let currentModelIndex = 0;
    const prompt = `
    You are a strict business startup idea AI. Your task is to generate exactly 3 realistic, unsaturated, and budget-appropriate business ideas for a user. Each idea must solve a real, specific problem faced by people in the user's area or niche.
    
    ⛔ Do NOT include generic, overused, or saturated ideas like dropshipping, print-on-demand, crypto, or affiliate blogs.
    
    📌 All ideas must be feasible within the user's actual budget, time availability, and skills. Never exceed the budget — keep total costs under it.
    
    Return a valid JSON array with 3 objects, each including:
    - "title" (string): short business name
    - "description" (string): a 2–3 sentence overview that explains what it does, what problem it solves, and who it's for
    - "investment" (string): total cost under the user’s budget (e.g., "$1,500")
    - "timeframe" (string): time needed to launch (e.g., "3 months")
    - "difficulty" (string): one of "Easy", "Medium", or "Hard"
    
    User Profile:
    - Budget: ${formData.budget || 'Not specified'}
    - Time Availability: ${formData.timeAvailability || 'Not specified'}
    - Skills: ${formData.skills || 'Not specified'}
    - Interests: ${formData.interests || 'Not specified'}
    - Location: ${formData.location || 'Not specified'}
    - Additional Info: ${formData.additionalInfo || 'Not specified'}
    
    Return ONLY the JSON array. Do not include any explanation, headings, or additional text.
    Example format:
    [
      {
        "title": "Affordable Pet Portraits",
        "description": "A local service offering hand-drawn or digitally illustrated pet portraits targeted to pet lovers. Solves the problem of expensive artwork for animal owners.",
        "investment": "$900",
        "timeframe": "1 month",
        "difficulty": "Easy"
      },
      ...
    ]
    `;
    const attemptGeneration = async (): Promise<IdeaResult[]> => {
      try {
        const { getAICompletion } = await import('@/lib/ai');
        const aiResponse = await getAICompletion({
          messages: [
            { role: 'system', content: 'Generate business ideas as JSON' },
            { role: 'user', content: prompt }
          ],
          model: FALLBACK_MODELS[currentModelIndex],
          temperature: 0.7,
          max_tokens: 1000
        });
        // Improved JSON parsing
        const jsonString = aiResponse.replace(/^[^{\[]*([\[{])/, '$1');
        return JSON.parse(jsonString);
      } catch (error: any) {
        if (retries < maxRetries) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return attemptGeneration();
        }
        throw error;
      }
    };
    const tryModels = async (): Promise<IdeaResult[]> => {
      try {
        return await attemptGeneration();
      } catch (error) {
        if (currentModelIndex < FALLBACK_MODELS.length - 1) {
          currentModelIndex++;
          retries = 0;
          return tryModels();
        }
        throw error;
      }
    };
    try {
      const ideas = await tryModels();
      setAiIdeas(Array.isArray(ideas) ? ideas : []);
      setShowResults(true);
      localStorage.setItem(cacheKey, JSON.stringify(ideas));
    } catch (err: any) {
      setError(err?.message || 'Failed to generate ideas. Please try again later.');
      // Fallback: 3 mock ideas if AI fails
      setAiIdeas([
        {
          title: 'Remote Team Collaboration App',
          description: 'A platform for distributed teams to manage projects, chat, and share files securely.',
          investment: '$2,000',
          timeframe: '2 months',
          difficulty: 'Medium'
        },
        {
          title: 'Healthy Meal Prep Service',
          description: 'Subscription-based healthy meal kits delivered weekly, tailored to dietary needs.',
          investment: '$5,000',
          timeframe: '3 months',
          difficulty: 'Easy'
        },
        {
          title: 'Eco-Friendly Packaging Startup',
          description: 'Manufacture and sell biodegradable packaging to small businesses and e-commerce stores.',
          investment: '$8,000',
          timeframe: '4 months',
          difficulty: 'Hard'
        }
      ]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

// Removed legacy state and duplicate handleGenerate. Only new implementation remains.

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Error UI */}
        {error && (
          <Card className="p-4 border-red-500 bg-red-50">
            <div className="text-red-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => { setError(null); setShowResults(false); setAiIdeas([]); }}
            >
              Try Again
            </Button>
          </Card>
        )}


        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <Lightbulb className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Generate Your Perfect Business
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions and get 3 personalized business ideas tailored to your skills and budget
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-4 glass border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">AI-Powered Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Using advanced algorithms to analyze market trends, competition, and realistic timelines for your specific situation.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 glass-card">
          <div className="space-y-6">
            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-foreground font-medium">Budget Range</Label>
              <Input
                id="budget"
                placeholder="e.g. $5,000 - $15,000, Under $1,000, $50,000+"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>

            {/* Time Availability */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground font-medium">Time Availability</Label>
              <Input
                id="time"
                placeholder="e.g. Part-time 10 hours/week, Full-time, Weekends only"
                value={formData.timeAvailability}
                onChange={(e) => setFormData({...formData, timeAvailability: e.target.value})}
              />
            </div>

            {/* Skills & Experience */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-foreground font-medium">Skills & Experience</Label>
              <Textarea
                id="skills"
                placeholder="Describe your professional skills, experience, and expertise..."
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Interests & Passions */}
            <div className="space-y-2">
              <Label htmlFor="interests" className="text-foreground font-medium">Interests & Passions</Label>
              <Textarea
                id="interests"
                placeholder="What are you passionate about? What industries interest you?"
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
              <Input
                id="location"
                placeholder="Where are you located? (e.g. Canada, USA, Europe, Asia)"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-2">
              <Label htmlFor="additional" className="text-foreground font-medium">Additional Information</Label>
              <Textarea
                id="additional"
                placeholder="Any additional details? Do you already have an idea in mind? Specific target audience? Other preferences?"
                value={formData.additionalInfo}
                onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Button 
          variant="primary"
          size="lg"
          className="w-full glow-primary"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate My Business Ideas
              <span className="ml-2 text-sm opacity-75">(3 options left)</span>
            </>
          )}
        </Button>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6 mt-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Personalized Business Ideas</h2>
              <p className="text-muted-foreground">Based on your preferences and market analysis</p>
            </div>

            <div className="space-y-6">
              {aiIdeas.map((idea, index) => (
                <Card key={index} className="p-6 glass-card hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{idea.title}</h3>
                    </div>
                    <Badge 
                      variant={
                        idea.difficulty === "Easy" ? "default" :
                        idea.difficulty === "Medium" ? "secondary" : "destructive"
                      }
                    >
                      {idea.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {idea.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Investment Range</p>
                      <p className="font-semibold text-foreground">{idea.investment}</p>
                    </div>
                    <div className="glass p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Time to Launch</p>
                      <p className="font-semibold text-foreground">{idea.timeframe}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => {
                        navigate('/deep-analysis', { state: { idea } });
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Deeper Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      disabled={savedIdeaIds.includes(idea.title)}
                      onClick={() => {
                        // Map idea to Project
                        const newProject = {
                          id: `${idea.title}-${Date.now()}`,
                          name: idea.title,
                          description: idea.description,
                          status: "Planning" as const,
                          progress: 0,
                          budget: { allocated: 0, spent: 0, remaining: 0 },
                          timeline: { startDate: '', endDate: '', daysRemaining: 0 },
                          analytics: { revenue: 0, customers: 0, growth: 0 },
                          category: "AI Generated"
                        };
                        addProject(newProject);
                        setSavedIdeaIds([...savedIdeaIds, idea.title]);
                        // Optionally show a toast or feedback
                      }}
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save Idea
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

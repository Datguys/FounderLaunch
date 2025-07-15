import { useState, useEffect } from "react";
import { useProjects } from "./YourProject";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  ArrowLeft,
  Info,
  DollarSign,
  TrendingUp,
  PieChart,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface BudgetPlannerProps {
  onSectionChange: (section: string) => void;
}

interface BudgetItem {
  category: string;
  amount: number;
  type: "startup" | "monthly" | "yearly";
}

export function BudgetPlanner({ onSectionChange }: BudgetPlannerProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showChooseModal, setShowChooseModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [formData, setFormData] = useState({
    businessType: "",
    expectedRevenue: "",
    timeframe: "",
    location: "",
    teamSize: ""
  });

  // Effect: If a project is selected, prefill formData
  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        setFormData({
          businessType: proj.category || "",
          expectedRevenue: proj.analytics?.revenue ? `$${proj.analytics.revenue}` : "",
          timeframe: proj.timeline ? `${proj.timeline.endDate}` : "",
          location: proj.category || "",
          teamSize: "" // Not available in Project
        });
      }
    }
  }, [selectedProjectId, projects]);

  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [aiBudgetData, setAiBudgetData] = useState<BudgetItem[]>([]);
  const [startupCosts, setStartupCosts] = useState(0);
  const [monthlyCosts, setMonthlyCosts] = useState(0);
  const [yearlyCosts, setYearlyCosts] = useState(0);

  const handleGenerate = async () => {
    setIsLoading(true);
    setShowResults(false);
    setAiBudgetData([]);
    setStartupCosts(0);
    setMonthlyCosts(0);
    setYearlyCosts(0);
    try {
      const { getAICompletion } = await import('@/lib/ai');
      const prompt = `Generate a realistic business budget breakdown as a JSON array of objects with these fields: category, amount (number), type (startup|monthly|yearly). Use the following info:\n- Business Type: ${formData.businessType}\n- Expected Revenue: ${formData.expectedRevenue}\n- Launch Timeframe: ${formData.timeframe}\n- Location: ${formData.location}\n- Team Size: ${formData.teamSize}\nRespond ONLY with the JSON array, no explanation.`;
      const aiResponse = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful startup budget planner.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 700
      });
      let budgetData: BudgetItem[] = [];
      try {
        budgetData = JSON.parse(aiResponse);
      } catch (e) {
        const match = aiResponse.match(/\[.*\]/s);
        if (match) budgetData = JSON.parse(match[0]);
      }
      setAiBudgetData(Array.isArray(budgetData) ? budgetData : []);
      setStartupCosts(budgetData.filter(item => item.type === "startup").reduce((sum, item) => sum + item.amount, 0));
      setMonthlyCosts(budgetData.filter(item => item.type === "monthly").reduce((sum, item) => sum + item.amount, 0));
      setYearlyCosts(budgetData.filter(item => item.type === "yearly").reduce((sum, item) => sum + item.amount, 0));
      setShowResults(true);
    } catch (err) {
      // Fallback: 3 mock budget items if AI fails
      const mockBudget: BudgetItem[] = [
        { category: 'Product Development', amount: 4000, type: 'startup' as const },
        { category: 'Marketing', amount: 600, type: 'monthly' as const },
        { category: 'Cloud Hosting', amount: 120, type: 'monthly' as const }
      ];
      setAiBudgetData(mockBudget);
      setStartupCosts(mockBudget.filter(i => i.type === 'startup').reduce((sum, i) => sum + i.amount, 0));
      setMonthlyCosts(mockBudget.filter(i => i.type === 'monthly').reduce((sum, i) => sum + i.amount, 0));
      setYearlyCosts(mockBudget.filter(i => i.type === 'yearly').reduce((sum, i) => sum + i.amount, 0));
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Project selection UI */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="font-medium">Start with:</span>
            <select
              className="glass rounded px-3 py-2 border border-border"
              value={selectedProjectId || ""}
              onChange={e => {
                const val = e.target.value;
                if (val) setSelectedProjectId(val);
                else setSelectedProjectId(null);
              }}
            >
              <option value="">Fill in your own info</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Modal to choose between loaded and new info, if both present */}
        {showChooseModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-background p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-lg font-bold mb-4">Choose Data Source</h2>
              <p className="mb-4">You have both a loaded project and new form data. Which would you like to use?</p>
              <div className="flex gap-4 justify-end">
                <Button onClick={() => {
                  setShowChooseModal(false);
                  setSelectedProjectId(null);
                  if (pendingFormData) setFormData(pendingFormData);
                }}>Use New Info</Button>
                <Button variant="secondary" onClick={() => {
                  setShowChooseModal(false);
                  // keep selectedProjectId, prefill formData
                  if (selectedProjectId) {
                    const proj = projects.find(p => p.id === selectedProjectId);
                    if (proj) {
                      setFormData({
                        businessType: proj.category || "",
                        expectedRevenue: proj.analytics?.revenue ? `$${proj.analytics.revenue}` : "",
                        timeframe: proj.timeline ? `${proj.timeline.endDate}` : "",
                        location: proj.category || "",
                        teamSize: ""
                      });
                    }
                  }
                }}>Use Saved Project</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Smart Budget Planner
          </h1>
          <p className="text-muted-foreground">
            Get automatic cost calculations and profit margin estimates for your business
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-4 glass border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">AI-Powered Budgeting</h4>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms analyze industry standards and location-based costs to create realistic budget projections.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 glass-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-type" className="text-foreground font-medium">Business Type</Label>
              <Input
                id="business-type"
                placeholder="e.g. E-commerce store, SaaS platform, Local service"
                value={formData.businessType}
                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue" className="text-foreground font-medium">Expected Monthly Revenue (Year 1)</Label>
              <Input
                id="revenue"
                placeholder="e.g. $5,000, $25,000, $100,000"
                value={formData.expectedRevenue}
                onChange={(e) => setFormData({...formData, expectedRevenue: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe" className="text-foreground font-medium">Launch Timeframe</Label>
              <Input
                id="timeframe"
                placeholder="e.g. 3 months, 6 months, 1 year"
                value={formData.timeframe}
                onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
              <Input
                id="location"
                placeholder="e.g. New York, Toronto, Remote"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-size" className="text-foreground font-medium">Expected Team Size</Label>
              <Input
                id="team-size"
                placeholder="e.g. Just me, 2-3 people, 5-10 employees"
                value={formData.teamSize}
                onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
              />
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Button 
          variant="default"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Calculating Budget...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5 mr-2" />
              Generate Budget Plan
            </>
          )}
        </Button>

        {/* Results */}
        {showResults && (
          <div className="space-y-6 mt-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Budget Breakdown</h2>
              <p className="text-muted-foreground">Customized for your business type and goals</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 glass-card">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Startup Costs</span>
                </div>
                <p className="text-2xl font-bold text-foreground">${startupCosts.toLocaleString()}</p>
              </Card>
              <Card className="p-4 glass-card">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Monthly Costs</span>
                </div>
                <p className="text-2xl font-bold text-foreground">${monthlyCosts.toLocaleString()}</p>
              </Card>
              <Card className="p-4 glass-card">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="w-5 h-5 text-warning" />
                  <span className="text-sm text-muted-foreground">Yearly Costs</span>
                </div>
                <p className="text-2xl font-bold text-foreground">${yearlyCosts.toLocaleString()}</p>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="p-6 glass-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Detailed Cost Breakdown</h3>
              <div className="space-y-4">
                {aiBudgetData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.category}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.type} expense</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${item.amount.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 glass-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Budget Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Emergency Fund</p>
                    <p className="text-sm text-muted-foreground">Keep 3-6 months of operating expenses as buffer (~${(monthlyCosts * 4).toLocaleString()})</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Break-even Analysis</p>
                    <p className="text-sm text-muted-foreground">You'll need ${monthlyCosts.toLocaleString()}/month in revenue to break even</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Growth Planning</p>
                    <p className="text-sm text-muted-foreground">Budget 15-20% of revenue for marketing and expansion</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
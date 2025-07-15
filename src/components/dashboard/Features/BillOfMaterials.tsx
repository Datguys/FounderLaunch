import { useState, useEffect } from "react";
import { useProjects } from "./YourProject";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  ArrowLeft,
  Info,
  Package,
  Truck,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface BillOfMaterialsProps {
  onSectionChange: (section: string) => void;
}

interface MaterialItem {
  category: string;
  items: {
    name: string;
    quantity: string;
    supplier: string;
    cost: string;
    lead_time: string;
    priority: "High" | "Medium" | "Low";
  }[];
}

export function BillOfMaterials({ onSectionChange }: BillOfMaterialsProps) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showChooseModal, setShowChooseModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [formData, setFormData] = useState({
    productType: "",
    productionVolume: "",
    qualityLevel: "",
    budget: "",
    timeline: "",
    specialRequirements: ""
  });

  // Effect: If a project is selected, prefill formData
  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId);
      if (proj) {
        setFormData({
          productType: proj.category || "",
          productionVolume: "", // Not available in Project
          qualityLevel: "", // Not available in Project
          budget: proj.budget.allocated ? `$${proj.budget.allocated}` : "",
          timeline: proj.timeline ? `${proj.timeline.endDate}` : "",
          specialRequirements: proj.description || ""
        });
      }
    }
  }, [selectedProjectId, projects]);

  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [aiMaterials, setAiMaterials] = useState<MaterialItem[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setShowResults(false);
    setAiMaterials([]);
    try {
      const { getAICompletion } = await import('@/lib/ai');
      const prompt = `Generate a detailed bill of materials (BOM) for a new product as a JSON array of objects. Each object should have: category (string), items (array of objects with fields: name, quantity, supplier, cost, lead_time, priority [High|Medium|Low]). Use the following info:\n- Product Type: ${formData.productType}\n- Production Volume: ${formData.productionVolume}\n- Quality Level: ${formData.qualityLevel}\n- Budget: ${formData.budget}\n- Timeline: ${formData.timeline}\n- Special Requirements: ${formData.specialRequirements}\nRespond ONLY with the JSON array, no explanation.`;
      const aiResponse = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a helpful startup bill of materials generator.' },
          { role: 'user', content: prompt }
        ],
        // model defaults to google/gemma-3n-e2b-it:free
        temperature: 0.7,
        max_tokens: 1000
      });
      let materials: MaterialItem[] = [];
      try {
        materials = JSON.parse(aiResponse);
      } catch (e) {
        const match = aiResponse.match(/\[.*\]/s);
        if (match) materials = JSON.parse(match[0]);
      }
      setAiMaterials(Array.isArray(materials) ? materials : []);
      setShowResults(true);
    } catch (err) {
      // Fallback: 3 mock BOM categories if AI fails
      setAiMaterials([
        {
          category: 'Electronics',
          items: [
            { name: 'Microcontroller', quantity: '100', supplier: 'DigiKey', cost: '$300', lead_time: '2 weeks', priority: 'High' },
            { name: 'Sensors', quantity: '200', supplier: 'Mouser', cost: '$400', lead_time: '3 weeks', priority: 'Medium' }
          ]
        },
        {
          category: 'Packaging',
          items: [
            { name: 'Boxes', quantity: '500', supplier: 'Uline', cost: '$150', lead_time: '1 week', priority: 'Low' }
          ]
        },
        {
          category: 'Assembly',
          items: [
            { name: 'Labor', quantity: '50 hours', supplier: 'Local Shop', cost: '$1000', lead_time: '4 weeks', priority: 'High' }
          ]
        }
      ]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const totalCost = aiMaterials.reduce((total, category) => 
    total + category.items.reduce((catTotal, item) => 
      catTotal + parseInt((item.cost || '0').toString().replace(/[$,]/g, '')), 0), 0);

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
                        productType: proj.category || "",
                        productionVolume: "",
                        qualityLevel: "",
                        budget: proj.budget.allocated ? `$${proj.budget.allocated}` : "",
                        timeline: proj.timeline ? `${proj.timeline.endDate}` : "",
                        specialRequirements: proj.description || ""
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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bill of Materials Generator
          </h1>
          <p className="text-muted-foreground">
            Comprehensive material and resource planning for your product development
          </p>
        </div>

        {/* Info Box */}
        <Card className="p-4 glass border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Smart Resource Planning</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis of material requirements, supplier recommendations, and cost optimization based on your product specifications.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 glass-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-type" className="text-foreground font-medium">Product Type</Label>
              <Input
                id="product-type"
                placeholder="e.g. Electronics device, Furniture, Clothing line, Software hardware"
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume" className="text-foreground font-medium">Expected Production Volume</Label>
              <Input
                id="volume"
                placeholder="e.g. 100 units, 1000 units/month, Small batch prototype"
                value={formData.productionVolume}
                onChange={(e) => setFormData({...formData, productionVolume: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality" className="text-foreground font-medium">Quality Level</Label>
              <Input
                id="quality"
                placeholder="e.g. Premium, Standard, Budget-friendly, Industrial grade"
                value={formData.qualityLevel}
                onChange={(e) => setFormData({...formData, qualityLevel: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-foreground font-medium">Material Budget</Label>
              <Input
                id="budget"
                placeholder="e.g. $5,000, $50,000, Flexible budget"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-foreground font-medium">Production Timeline</Label>
              <Input
                id="timeline"
                placeholder="e.g. 3 months, 6 months, ASAP"
                value={formData.timeline}
                onChange={(e) => setFormData({...formData, timeline: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="text-foreground font-medium">Special Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific material requirements, certifications, sustainability goals, or technical specifications?"
                value={formData.specialRequirements}
                onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                className="min-h-[80px] resize-none"
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
              Generating BOM...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 mr-2" />
              Generate Bill of Materials
            </>
          )}
        </Button>

        {/* Results */}
        {showResults && (
          <div className="space-y-6 mt-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Bill of Materials</h2>
              <p className="text-muted-foreground">Comprehensive material planning and cost analysis</p>
            </div>

            {/* Cost Summary */}
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-foreground">Total Material Cost</h3>
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Estimated total</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 glass rounded-lg">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Materials</p>
                  <p className="font-semibold text-foreground">${(totalCost * 0.6).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 glass rounded-lg">
                  <Truck className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Logistics</p>
                  <p className="font-semibold text-foreground">${(totalCost * 0.15).toLocaleString()}</p>
                </div>
                <div className="text-center p-3 glass rounded-lg">
                  <Zap className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Equipment</p>
                  <p className="font-semibold text-foreground">${(totalCost * 0.25).toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Material Categories */}
            <div className="space-y-4">
              {aiMaterials.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="p-6 glass-card">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 glass rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">Supplier: {item.supplier}</p>
                          </div>
                          <Badge 
                            variant={
                              item.priority === "High" ? "destructive" :
                              item.priority === "Medium" ? "default" : "secondary"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Quantity</p>
                            <p className="font-medium text-foreground">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cost</p>
                            <p className="font-medium text-foreground">{item.cost}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Lead Time</p>
                            <p className="font-medium text-foreground">{item.lead_time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            <Card className="p-6 glass-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Supplier Diversification</p>
                    <p className="text-sm text-muted-foreground">Consider backup suppliers for critical components to avoid supply chain disruptions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Lead Time Management</p>
                    <p className="text-sm text-muted-foreground">Order high-priority items 2-3 weeks earlier than needed to account for delays</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Bulk Order Discounts</p>
                    <p className="text-sm text-muted-foreground">Negotiate 10-15% discounts for bulk orders above minimum quantities</p>
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

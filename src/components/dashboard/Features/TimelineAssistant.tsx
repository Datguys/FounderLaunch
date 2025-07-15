import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface TimelineAssistantProps {
  onSectionChange: (section: string) => void;
  savedProjects?: any[];
  onSaveProject?: (project: any) => void;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  estimatedHours: number;
}

interface TimelineData {
  projectName: string;
  startDate: string;
  targetLaunchDate: string;
  budget: string;
  teamSize: string;
  projectType: string;
  keyFeatures: string;
}

const mockMilestones: Milestone[] = [
  {
    id: "1",
    title: "Market Research & Validation",
    description: "Conduct comprehensive market analysis, competitor research, and validate business concept with potential customers",
    deadline: "2024-02-15",
    status: "completed",
    priority: "high",
    estimatedHours: 40
  },
  {
    id: "2", 
    title: "Business Plan Development",
    description: "Create detailed business plan including financial projections, marketing strategy, and operational framework",
    deadline: "2024-03-01",
    status: "in-progress",
    priority: "high",
    estimatedHours: 60
  },
  {
    id: "3",
    title: "MVP Development",
    description: "Build minimum viable product with core features to test with early adopters and gather feedback",
    deadline: "2024-04-15",
    status: "pending",
    priority: "high",
    estimatedHours: 120
  },
  {
    id: "4",
    title: "Brand Identity & Website",
    description: "Develop brand identity, logo, and professional website to establish online presence",
    deadline: "2024-03-30",
    status: "pending",
    priority: "medium",
    estimatedHours: 35
  },
  {
    id: "5",
    title: "Legal Setup & Compliance",
    description: "Register business, obtain necessary licenses, set up contracts and legal documentation",
    deadline: "2024-04-01",
    status: "pending",
    priority: "medium",
    estimatedHours: 25
  },
  {
    id: "6",
    title: "Beta Testing & Feedback",
    description: "Launch beta version with selected users, collect feedback, and iterate on product improvements",
    deadline: "2024-05-15",
    status: "pending",
    priority: "high",
    estimatedHours: 50
  },
  {
    id: "7",
    title: "Marketing Campaign Launch",
    description: "Execute comprehensive marketing campaign across multiple channels to drive awareness and acquisition",
    deadline: "2024-06-01",
    status: "pending",
    priority: "medium",
    estimatedHours: 80
  },
  {
    id: "8",
    title: "Official Product Launch",
    description: "Full product launch with all features, payment processing, and customer support systems in place",
    deadline: "2024-06-30",
    status: "pending",
    priority: "high",
    estimatedHours: 40
  }
];

export function TimelineAssistant({ onSectionChange, savedProjects = [], onSaveProject }: TimelineAssistantProps) {
  const [formData, setFormData] = useState<TimelineData>({
    projectName: "",
    startDate: "",
    targetLaunchDate: "",
    budget: "",
    teamSize: "",
    projectType: "",
    keyFeatures: ""
  });
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [chooseModal, setChooseModal] = useState(false);
  const [pendingInfo, setPendingInfo] = useState<{project?: any, form?: TimelineData} | null>(null);
  const [selectedSaved, setSelectedSaved] = useState<any | null>(null);

  // Helper functions for UI
  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "secondary"; 
      case "pending": return "outline";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };
  const getPriorityColor = (priority: Milestone['priority']) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-muted-foreground";
    }
  };
  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-500" />;
      case "overdue": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Choose between saved or new info
  const handleUseSaved = (project: any) => {
    if (formData.projectName || formData.keyFeatures || formData.projectType) {
      setPendingInfo({ project, form: formData });
      setChooseModal(true);
    } else {
      setSelectedSaved(project);
      setFormData({
        projectName: project.projectName,
        startDate: project.startDate,
        targetLaunchDate: project.targetLaunchDate,
        budget: project.budget,
        teamSize: project.teamSize,
        projectType: project.projectType,
        keyFeatures: project.keyFeatures
      });
      setShowResults(false);
    }
  };

  const handleUseForm = () => {
    setSelectedSaved(null);
    setChooseModal(false);
    setShowResults(false);
  };

  const handleConfirmSaved = () => {
    if (pendingInfo?.project) {
      setSelectedSaved(pendingInfo.project);
      setFormData({
        projectName: pendingInfo.project.projectName,
        startDate: pendingInfo.project.startDate,
        targetLaunchDate: pendingInfo.project.targetLaunchDate,
        budget: pendingInfo.project.budget,
        teamSize: pendingInfo.project.teamSize,
        projectType: pendingInfo.project.projectType,
        keyFeatures: pendingInfo.project.keyFeatures
      });
      setShowResults(false);
    }
    setChooseModal(false);
  };

  // AI or fallback logic
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const { getAICompletion } = await import("@/lib/ai");
      const aiPrompt = `Given the following project details, generate a JSON array of 6-10 realistic startup milestones. Each milestone should have: id, title, description, deadline (YYYY-MM-DD), status (pending|in-progress|completed|overdue), priority (low|medium|high), and estimatedHours.\nProject: ${formData.projectName}\nType: ${formData.projectType}\nStart: ${formData.startDate}\nLaunch: ${formData.targetLaunchDate}\nBudget: ${formData.budget}\nTeam: ${formData.teamSize}\nFeatures: ${formData.keyFeatures}`;
      const aiResponse = await getAICompletion({
        messages: [
          { role: 'system', content: 'You are a startup project timeline assistant.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.6,
        max_tokens: 1000
      });
      let aiMilestones: Milestone[] = [];
      try {
        aiMilestones = JSON.parse(aiResponse);
      } catch (e) {
        const match = aiResponse.match(/\[.*\]/s);
        if (match) aiMilestones = JSON.parse(match[0]);
      }
      setMilestones(Array.isArray(aiMilestones) && aiMilestones.length ? aiMilestones : mockMilestones);
    } catch (err) {
      setMilestones(mockMilestones);
    } finally {
      setIsLoading(false);
      setShowResults(true);
    }
  };

  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const totalMilestones = milestones.length;
  const progressPercentage = (completedMilestones / (totalMilestones || 1)) * 100;

  // Save project handler
  const handleSaveProject = () => {
    if (onSaveProject) {
      onSaveProject({ ...formData, milestones });
    }
  };

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Modal for choosing between saved and new info */}
        {chooseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg shadow-lg p-8 max-w-md w-full">
              <h3 className="font-bold text-lg mb-4">Choose Project Info</h3>
              <p className="mb-4">You have both a saved project and new info entered. Which would you like to use?</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleConfirmSaved}>Use Saved Project</Button>
                <Button variant="outline" onClick={handleUseForm}>Use New Info</Button>
              </div>
            </div>
          </div>
        )}

        {/* Saved project selector */}
        {savedProjects.length > 0 && !showResults && (
          <div className="mb-6">
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground mb-2">Choose a saved project to prefill:</span>
              <div className="flex gap-4 flex-wrap justify-center">
                {savedProjects.map((project, idx) => (
                  <Button key={project.id || idx} variant="outline" onClick={() => handleUseSaved(project)}>
                    {project.projectName || project.name}
                  </Button>
                ))}
              </div>
              <div className="relative my-6 w-full flex justify-center items-center">
                <div className="absolute left-0 right-0 h-0.5 bg-muted/40" style={{zIndex:0}} />
                <div className="relative z-10 bg-muted/60 rounded-full px-4 py-1 text-xs font-medium text-muted-foreground border border-border shadow" style={{marginTop:-16}}>or</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!showResults && (
          <Card className="p-6 glass-card">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-foreground font-medium">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g. AI Service Marketplace"
                    value={formData.projectName}
                    onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-foreground font-medium">Project Type</Label>
                  <Input
                    id="projectType"
                    placeholder="e.g. Tech Startup, E-commerce, Service Business"
                    value={formData.projectType}
                    onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetLaunchDate" className="text-foreground font-medium">Target Launch Date</Label>
                  <Input
                    id="targetLaunchDate"
                    type="date"
                    value={formData.targetLaunchDate}
                    onChange={(e) => setFormData({...formData, targetLaunchDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-foreground font-medium">Budget Range</Label>
                  <Input
                    id="budget"
                    placeholder="e.g. $10,000 - $50,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-foreground font-medium">Team Size</Label>
                  <Input
                    id="teamSize"
                    placeholder="e.g. Solo founder, 2-3 people, 5+ team"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyFeatures" className="text-foreground font-medium">Key Features & Requirements</Label>
                <Textarea
                  id="keyFeatures"
                  placeholder="Describe the main features, functionalities, and requirements for your project..."
                  value={formData.keyFeatures}
                  onChange={(e) => setFormData({...formData, keyFeatures: e.target.value})}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Generate Button */}
        {!showResults && (
          <Button 
            variant="default"
            size="lg"
            className="w-full mt-6"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Timeline...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate My Project Timeline
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {showResults && (
          <>
            {/* Results Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Project Timeline: {formData.projectName || "Your Project"}
              </h2>
              <p className="text-muted-foreground">
                AI-generated timeline with {totalMilestones} key milestones
              </p>
            </div>
            {/* Progress Overview */}
            <Card className="p-6 glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {completedMilestones} of {totalMilestones} completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(0)}% complete • Estimated {milestones.reduce((acc, m) => acc + m.estimatedHours, 0)} hours remaining
              </p>
            </Card>
            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Project Milestones</h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
              {milestones.map((milestone, index) => (
                <Card key={milestone.id} className="p-5 glass-card hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(milestone.status)}
                          <Badge variant={getStatusColor(milestone.status)}>
                            {milestone.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Due: {new Date(milestone.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                            {milestone.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {milestone.estimatedHours}h estimated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* Actions */}
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Modify Timeline
              </Button>
              <Button onClick={handleSaveProject}>
                Save Project
              </Button>
              <Button>
                Export Timeline
              </Button>
            </div>
          </>
        )}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}

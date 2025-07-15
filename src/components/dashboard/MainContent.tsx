import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "./Settings";
import { IdeaGenerator } from "./Features/IdeaGenerator";

import { YourProject } from "./Features/YourProject";
import { Timeline } from "./Features/Timeline";
import { 
  Lightbulb, 
  Calculator, 
  Clock, 
  TrendingUp, 
  Target,
  Zap,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  DollarSign,
  HelpCircle,
  CheckSquare
} from "lucide-react";

interface MainContentProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const featureCards = [
  {
    id: "business-ideas",
    title: "AI Idea Generator",
    description: "Get tailored business ideas based on your skills and budget",
    icon: Lightbulb,
    color: "from-blue-500 to-purple-600",
    action: "Generate Ideas",
    isPro: false,
  },
  {
    id: "chatbot",
    title: "Chatbot",
    description: "Real-time business Q&A with tiered access",
    icon: HelpCircle,
    color: "from-cyan-500 to-blue-600",
    action: "Ask a Question",
    isPro: false,
  },
  {
    id: "legal-checklist",
    title: "Legal & Compliance",
    description: "Step-by-step checklist for business setup",
    icon: CheckSquare,
    color: "from-green-500 to-emerald-600",
    action: "View Checklist",
    isPro: false,
  },
  {
    id: "timeline",
    title: "Timeline Assistant",
    description: "Visualize your project roadmap and milestones",
    icon: Clock,
    color: "from-yellow-500 to-orange-600",
    action: "View Timeline",
    isPro: false,
  }
];

const stats = [
  { label: "Active Projects", value: "4", change: "+12%", positive: true },
  { label: "Total Investment", value: "$127K", change: "+8%", positive: true },
  { label: "Ideas Generated", value: "23", change: "+15%", positive: true },
  { label: "Avg. Time to Launch", value: "68 days", change: "-5%", positive: true },
];

import { useProjects } from "./Features/YourProject";

export function MainContent({ activeSection, onSectionChange }: MainContentProps) {
  // Settings section
  if (activeSection === "settings") {
    return <Settings onSectionChange={onSectionChange} />;
  }

  if (activeSection === "business-ideas") {
    return <IdeaGenerator />;
  }

  if (activeSection === "chatbot") {
    return <div className="flex-1 flex items-center justify-center text-lg text-muted-foreground">Chatbot coming soon</div>;
  }

  if (activeSection === "legal-checklist") {
    return <div className="flex-1 flex items-center justify-center text-lg text-muted-foreground">Legal & Compliance Checklist coming soon</div>;
  }


  if (activeSection === "timeline") {
    return <Timeline onSectionChange={onSectionChange} />;
  }

  if (activeSection === "your-project") {
    return <YourProject onSectionChange={onSectionChange} />;
  }

  // Other sections placeholder
  if (activeSection !== "dashboard") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="p-8 flex flex-col items-center">
          <div className="mb-4">
            <Badge className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 text-lg rounded-full">
              <Zap className="inline-block mr-2" />
              {featureCards.find((f) => f.id === activeSection)?.title || "Section"}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {featureCards.find((f) => f.id === activeSection)?.title || "Section"}
          </h2>
          <p className="text-muted-foreground mb-6">
            This section is under development. Coming soon with amazing features!
          </p>
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const { projects, addProject, removeProject, updateProject, loading: projectsLoading, error: projectsError } = useProjects();

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, Ibrahim! 👋
            </h1>
            <p className="text-muted-foreground">
              Let's continue building your dream startup. Here's what's happening today.
            </p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => onSectionChange("business-ideas")}
            className="hidden sm:flex glow-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Project
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-gradient-card glow-card hover-lift">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Badge 
                  variant={stat.positive ? "default" : "secondary"}
                  className={stat.positive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">AI-Powered Tools</h2>
            <Badge className="bg-primary/20 text-primary">4 Tools Available</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className="p-6 bg-gradient-card glow-card hover-lift cursor-pointer transition-smooth group"
                  onClick={() => onSectionChange(feature.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center glow-primary`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {feature.isPro && (
                      <Badge className="bg-warning/20 text-warning">Pro Feature</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    variant={feature.isPro ? "outline" : "primary"}
                    size="sm"
                    className="w-full group-hover:scale-105 transition-smooth glow-primary"
                  >
                    {feature.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Real Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange("your-project")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-6 text-center">No saved projects yet. Generate and save ideas to get started!</Card>
            ) : (
              projects.map((project, index) => (
                <Card key={project.id} className="p-6 bg-gradient-card glow-card hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.status}
                      </Badge>
                      <Badge 
                        variant="default"
                        className="text-xs"
                      >
                        {project.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${project.budget.allocated}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {project.analytics.customers} customers
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{project.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
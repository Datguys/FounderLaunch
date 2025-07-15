import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowLeft, CheckCircle2, AlertCircle, Target } from "lucide-react";
import { Project, useProjects } from "./YourProject";

interface TimelineProps {
  onSectionChange: (section: string) => void;
  selectedProjectId?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "in-progress": return <Clock className="w-4 h-4 text-blue-500" />;
    case "overdue": return <AlertCircle className="w-4 h-4 text-red-500" />;
    default: return <Target className="w-4 h-4 text-muted-foreground" />;
  }
};

export function Timeline({ onSectionChange, selectedProjectId }: TimelineProps) {
  const { projects } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    if (selectedProjectId) {
      const found = projects.find(p => p.id === selectedProjectId);
      setSelected(found || null);
    } else if (projects.length > 0) {
      setSelected(projects[0]);
    }
  }, [selectedProjectId, projects]);

  if (!selected) {
    return (
      <div className="flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No Project Selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Please select or create a project to view its timeline.
          </p>
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Show milestones if they exist
  const milestones = (selected as any).milestones || [];
  const completed = milestones.filter((m: any) => m.status === "completed").length;
  const progress = milestones.length ? (completed / milestones.length) * 100 : 0;

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {selected.name} Timeline
          </h2>
          <p className="text-muted-foreground mb-6">
            Milestone tracking and launch checklist for your project.
          </p>
        </div>
        {milestones.length === 0 ? (
          <Card className="p-6 text-center">No milestones found for this project.</Card>
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completed} of {milestones.length} completed</span>
              </div>
              <Progress value={progress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {progress.toFixed(0)}% complete
              </p>
            </Card>
            <div className="space-y-4">
              {milestones.map((m: any, i: number) => (
                <Card key={m.id} className="p-5 glass-card hover-lift">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </div>
                      {i < milestones.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{m.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(m.status)}
                          <Badge variant="outline">{m.status.replace('-', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {m.priority ? m.priority.toUpperCase() + " PRIORITY" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {m.estimatedHours}h estimated
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(m.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
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

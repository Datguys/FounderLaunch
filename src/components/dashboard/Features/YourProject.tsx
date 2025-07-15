import * as React from "react";
import { useState, useEffect } from "react";
import { getUserProjects, addUserProject, updateUserProject, deleteUserProject } from '@/lib/firestoreProjects';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';


// --- Shared Project Storage Hook ---
export interface Project {
  lastUpdated?: string;
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  analytics: {
    revenue: number;
    customers: number;
    growth: number;
  };
  category: string;
}

export function useProjects() {
  const { user } = useFirebaseUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserProjects(user.uid)
      .then(setProjects)
      .catch((err) => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [user]);

  const addProject = async (project: Omit<Project, "id">) => {
    if (!user) throw new Error("Not authenticated");
    setLoading(true);
    try {
      const id = await addUserProject(user.uid, project);
      setProjects((prev) => [...prev, { ...project, id }]);
      return id;
    } catch (err) {
      setError("Failed to add project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProject = async (id: string) => {
    setLoading(true);
    try {
      await deleteUserProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setLoading(true);
    try {
      await updateUserProject(id, updates);
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (err) {
      setError("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return { projects, addProject, removeProject, updateProject, loading, error };
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";

interface YourProjectProps {
  onSectionChange: (section: string) => void;
}

export function YourProject({ onSectionChange }: YourProjectProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { projects, addProject, removeProject, updateProject, loading, error } = useProjects();
  const { user, loading: userLoading } = useFirebaseUser();

  // No need for local useEffect to fetch projects or manage loading/error here; handled by useProjects hook.

  const handleAddProject = async () => {
    if (!user) return;
    const name = prompt('Project name?');
    if (!name) return;
    const newProject: Omit<Project, 'id'> = {
      name,
      description: '',
      status: 'Planning',
      progress: 0,
      budget: { allocated: 0, spent: 0, remaining: 0 },
      timeline: { startDate: '', endDate: '', daysRemaining: 0 },
      analytics: { revenue: 0, customers: 0, growth: 0 },
      category: '',
    };
    try {
      await addProject(newProject);
      onSectionChange('business-ideas'); // Redirect to idea generator
    } catch (err) {
      // Error is handled by the hook's error state
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!user) return;
    try {
      await removeProject(id);
      setSelectedProject(null);
    } catch (err) {
      // error is handled by the hook
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case "Planning": return "secondary";
      case "In Progress": return "default";
      case "Completed": return "default";
      case "On Hold": return "destructive";
      default: return "secondary";
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg text-destructive">{error}</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedProject(null)}
              className="mb-4"
            >
              ← Back to Projects
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeleteProject(selectedProject.id)}>
                Delete
              </Button>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 glass-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {selectedProject.name}
                    </h1>
                    <p className="text-muted-foreground mb-3">
                      {selectedProject.description}
                    </p>
                    <Badge variant={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{selectedProject.progress}%</span>
                    </div>
                    <Progress value={selectedProject.progress} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {/* Analytics Cards */}
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold text-foreground">
                      ${selectedProject.analytics.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-lg font-bold text-foreground">
                      {selectedProject.analytics.customers}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className="text-lg font-bold text-foreground">
                      +{selectedProject.analytics.growth}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Budget Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-medium text-foreground">
                    ${selectedProject.budget.allocated.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium text-foreground">
                    ${selectedProject.budget.spent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-foreground">
                    ${selectedProject.budget.remaining.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2">
                  <Progress 
                    value={(selectedProject.budget.spent / selectedProject.budget.allocated) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedProject.timeline.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedProject.timeline.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium text-foreground">
                    {selectedProject.timeline.daysRemaining} days
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-primary">
            <FolderOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Projects
          </h1>
          <p className="text-muted-foreground">
            Track progress, analytics, and manage all your business ventures in one place
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button onClick={handleAddProject}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="p-6 glass-card hover-lift cursor-pointer group" onClick={() => setSelectedProject(project)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <Badge variant={getStatusColor(project.status)} className="mb-3">
                    {project.status}
                  </Badge>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${project.analytics.revenue > 0 ? (project.analytics.revenue / 1000).toFixed(0) + 'k' : '0'}
                    </p>
                  </div>
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Customers</p>
                    <p className="text-sm font-semibold text-foreground">{project.analytics.customers}</p>
                  </div>
                  <div className="glass p-2 rounded">
                    <p className="text-xs text-muted-foreground">Growth</p>
                    <p className="text-sm font-semibold text-foreground">+{project.analytics.growth}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{project.category}</span>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => onSectionChange("dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { getUserProjects, addUserProject, updateUserProject, deleteUserProject } from '@/lib/firestoreProjects';
import type { Project } from './YourProject';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Share2,
  MoreVertical,
  ArrowLeft,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AllProjectsProps {
  onBack: () => void;
  onProjectSelect: (projectId: string) => void;
}

export function AllProjects({ onBack, onProjectSelect }: AllProjectsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useFirebaseUser();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserProjects(user.uid)
      .then(setProjects)
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [user]);

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
      // lastUpdated removed or handled as optional new Date().toISOString(),
    };
    setLoading(true);
    try {
      const id = await addUserProject(user.uid, newProject);
      setProjects([...projects, { ...newProject, id }]);
    } catch (err) {
      setError('Failed to add project');
    } finally {
      setLoading(false);
    }
  };

  // HANDLEDELETE_UNIQUE_MARKER
const handleDelete = async (projectId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteUserProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setDeleteProjectId(null);
    } catch (err) {
      setError('Failed to delete project');
    } finally {
      setLoading(false);
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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading || !user) {
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

  const handleShare = (project: Project) => {
    // Mock share functionality
    navigator.clipboard.writeText(`Check out my project: ${project.name} - ${project.description}`);
    console.log(`Shared project: ${project.name}`);
  };

  

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="p-6 glass-card hover-lift group transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <Badge variant={getStatusColor(project.status)} className="text-xs">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
  <span className="flex items-center gap-1">
    <Calendar className="w-3 h-3" />
    {project.lastUpdated?.toString() ? `Updated ${new Date(project.lastUpdated?.toString()).toLocaleDateString()}` : ''}
  </span>
  <span>{project.category}</span>
</div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onProjectSelect(project.id)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare(project)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setDeleteProjectId(project.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              ${project.analytics.revenue > 0 ? (project.analytics.revenue / 1000).toFixed(0) + 'k' : '0'}
            </p>
          </div>
          <div className="glass p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Customers</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{project.analytics.customers}</p>
          </div>
          <div className="glass p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Growth</span>
            </div>
            <p className="text-sm font-semibold text-foreground">+{project.analytics.growth}%</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onProjectSelect(project.id)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleShare(project)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const ProjectListItem = ({ project }: { project: Project }) => (
    <Card className="p-4 glass-card hover-lift group transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <Badge variant={getStatusColor(project.status)} className="text-xs">
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{project.category}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            {project.description}
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>Progress: {project.progress}%</span>
            <span>Revenue: ${project.analytics.revenue.toLocaleString()}</span>
            <span>Customers: {project.analytics.customers}</span>
            {project.lastUpdated?.toString() && (<span>Updated: {new Date(project.lastUpdated?.toString()).toLocaleDateString()}</span>)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Progress value={project.progress} className="w-20 h-2" />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onProjectSelect(project.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleShare(project)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onProjectSelect(project.id)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(project)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteProjectId(project.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">All Projects</h1>
              <p className="text-muted-foreground">
                Manage and track all your business ventures
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleAddProject}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter(p => p.status === "In Progress").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4 glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  ${projects.reduce((sum, p) => sum + p.analytics.revenue, 0).toLocaleString()}
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
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.reduce((sum, p) => sum + p.analytics.customers, 0)}
                </p>
              </div>
            </div>
          </Card>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {filterStatus === "all" ? "All Status" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Planning")}>Planning</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("In Progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("On Hold")}>On Hold</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
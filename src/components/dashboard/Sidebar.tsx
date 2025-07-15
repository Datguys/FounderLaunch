import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Calculator, 
  Package, 
  CheckSquare, 
  Clock,
  Zap,
  Settings,
  HelpCircle,
  Crown,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "your-project", label: "Your Projects", icon: LayoutDashboard },
  { id: "business-ideas", label: "Business Ideas", icon: Lightbulb },
  { id: "chatbot", label: "Chatbot", icon: HelpCircle },
  { id: "legal-checklist", label: "Legal & Compliance", icon: CheckSquare },
  { id: "timeline", label: "Timeline", icon: Clock },
];

const accountItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help Center", icon: HelpCircle },
];

export function Sidebar({ activeSection, onSectionChange, className }: SidebarProps) {
  const [progress] = useState(32); // Mock progress value

  return (
    <div className={cn(
      "w-64 h-full bg-card/30 backdrop-blur-md border-r border-border flex flex-col",
      className
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">StartupCoPilot</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </h3>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "sidebar-active" : "sidebar"}
                size="default"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "mb-1 h-12 text-left font-medium bg-card/30",
                  isActive && "animate-slide-in"
                )}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "business-ideas" && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                    3
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="mt-8 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Account
          </h3>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "sidebar-active" : "sidebar"}
                size="default"
                onClick={() => onSectionChange(item.id)}
                className="mb-1 h-12 text-left font-medium bg-card/30"
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Progress Section */}
        <div className="mt-8 p-4 bg-gradient-card rounded-lg glow-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
          </div>
          <div className="progress-bar mb-2">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress}% Complete</p>
        </div>

        {/* Upgrade Section */}
        <div className="mt-6 p-4 bg-gradient-secondary rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-foreground">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock advanced analytics, unlimited projects, and priority support.
          </p>
          <Button 
            variant="upgrade" 
            size="sm" 
            className="w-full"
            onClick={() => window.location.href = '/upgrade'}
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
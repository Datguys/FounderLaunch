import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  Crown,
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';

interface HeaderProps {
  onSectionChange: (section: string) => void;
}

export function Header({ onSectionChange }: HeaderProps) {
  const { user, loading } = useFirebaseUser();
  const currentPlan = "Free";
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Search Section */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
          />
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {/* Current Plan Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant={currentPlan === "Free" ? "secondary" : "default"}
            className="bg-card-hover text-muted-foreground"
          >
            {currentPlan}
          </Badge>
          {currentPlan === "Free" && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onSectionChange("upgrade")}
              className="text-xs glow-primary"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-accent-foreground rounded-full"></span>
          </span>
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onSectionChange("settings")}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
              {user && user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover glow-primary" />
              ) : (
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center glow-primary">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-popover border-border glow-card"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</p>
              {user && user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onSectionChange("profile")}
              className="hover:bg-card-hover cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSectionChange("settings")}
              className="hover:bg-card-hover cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            {currentPlan === "Free" && (
              <DropdownMenuItem 
                className="hover:bg-card-hover cursor-pointer text-warning glow-primary"
                onClick={() => navigate('/upgrade')}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-destructive/10 cursor-pointer text-destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
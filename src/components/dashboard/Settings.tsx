import { useState } from "react";
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Crown, 
  Palette, 
  Zap, 
  CreditCard, 
  Trash2,
  Mail,
  Shield,
  Settings as SettingsIcon,
  ArrowRight,
  Check,
  AlertTriangle
} from "lucide-react";

interface SettingsProps {
  onSectionChange: (section: string) => void;
}

export function Settings({ onSectionChange }: SettingsProps) {
  const { user, loading } = useFirebaseUser();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);



  const templates = [
    {
      id: "modern",
      name: "Modern Dark",
      description: "Sleek dark theme with purple gradients",
      preview: "bg-gradient-to-br from-purple-900 to-blue-900",
      features: ["Dark mode", "Purple accents", "Glass morphism"]
    },
    {
      id: "minimal",
      name: "Minimal Light",
      description: "Clean light theme with subtle colors",
      preview: "bg-gradient-to-br from-gray-100 to-blue-100",
      features: ["Light mode", "Blue accents", "Clean lines"]
    }
  ];

  const creditPackages = [
    { credits: 500, price: 9.99, popular: false },
    { credits: 1200, price: 19.99, popular: true },
    { credits: 3000, price: 39.99, popular: false }
  ];

  return (
    <div className="flex-1 p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {user && user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-lg object-cover glow-primary" />
          ) : (
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <Button
          variant="upgrade"
          className="mt-4 mb-6"
          onClick={() => window.location.href = '/upgrade'}
        >
          Upgrade / Subscribe
        </Button>
            <p className="text-muted-foreground">Manage your account and preferences</p>
            <div className="mt-2">
              <div className="font-medium text-foreground">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</div>
              {user && user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 p-1">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              About You
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Credits
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Purchase
            </TabsTrigger>
          </TabsList>

          {/* About You Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid gap-6">
              {/* Subscription Info */}
              <Card className="p-6 bg-gradient-card glow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
                  <Badge 
                    variant={"secondary"}
                    className="bg-primary/20 text-primary"
                  >
                    Free Plan
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Plan</span>
                    <span className="text-foreground font-medium">Free</span>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6 bg-gradient-card glow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="text-foreground font-medium">{user ? user.displayName || user.email : loading ? 'Loading...' : 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email Address</span>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">{user ? user.email : loading ? 'Loading...' : 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Status</span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      <span className="text-success font-medium">Verified</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Edit Profile
                </Button>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-gradient-card glow-card border-destructive/20">
                <h3 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                  {showDeleteConfirm && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-destructive mb-2">Are you absolutely sure?</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            This will permanently delete your account and remove all your data from our servers.
                          </p>
                          <div className="flex gap-3">
                            <Button variant="secondary" size="sm">
                              Yes, Delete My Account
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Template Customization Tab */}
          <TabsContent value="customization" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Choose Your Template</h3>
              <p className="text-muted-foreground mb-6">
                Select a template that matches your style and preferences.
              </p>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5 glow-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-12 rounded-lg ${template.preview} border border-border`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          {selectedTemplate === template.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex gap-2">
                          {template.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6 w-full">
                Apply Template
              </Button>
            </Card>
          </TabsContent>

          {/* AI Credits Tab */}
          <TabsContent value="credits" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">AI Credit Usage</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Credits Used</span>
                    <span className="text-foreground font-medium">
                      {0} / {0}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill bg-gradient-primary" 
                      style={{ width: `0%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    0 credits remaining
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Idea Generation</h4>
                    <p className="text-2xl font-bold text-foreground mt-1">0</p>
                    <p className="text-xs text-muted-foreground">credits used</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Budget Analysis</h4>
                    <p className="text-2xl font-bold text-foreground mt-1">0</p>
                    <p className="text-xs text-muted-foreground">credits used</p>
                  </div>
                  <div className="text-center p-4 bg-card/50 rounded-lg">
                    <Crown className="w-8 h-8 text-warning mx-auto mb-2" />
                    <h4 className="font-medium text-foreground">Analytics</h4>
                    <p className="text-2xl font-bold text-foreground mt-1">0</p>
                    <p className="text-xs text-muted-foreground">credits used</p>
                  </div>
                </div>

                {false && (
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-medium text-warning mb-1">Low Credits Warning</h4>
                        <p className="text-sm text-muted-foreground">
                          You're running low on AI credits. Consider purchasing more to continue using all features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Purchase Credits Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="p-6 bg-gradient-card glow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Purchase AI Credits</h3>
              <p className="text-muted-foreground mb-6">
                Choose a credit package to continue using AI-powered features.
              </p>
              <div className="grid gap-4">
                {creditPackages.map((pkg, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg transition-all duration-300 ${
                      pkg.popular 
                        ? 'border-primary bg-primary/5 glow-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {pkg.credits.toLocaleString()} Credits
                          </h4>
                          {pkg.popular && (
                            <Badge className="bg-primary text-primary-foreground">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Best value for regular users
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">${pkg.price}</p>
                        <Button 
                          variant={pkg.popular ? "primary" : "outline"}
                          size="sm"
                          className="mt-2"
                        >
                          Purchase
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-card/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Credit Usage Guide</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Idea Generation: 2-5 credits per request</li>
                  <li>• Budget Analysis: 3-8 credits per analysis</li>
                  <li>• Timeline Planning: 5-10 credits per timeline</li>
                  <li>• Market Research: 8-15 credits per report</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
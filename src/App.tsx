import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Ideas from "./pages/Ideas";
import IdeaGenerator from "./pages/IdeaGenerator";
import BOM from "./pages/BOM";
import Budget from "./pages/Budget";
import Checklist from "./pages/Checklist";
import Timeline from "./pages/Timeline";
import Settings from "./pages/Settings";
import Affiliate from "./pages/Affiliate";
import Pricing from "./pages/Pricing";
import DeepAnalysis from "./components/dashboard/Features/DeepAnalysis";
import Upgrade from "./pages/Upgrade";
const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/ideas/generate" element={<IdeaGenerator />} />
          <Route path="/bom" element={<BOM />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/deep-analysis" element={<DeepAnalysis />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

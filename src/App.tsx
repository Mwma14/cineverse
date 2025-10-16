import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VideoDetail from "./pages/VideoDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import NotFound from "./pages/NotFound";
import { StickyAd } from "./components/StickyAd";
import { BottomHeader } from "./components/BottomHeader";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>);

};

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";

  return (
    <>
      {/* Don't show bottom header in admin panel */}
      {!isAdminPage && <BottomHeader />}
      <div className="pb-28">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policy" element={<Policy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <StickyAd />
    </>);

}


export default App;
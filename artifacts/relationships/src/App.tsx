import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import PaymentFailed from "./pages/PaymentFailed.tsx";
import PaymentCallback from "./pages/PaymentCallback.tsx";
import MemberLogin from "./pages/MemberLogin.tsx";
import MemberDashboard from "./pages/MemberDashboard.tsx";
import Events from "./pages/Events.tsx";
import PaymentCancelled from "./pages/PaymentCancelled.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsAndConditions from "./pages/TermsAndConditions.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/member/login" element={<MemberLogin />} />
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/payment/cancelled" element={<PaymentCancelled />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

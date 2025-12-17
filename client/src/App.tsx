import React from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import JobsPage from "@/pages/jobs";
import JobDetailsPage from "@/pages/job-details";
import AnalysisPage from "@/pages/analysis";
import SchedulePage from "@/pages/schedule";
import PrescreenPage from "@/pages/prescreen";
import EmailsPage from "@/pages/emails";
import CandidatesPage from "@/pages/candidates";
import HiringAnalyticsPage from "@/pages/hiring-analytics";
import SettingsPage from "@/pages/settings";
import ApplyPage from "@/pages/apply";
import OnboardingPage from "@/pages/onboarding";
import { AnimatePresence, motion } from "framer-motion";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [oauthTimeout, setOauthTimeout] = React.useState(false);

  // Check if we're handling an OAuth callback
  const isOAuthCallback = window.location.hash.includes('access_token') || 
                          window.location.search.includes('code=') ||
                          window.location.hash.includes('error');

  // Add timeout for OAuth callback
  React.useEffect(() => {
    if (isOAuthCallback && !isAuthenticated) {
      console.log('🔄 OAuth callback detected, waiting for session...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🔗 Hash:', window.location.hash);
      console.log('🔗 Search:', window.location.search);
      
      const timer = setTimeout(() => {
        console.log('⏰ OAuth callback timeout - redirecting to login');
        setOauthTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isOAuthCallback, isAuthenticated]);

  // If OAuth callback times out, redirect to login
  if (oauthTimeout && !isAuthenticated) {
    console.log('❌ OAuth failed, redirecting to login');
    window.location.href = '/';
    return null;
  }

  // Show loading state while checking authentication or handling OAuth
  if (isLoading || (isOAuthCallback && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {isOAuthCallback ? 'Completing sign-in...' : 'Loading...'}
          </p>
          {isOAuthCallback && (
            <p className="text-xs text-muted-foreground">
              Processing authentication...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated && location !== "/" && !location.startsWith("/apply/")) {
    return <Redirect to="/" />;
  }

  if (isAuthenticated && location === "/") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/apply/:jobId" component={ApplyPage} />
      <Route path="/onboarding">
        <AppLayout>
          <ProtectedRoute component={OnboardingPage} />
        </AppLayout>
      </Route>
      <Route path="/dashboard">
        <AppLayout>
          <ProtectedRoute component={DashboardPage} />
        </AppLayout>
      </Route>
      <Route path="/jobs">
        <AppLayout>
          <ProtectedRoute component={JobsPage} />
        </AppLayout>
      </Route>
      <Route path="/jobs/:id">
        <AppLayout>
          <ProtectedRoute component={JobDetailsPage} />
        </AppLayout>
      </Route>
      <Route path="/analysis">
        <AppLayout>
          <ProtectedRoute component={AnalysisPage} />
        </AppLayout>
      </Route>
      <Route path="/schedule">
        <AppLayout>
          <ProtectedRoute component={SchedulePage} />
        </AppLayout>
      </Route>
      <Route path="/prescreen">
        <AppLayout>
          <ProtectedRoute component={PrescreenPage} />
        </AppLayout>
      </Route>
      <Route path="/emails">
        <AppLayout>
          <ProtectedRoute component={EmailsPage} />
        </AppLayout>
      </Route>
      <Route path="/candidates">
        <AppLayout>
          <ProtectedRoute component={CandidatesPage} />
        </AppLayout>
      </Route>
      <Route path="/hiring-analytics">
        <AppLayout>
          <ProtectedRoute component={HiringAnalyticsPage} />
        </AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout>
          <ProtectedRoute component={SettingsPage} />
        </AppLayout>
      </Route>
      <Route>
        <AppLayout>
          <NotFound />
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Bot, ArrowRight, Sparkles, Users, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const features = [
  { icon: Sparkles, title: "AI-Powered Screening", description: "Instantly analyze and rank candidates" },
  { icon: Users, title: "Smart Matching", description: "Match JDs to CVs automatically" },
  { icon: Calendar, title: "Easy Scheduling", description: "One-click interview scheduling" },
  { icon: CheckCircle, title: "No More Ghosting", description: "Automated candidate updates" },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, signInWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('🔵 Attempting Google sign-in...');
      await signInWithGoogle();
      console.log('🟢 Google sign-in initiated successfully');
    } catch (error: any) {
      console.error('🔴 Google sign-in error:', error);
      toast({
        title: "Sign-in Failed",
        description: error?.message || "Could not sign in with Google. Please check if Google provider is enabled in Supabase.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleQuickStart = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      login({
        id: "demo-user",
        username: "Sarah Williams",
        password: "",
        companyName: formData.companyName || "GrowthTech Solutions",
        role: "HR Manager",
        email: formData.email || "sarah@growthtech.com",
      });
      
      toast({
        title: "Welcome to Recruit AI!",
        description: "Your smart hiring assistant is ready.",
      });
      
      setLocation("/dashboard");
    }, 800);
  };

  return (
    <div className="dark min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
              <Bot className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold text-white">Recruit AI</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold leading-tight mb-4 text-white">
              Hire smarter,<br />not harder.
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Automate resume screening, candidate ranking, and interview scheduling — all powered by AI.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="p-4 rounded-lg bg-slate-800/60 backdrop-blur-sm border border-slate-700/50"
            >
              <feature.icon className="h-5 w-5 text-blue-400 mb-2" />
              <h3 className="text-sm font-semibold mb-1 text-white">{feature.title}</h3>
              <p className="text-xs text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-slate-400">
            Trusted by 1,000+ growing teams
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Recruit AI</span>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl" data-testid="text-login-title">
                Get Started
              </CardTitle>
              <CardDescription className="text-base">
                Enter your details to access your hiring dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign-In Button */}
              <Button
                className="w-full gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                data-testid="button-google-signin"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-gray-400/30 border-t-gray-700 rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with demo</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your Company"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    data-testid="input-company"
                  />
                </div>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleQuickStart}
                disabled={isLoading}
                data-testid="button-get-started"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  <>
                    Start with Demo
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
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
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
  });

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
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/10 to-background p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary)/0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary)/0.05)_0%,transparent_50%)]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
              <Bot className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">Recruit AI</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Hire smarter,<br />not harder.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
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
              className="p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50"
            >
              <feature.icon className="h-5 w-5 text-primary mb-2" />
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
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
                    Start Hiring Smarter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or try demo</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFormData({ email: "sarah@growthtech.com", companyName: "GrowthTech Solutions" });
                }}
                data-testid="button-demo"
              >
                Use Demo Account
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

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Building2,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Welcome to Recruit AI! 👋",
    description: "Let's get you set up in just a few steps",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Tell us about your company",
    description: "This helps us personalize your experience",
    icon: Building2,
  },
  {
    id: 3,
    title: "You're all set! 🎉",
    description: "Let's start hiring smarter",
    icon: CheckCircle,
  },
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: user?.companyName || "",
    role: user?.role || "HR Manager",
    teamSize: "",
    industry: "",
  });

  const handleNext = () => {
    if (currentStep === 2) {
      // Validate company info
      if (!formData.companyName.trim()) {
        toast({
          title: "Company name required",
          description: "Please enter your company name to continue",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Update user profile with onboarding data
    const updatedUser = {
      ...user!,
      companyName: formData.companyName,
      role: formData.role,
    };
    
    login(updatedUser);
    
    // Mark onboarding as complete
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('user_metadata', JSON.stringify({
      teamSize: formData.teamSize,
      industry: formData.industry,
    }));
    
    toast({
      title: "Welcome aboard! 🎉",
      description: "Your account is ready. Let's start hiring!",
    });
    
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {user?.username || 'there'}!
              </h2>
              <p className="text-muted-foreground">
                We're excited to help you transform your hiring process with AI-powered tools.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">AI Screening</h3>
                  <p className="text-xs text-muted-foreground">
                    Automatically analyze and rank candidates
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Smart Matching</h3>
                  <p className="text-xs text-muted-foreground">
                    Match job descriptions to resumes instantly
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Automation</h3>
                  <p className="text-xs text-muted-foreground">
                    Schedule interviews and send updates automatically
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Company Information</h2>
              <p className="text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., HR Manager, Recruiter"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size (Optional)</Label>
                <select
                  id="teamSize"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                >
                  <option value="">Select team size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Technology, Healthcare"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">You're All Set! 🎉</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your account is ready. Start by creating your first job opening or uploading candidate resumes.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-3">Quick Tips:</h3>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Create job openings to start receiving applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>AI will automatically screen and rank candidates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Use the analytics dashboard to track your hiring pipeline</span>
                </li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center pb-4">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step.id === currentStep
                    ? "w-12 bg-primary"
                    : step.id < currentStep
                    ? "w-8 bg-primary/50"
                    : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </CardTitle>
        </CardHeader>

        <CardContent className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </CardContent>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center p-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

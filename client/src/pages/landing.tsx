import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Bot, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Calendar, 
  CheckCircle,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Star,
  ChevronDown,
  Play,
  BarChart3,
  Mail,
  Shield,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";

const features = [
  { 
    icon: Sparkles, 
    title: "AI-Powered Screening", 
    description: "Advanced AI analyzes resumes in seconds, scoring candidates based on job requirements",
    stat: "95% accuracy"
  },
  { 
    icon: Users, 
    title: "Smart Matching", 
    description: "Intelligent algorithms match job descriptions to candidate profiles automatically",
    stat: "3x faster"
  },
  { 
    icon: Calendar, 
    title: "Easy Scheduling", 
    description: "One-click interview scheduling with automated calendar integration",
    stat: "Zero conflicts"
  },
  { 
    icon: CheckCircle, 
    title: "No More Ghosting", 
    description: "Automated candidate updates and communication throughout the process",
    stat: "100% transparency"
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Save 80% Time",
    description: "Reduce screening time from hours to minutes with AI automation"
  },
  {
    icon: Target,
    title: "Better Matches",
    description: "Find the perfect candidates with precision AI matching algorithms"
  },
  {
    icon: TrendingUp,
    title: "Improve Quality",
    description: "Data-driven insights help you make better hiring decisions"
  },
  {
    icon: Rocket,
    title: "Scale Hiring",
    description: "Handle 10x more applications without increasing your team size"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Talent, TechCorp",
    content: "RecruitAI transformed our hiring process. We're now 3x faster and finding better candidates.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "CEO, StartupXYZ",
    content: "The AI screening is incredibly accurate. It's like having a senior recruiter working 24/7.",
    rating: 5
  },
  {
    name: "Emily Johnson",
    role: "HR Director, GrowthCo",
    content: "Finally, no more resume screening marathons. RecruitAI does the heavy lifting for us.",
    rating: 5
  }
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('🔴 Google sign-in error:', error);
      toast({
        title: "Sign-in Failed",
        description: error?.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-x-hidden smooth-scroll">
      {/* Enhanced Sticky Login Card - Centered Right */}
      <div className="fixed top-0 right-4 h-screen w-96 flex items-center justify-start z-50 hidden lg:flex pointer-events-none">
        <motion.div 
          className="pointer-events-auto"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
        <Card className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 shadow-2xl w-96 ring-1 ring-slate-600/30">
          <CardHeader className="pb-6 pt-8">
            <CardTitle className="text-white text-center text-2xl font-bold mb-2">Get Started</CardTitle>
            <CardDescription className="text-center text-slate-400 text-base">
              Enter your details to access your hiring dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base"
              size="lg"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                  <span className="font-medium">Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-medium">Continue with Google</span>
                </div>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-slate-800 px-3 text-slate-400">OR CONTINUE WITH DEMO</span>
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Work Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-sm"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Company Name</label>
              <Input
                type="text"
                placeholder="Your Company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-sm"
              />
            </div>

            {/* Demo Button */}
            <Button
              onClick={() => {
                // Handle demo access
                toast({
                  title: "Demo Access",
                  description: "Demo functionality coming soon!",
                });
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-medium"
              size="lg"
            >
              Start with Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Terms */}
            <p className="text-sm text-slate-400 text-center leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Elements - Deeper Blues */}
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(29,78,216,0.25)_0%,transparent_60%)]"
          style={{ y: y1 }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(30,64,175,0.2)_0%,transparent_60%)]"
          style={{ y: y2 }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1)_0%,transparent_70%)]"
        />
        
        <div className="container mx-auto px-6 lg:pr-96 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30">
                <Bot className="h-8 w-8" />
              </div>
              <span className="text-4xl font-bold text-white">Recruit AI</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Hire smarter,
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-indigo-500 bg-clip-text text-transparent">
                not harder
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform your hiring process with AI-powered candidate screening, smart matching, 
              and automated workflows. Find the perfect candidates 10x faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
                size="lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => scrollToSection('demo')}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8 py-4 text-lg"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </motion.div>
          

        </div>
        
        {/* Scroll Indicator - At Very Bottom of Screen */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 text-slate-500 cursor-pointer hover:text-blue-400 transition-all duration-300 group"
            onClick={() => scrollToSection('features')}
          >
            <span className="text-xs font-medium group-hover:text-blue-300 transition-colors">Scroll to explore</span>
            <div className="flex flex-col items-center gap-0">
              <ChevronDown className="h-3 w-3 opacity-60" />
              <ChevronDown className="h-3 w-3 opacity-40 -mt-1" />
              <ChevronDown className="h-3 w-3 opacity-20 -mt-1" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6 lg:pr-96">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need to hire better
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our AI-powered platform streamlines every step of your hiring process, 
              from initial screening to final decision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          {feature.stat}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:pr-96">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              Why Choose RecruitAI
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transform your hiring results
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 mx-auto mb-4">
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6 lg:pr-96">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              See It In Action
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Watch RecruitAI in action
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
              See how leading companies are using RecruitAI to revolutionize their hiring process
            </p>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 mx-auto mb-4">
                    <Play className="h-10 w-10 ml-1" />
                  </div>
                  <p className="text-slate-300">Demo video coming soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:pr-96">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              Customer Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by hiring teams worldwide
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-blue-400 text-blue-400" />
                      ))}
                    </div>
                    <p className="text-slate-300 mb-6 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-slate-400 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
        <div className="container mx-auto px-6 lg:pr-96 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to revolutionize your hiring?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Join thousands of companies already using RecruitAI to find better candidates faster.
            </p>
            
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
              size="lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-slate-400 mt-4">No credit card required • Setup in 2 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-6 lg:pr-96">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">Recruit AI</span>
            </div>
            
            <div className="flex items-center gap-6 text-slate-400">
              <span>© 2024 RecruitAI. All rights reserved.</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
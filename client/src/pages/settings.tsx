import { useState } from "react";
import {
  Settings,
  Building,
  User,
  Bell,
  Palette,
  LogOut,
  Save,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [userName, setUserName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    interviewReminders: true,
    weeklyDigest: false,
    candidateUpdates: true,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Settings saved!",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-gray-900">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-settings-title">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold" data-testid="text-user-name">{userName}</h3>
                  <p className="text-sm text-muted-foreground">{user?.role || "HR Manager"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company
              </CardTitle>
              <CardDescription>
                Your organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  data-testid="input-company"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Healthcare"
                    data-testid="input-industry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Input
                    id="size"
                    placeholder="e.g., 20-50 employees"
                    data-testid="input-size"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                  data-testid="switch-email-alerts"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded before scheduled interviews
                  </p>
                </div>
                <Switch
                  checked={notifications.interviewReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, interviewReminders: checked })
                  }
                  data-testid="switch-interview-reminders"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Candidate Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when candidate status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.candidateUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, candidateUpdates: checked })
                  }
                  data-testid="switch-candidate-updates"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of hiring activity
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyDigest: checked })
                  }
                  data-testid="switch-weekly-digest"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Recruit AI looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground capitalize">{theme}</span>
                  <ThemeToggle />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex items-center justify-between pt-4"
        >
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
          <Button className="gap-2" onClick={handleSaveProfile} data-testid="button-save">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, ClipboardList, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginPage from "@/pages/LoginPage";
import CandidateDashboard from "@/pages/CandidateDashboard";
import InterviewPage from "@/pages/InterviewPage";
import ReportPage from "@/pages/ReportPage";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";

const candidateItems = [
  { title: "Dashboard", url: "/candidate", icon: LayoutDashboard },
  { title: "My Interviews", url: "/candidate/interviews", icon: ClipboardList },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Questions", url: "/admin/questions", icon: ClipboardList },
  { title: "Reports", url: "/admin/reports", icon: FileText },
];

function AppSidebar({ role }: { role: "candidate" | "admin" }) {
  const [location] = useLocation();
  const items = role === "candidate" ? candidateItems : adminItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-3">
            AI Interview System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" data-testid="link-settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" data-testid="link-logout">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function DashboardLayout({ children, role }: { children: React.ReactNode; role: "candidate" | "admin" }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={role} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b gap-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      
      <Route path="/candidate">
        <DashboardLayout role="candidate">
          <CandidateDashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/candidate/interview/:id">
        <DashboardLayout role="candidate">
          <InterviewPage />
        </DashboardLayout>
      </Route>
      
      <Route path="/candidate/report/:id">
        <DashboardLayout role="candidate">
          <ReportPage />
        </DashboardLayout>
      </Route>
      
      <Route path="/admin">
        <DashboardLayout role="admin">
          <AdminDashboard />
        </DashboardLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

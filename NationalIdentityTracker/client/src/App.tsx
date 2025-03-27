import { Route, Switch, useLocation } from "wouter";
import { useEffect, ComponentType } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Settings from "@/pages/settings";
import Notifications from "@/pages/notifications";
import Docs from "@/pages/docs";
import { useAuth } from "@/hooks/use-auth";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Header from "@/components/layout/Header";

// ProtectedRoute component
function ProtectedRoute({ component: Component, ...rest }: { component: ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Use useEffect to redirect instead of doing it during render
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Only render the component if authenticated
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return <Component {...rest} />;
}

// AuthRoute component (redirects to home if authenticated)
function AuthRoute({ component: Component, ...rest }: { component: ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Use useEffect to redirect instead of doing it during render
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Only render the component if not authenticated
  if (isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return <Component {...rest} />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Check if current route is auth page (login or signup)
  const isAuthPage = location === "/login" || location === "/signup";
  
  return (
    <>
      {isAuthenticated && !isAuthPage && <Header />}
      
      <Switch>
        <Route path="/login" component={(props) => <AuthRoute component={Login} {...props} />} />
        <Route path="/signup" component={(props) => <AuthRoute component={Signup} {...props} />} />
        <Route path="/" component={(props) => <ProtectedRoute component={Home} {...props} />} />
        <Route path="/services" component={(props) => <ProtectedRoute component={Services} {...props} />} />
        <Route path="/settings" component={(props) => <ProtectedRoute component={Settings} {...props} />} />
        <Route path="/notifications" component={(props) => <ProtectedRoute component={Notifications} {...props} />} />
        <Route path="/docs" component={(props) => <ProtectedRoute component={Docs} {...props} />} />
        <Route component={NotFound} />
      </Switch>
      
      {isAuthenticated && !isAuthPage && <BottomNavigation />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppRoutes />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

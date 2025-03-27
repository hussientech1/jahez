import { Link, useLocation } from "wouter";
import { 
  Home, 
  Settings, 
  Bell, 
  FileText, 
  Briefcase 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/services", label: "Services", icon: Briefcase },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/notifications", label: "Alerts", icon: Bell },
    { path: "/docs", label: "Docs", icon: FileText },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <nav className="container mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "flex flex-col items-center",
                  location === item.path 
                    ? "text-primary dark:text-primary" 
                    : "text-muted-foreground hover:text-foreground transition-colors"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

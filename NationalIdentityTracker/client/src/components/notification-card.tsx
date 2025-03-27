import { useContext } from "react";
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Notification } from "@shared/schema";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

interface NotificationCardProps {
  notification: Notification;
}

export default function NotificationCard({ notification }: NotificationCardProps) {
  // Get border color based on notification type
  const getBorderColor = () => {
    switch (notification.type) {
      case "info":
        return "border-primary dark:border-primary-light";
      case "success":
        return "border-success";
      case "warning":
        return "border-warning";
      case "error":
        return "border-destructive";
      default:
        return "border-primary dark:border-primary-light";
    }
  };

  // Get background color based on notification type
  const getBackgroundColor = () => {
    switch (notification.type) {
      case "info":
        return "bg-primary/5 dark:bg-primary-dark/10";
      case "success":
        return "bg-success/5";
      case "warning":
        return "bg-warning/5";
      case "error":
        return "bg-destructive/5";
      default:
        return "bg-primary/5 dark:bg-primary-dark/10";
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "info":
        return <Bell className="text-primary dark:text-primary-light" />;
      case "success":
        return <CheckCircle className="text-success" />;
      case "warning":
        return <AlertTriangle className="text-warning" />;
      case "error":
        return <AlertCircle className="text-destructive" />;
      default:
        return <Bell className="text-primary dark:text-primary-light" />;
    }
  };

  // Format the date/time
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, 'MMM d, h:mm a');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className={`border-l-4 ${getBorderColor()} ${getBackgroundColor()} p-4 rounded-r-lg`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-medium">{notification.title}</h3>
          <p className="text-muted-foreground text-sm">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDate(new Date(notification.createdAt))}
          </p>
        </div>
      </div>
    </div>
  );
}

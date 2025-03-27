import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { LanguageContext } from "@/context/LanguageContext";
import { 
  RefreshCw, 
  Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NotificationCard from "@/components/notification-card";
import { Notification } from "@shared/schema";

export default function Notifications() {
  const { t } = useContext(LanguageContext);

  // Fetch notifications
  const { 
    data: notifications = [], 
    isLoading: isLoadingNotifications,
    refetch,
    isRefetching
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('notifications.title')}</h2>
              <div className="flex items-center">
                <Button variant="ghost" size="icon">
                  <Filter className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {isLoadingNotifications ? (
              <div className="space-y-4">
                <div className="border-l-4 border-primary p-4 rounded-r-lg h-24 animate-pulse" />
                <div className="border-l-4 border-primary p-4 rounded-r-lg h-24 animate-pulse" />
                <div className="border-l-4 border-primary p-4 rounded-r-lg h-24 animate-pulse" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard 
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { useContext, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeContext } from "@/context/ThemeContext";
import { LanguageContext } from "@/context/LanguageContext";
import { 
  User as UserIcon, 
  Globe, 
  Moon, 
  Bell,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FaqItem from "@/components/faq-item";

export default function Settings() {
  const { user, updateUserSettings, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // FAQ items - could be fetched from API in a real app
  const faqItems = [
    {
      question: "How do I renew my passport?",
      answer: "To renew your passport, go to the Services screen and select \"Passport Renewal\" from the service type dropdown. You'll need to pay the required fees and get an invoice number before completing the application."
    },
    {
      question: "How long does document processing take?",
      answer: "Standard processing takes 5-7 working days. Emergency applications are processed within 24-48 hours. You can track the status of your application in the Notifications screen."
    },
    {
      question: "How do I change my personal information?",
      answer: "You can update your phone number through the Edit Profile section. For changes to other personal information like name or date of birth, please contact customer service with supporting documentation."
    }
  ];

  // Handle notifications toggle
  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    toast({
      title: checked ? "Notifications enabled" : "Notifications disabled",
      description: checked 
        ? "You will receive notifications for application updates" 
        : "You will not receive notifications for application updates",
    });
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6">{t('settings.title')}</h2>
            
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="border-b border-border pb-6">
                <div className="flex items-center mb-4">
                  <Avatar className="w-16 h-16 mr-4">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{user?.fullName}</h3>
                    <p className="text-muted-foreground text-sm">{user?.nationalNumber}</p>
                  </div>
                </div>
                
                <Button 
                  variant="default"
                  className="flex items-center"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t('settings.edit_profile')}
                </Button>
              </div>
              
              {/* Preferences Section */}
              <div className="border-b border-border pb-6">
                <h3 className="font-medium text-lg mb-4">{t('settings.preferences')}</h3>
                
                <div className="space-y-4">
                  {/* Language */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.language')}</p>
                      <p className="text-muted-foreground text-sm">{t('settings.language_desc')}</p>
                    </div>
                    <Select
                      value={language}
                      onValueChange={(value) => setLanguage(value as "en" | "ar")}
                    >
                      <SelectTrigger className="w-[120px]">
                        <div className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Language" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Theme */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.theme')}</p>
                      <p className="text-muted-foreground text-sm">{t('settings.theme_desc')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">
                        {theme === "light" ? "Light" : "Dark"}
                      </span>
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t('settings.notifications')}</p>
                      <p className="text-muted-foreground text-sm">{t('settings.notifications_desc')}</p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={handleNotificationsChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* FAQ Section */}
              <div className="border-b border-border pb-6">
                <h3 className="font-medium text-lg mb-4">{t('settings.faq')}</h3>
                
                <div className="space-y-3">
                  {faqItems.map((faq, index) => (
                    <FaqItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
              
              {/* Support Section */}
              <div>
                <h3 className="font-medium text-lg mb-4">{t('settings.support')}</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {t('settings.contact_support')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('settings.user_guide')}
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

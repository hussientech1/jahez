import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Simple translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Authentication
    "login.title": "Login to your account",
    "login.national_id": "National ID",
    "login.password": "Password",
    "login.forgot_password": "Forgot Password?",
    "login.login_button": "Login",
    "login.no_account": "Don't have an account?",
    "login.sign_up": "Sign Up",
    
    // Home Screen
    "home.welcome": "Welcome",
    "home.your_documents": "Your Documents",
    "home.view_all": "View all",
    "home.recent_applications": "Recent Applications",
    
    // Services Screen
    "services.title": "Government Services",
    "services.service_type": "Service Type",
    "services.select_service": "Select a service",
    "services.appointment_location": "Appointment Location",
    "services.select_office": "Select office location",
    "services.invoice_number": "Invoice Number",
    "services.invoice_hint": "Enter the 10-digit invoice number from your payment receipt",
    "services.applicant_confirmation": "Applicant Confirmation",
    "services.full_name": "Full Name",
    "services.national_id": "National ID",
    "services.emergency": "This is an emergency application",
    "services.confirm_button": "Confirm Application",
    
    // Settings Screen
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.edit_profile": "Edit Profile",
    "settings.preferences": "Preferences",
    "settings.language": "Language",
    "settings.language_desc": "Choose your preferred language",
    "settings.theme": "Theme",
    "settings.theme_desc": "Choose light or dark theme",
    "settings.notifications": "Notifications",
    "settings.notifications_desc": "Receive application status updates",
    "settings.faq": "Frequently Asked Questions",
    "settings.support": "Support",
    "settings.contact_support": "Contact Support",
    "settings.user_guide": "User Guide",
    
    // Notifications Screen
    "notifications.title": "Notifications",
    
    // Docs Screen
    "docs.title": "Official Documents",
    "docs.share": "Share",
    "docs.download": "Download",
    
    // Common
    "common.expires": "Expires",
    "common.applied": "Applied",
    "common.pending": "Pending",
    "common.approved": "Approved",
    "common.rejected": "Rejected",
    "common.active": "Active",
    "common.expired": "Expired",
  },
  ar: {
    // Authentication
    "login.title": "تسجيل الدخول إلى حسابك",
    "login.national_id": "الرقم الوطني",
    "login.password": "كلمة المرور",
    "login.forgot_password": "نسيت كلمة المرور؟",
    "login.login_button": "تسجيل الدخول",
    "login.no_account": "ليس لديك حساب؟",
    "login.sign_up": "إنشاء حساب",
    
    // Home Screen
    "home.welcome": "مرحباً",
    "home.your_documents": "وثائقك",
    "home.view_all": "عرض الكل",
    "home.recent_applications": "الطلبات الأخيرة",
    
    // Services Screen
    "services.title": "الخدمات الحكومية",
    "services.service_type": "نوع الخدمة",
    "services.select_service": "اختر الخدمة",
    "services.appointment_location": "موقع الموعد",
    "services.select_office": "اختر موقع المكتب",
    "services.invoice_number": "رقم الفاتورة",
    "services.invoice_hint": "أدخل رقم الفاتورة المكون من 10 أرقام من إيصال الدفع",
    "services.applicant_confirmation": "تأكيد مقدم الطلب",
    "services.full_name": "الاسم الكامل",
    "services.national_id": "الرقم الوطني",
    "services.emergency": "هذا طلب طارئ",
    "services.confirm_button": "تأكيد الطلب",
    
    // Settings Screen
    "settings.title": "الإعدادات",
    "settings.profile": "الملف الشخصي",
    "settings.edit_profile": "تعديل الملف الشخصي",
    "settings.preferences": "التفضيلات",
    "settings.language": "اللغة",
    "settings.language_desc": "اختر لغتك المفضلة",
    "settings.theme": "المظهر",
    "settings.theme_desc": "اختر الوضع الفاتح أو الداكن",
    "settings.notifications": "الإشعارات",
    "settings.notifications_desc": "استلام تحديثات حالة الطلب",
    "settings.faq": "الأسئلة الشائعة",
    "settings.support": "الدعم",
    "settings.contact_support": "الاتصال بالدعم",
    "settings.user_guide": "دليل المستخدم",
    
    // Notifications Screen
    "notifications.title": "الإشعارات",
    
    // Docs Screen
    "docs.title": "الوثائق الرسمية",
    "docs.share": "مشاركة",
    "docs.download": "تنزيل",
    
    // Common
    "common.expires": "تنتهي",
    "common.applied": "تم التقديم",
    "common.pending": "قيد الانتظار",
    "common.approved": "تمت الموافقة",
    "common.rejected": "مرفوض",
    "common.active": "نشط",
    "common.expired": "منتهي الصلاحية",
  }
};

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { user, updateUserSettings, isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Check for user preference first
    if (user?.language as Language) return user.language as Language;
    
    // Check for saved language in localStorage
    const savedLang = localStorage.getItem("language");
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      return savedLang as Language;
    }
    
    return "en"; // Default to English
  });

  useEffect(() => {
    // Set document direction based on language
    const dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  useEffect(() => {
    // Update language when user changes
    if (user && (user.language === "en" || user.language === "ar")) {
      setLanguageState(user.language as Language);
    }
  }, [user]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    // Update user preference if authenticated
    if (isAuthenticated) {
      updateUserSettings({ language: lang });
    }
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

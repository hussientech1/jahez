import { useState, useContext } from "react";
import { 
  Share2, 
  Download,
  FileText,
  Plane,
  Baby,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";
import { LanguageContext } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

interface DocumentCardProps {
  document: Document;
  preview?: boolean;
}

export default function DocumentCard({ document, preview = false }: DocumentCardProps) {
  const { user } = useAuth();
  const { t } = useContext(LanguageContext);
  const [showQrCode, setShowQrCode] = useState(false);

  // Function to get document icon based on type
  const getDocumentIcon = () => {
    switch (document.type.toLowerCase()) {
      case "passport":
        return <Plane className="text-primary h-6 w-6" />;
      case "id card":
      case "national id card":
        return <FileText className="text-primary h-6 w-6" />;
      case "birth certificate":
        return <Baby className="text-primary h-6 w-6" />;
      default:
        return <FileText className="text-primary h-6 w-6" />;
    }
  };

  // Format dates
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'dd MMM yyyy');
    }
    return format(date, 'dd MMM yyyy');
  };

  // Get status class
  const getStatusClass = () => {
    switch (document.status?.toLowerCase()) {
      case "active":
        return "bg-success/20 text-success";
      case "expired":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  // QR code data (would be generated from server in a real app)
  const qrCodeDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect x="0" y="0" width="120" height="120" fill="white"/><g fill="black"><rect x="10" y="10" width="10" height="10"/><rect x="20" y="10" width="10" height="10"/><rect x="30" y="10" width="10" height="10"/><rect x="40" y="10" width="10" height="10"/><rect x="50" y="10" width="10" height="10"/><rect x="60" y="10" width="10" height="10"/><rect x="70" y="10" width="10" height="10"/><rect x="10" y="20" width="10" height="10"/><rect x="70" y="20" width="10" height="10"/><rect x="10" y="30" width="10" height="10"/><rect x="30" y="30" width="10" height="10"/><rect x="50" y="30" width="10" height="10"/><rect x="70" y="30" width="10" height="10"/><rect x="10" y="40" width="10" height="10"/><rect x="30" y="40" width="10" height="10"/><rect x="50" y="40" width="10" height="10"/><rect x="70" y="40" width="10" height="10"/><rect x="10" y="50" width="10" height="10"/><rect x="30" y="50" width="10" height="10"/><rect x="50" y="50" width="10" height="10"/><rect x="70" y="50" width="10" height="10"/><rect x="10" y="60" width="10" height="10"/><rect x="70" y="60" width="10" height="10"/><rect x="10" y="70" width="10" height="10"/><rect x="20" y="70" width="10" height="10"/><rect x="30" y="70" width="10" height="10"/><rect x="40" y="70" width="10" height="10"/><rect x="50" y="70" width="10" height="10"/><rect x="60" y="70" width="10" height="10"/><rect x="70" y="70" width="10" height="10"/></g></svg>`;

  // If it's a preview (for home screen), show simplified version
  if (preview) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 flex">
        <div className="mr-4 bg-primary/10 rounded-lg p-3 flex items-center justify-center">
          {getDocumentIcon()}
        </div>
        <div>
          <h4 className="font-medium">{document.type}</h4>
          <p className="text-sm text-muted-foreground">
            {t('common.expires')}: {formatDate(document.expiryDate)}
          </p>
          <div className="mt-2">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-primary"
              onClick={() => setShowQrCode(!showQrCode)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <div className="flex items-center">
          {getDocumentIcon()}
          <h3 className="font-medium ml-2">{document.type}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass()}`}>
          {document.status || t('common.active')}
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('services.full_name')}</p>
            <p className="font-medium">{user?.fullName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{document.type === "Passport" ? "Passport Number" : t('services.national_id')}</p>
            <p className="font-medium">{document.documentNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date of Issue</p>
            <p className="font-medium">{formatDate(document.issuedDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date of Expiry</p>
            <p className="font-medium">{formatDate(document.expiryDate)}</p>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <div className="w-32 h-32 bg-white p-2 border border-border flex items-center justify-center">
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code" 
              className="w-full h-full"
            />
          </div>
        </div>
        
        <div className="flex justify-between space-x-2">
          <Button
            variant="default"
            className="flex-1 py-2 flex items-center justify-center"
          >
            <Share2 className="h-4 w-4 mr-1" />
            {t('docs.share')}
          </Button>
          <Button
            variant="outline"
            className="flex-1 py-2 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-1" />
            {t('docs.download')}
          </Button>
        </div>
      </div>
    </div>
  );
}

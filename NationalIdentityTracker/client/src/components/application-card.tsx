import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";
import { format } from "date-fns";
import { Application } from "@shared/schema";

interface ApplicationCardProps {
  application: Application & {
    serviceName?: string;
    officeName?: string;
  };
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const { t } = useContext(LanguageContext);
  
  // Format date
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'dd MMM yyyy');
    }
    return format(date, 'dd MMM yyyy');
  };
  
  // Get status badge styling
  const getStatusBadgeClass = () => {
    switch (application.status.toLowerCase()) {
      case "pending":
        return "bg-warning/20 text-warning";
      case "approved":
        return "bg-success/20 text-success";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{application.serviceName || `Application #${application.id}`}</h4>
          <p className="text-sm text-muted-foreground">
            {t('common.applied')}: {formatDate(application.appliedAt)}
          </p>
          {application.officeName && (
            <p className="text-sm text-muted-foreground mt-1">
              Location: {application.officeName}
            </p>
          )}
          {application.status === "rejected" && application.rejectionReason && (
            <p className="text-sm text-destructive mt-1">
              Reason: {application.rejectionReason}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </div>
      </div>
    </div>
  );
}

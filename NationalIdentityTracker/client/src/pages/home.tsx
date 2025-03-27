import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LanguageContext } from "@/context/LanguageContext";
import { ChevronRight } from "lucide-react";
import DocumentCard from "@/components/document-card";
import ApplicationCard from "@/components/application-card";
import { Document, Application } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const { t } = useContext(LanguageContext);

  // Fetch user documents
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/user/docs'],
  });

  // Fetch user applications
  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <div className="bg-card rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {t('home.welcome')}, <span>{user?.fullName}</span>
          </h2>
          <p className="text-muted-foreground">
            {t('login.national_id')}: <span>{user?.nationalNumber}</span>
          </p>
        </div>
        
        {/* Documents Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{t('home.your_documents')}</h3>
            <Link href="/docs" className="text-primary flex items-center text-sm">
              {t('home.view_all')} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {isLoadingDocuments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-32 animate-pulse" />
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-32 animate-pulse" />
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.slice(0, 2).map((document) => (
                <DocumentCard key={document.id} document={document} preview />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
              <p className="text-muted-foreground">No documents found</p>
            </div>
          )}
        </section>
        
        {/* Recent Applications Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{t('home.recent_applications')}</h3>
            <Link href="/notifications" className="text-primary flex items-center text-sm">
              {t('home.view_all')} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {isLoadingApplications ? (
            <div className="space-y-4">
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-20 animate-pulse" />
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 h-20 animate-pulse" />
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.slice(0, 3).map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
              <p className="text-muted-foreground">No recent applications</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { LanguageContext } from "@/context/LanguageContext";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DocumentCard from "@/components/document-card";
import { Document } from "@shared/schema";

export default function Docs() {
  const { t } = useContext(LanguageContext);

  // Fetch user documents
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/user/docs'],
  });

  return (
    <div className="min-h-screen pb-20 bg-background">
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t('docs.title')}</h2>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted rounded-lg h-96 animate-pulse" />
                <div className="bg-muted rounded-lg h-96 animate-pulse" />
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No documents found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your documents will appear here after your applications are approved
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LanguageContext } from "@/context/LanguageContext";
import { Service, Office } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const servicesFormSchema = z.object({
  serviceId: z.string({
    required_error: "Please select a service",
  }),
  officeId: z.string({
    required_error: "Please select an office location",
  }),
  invoiceNumber: z.string().regex(/^\d{10}$/, {
    message: "Invoice number must be 10 digits",
  }),
  isEmergency: z.boolean().default(false),
});

type ServicesFormValues = z.infer<typeof servicesFormSchema>;

export default function Services() {
  const { user } = useAuth();
  const { t } = useContext(LanguageContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServicesFormValues>({
    resolver: zodResolver(servicesFormSchema),
    defaultValues: {
      serviceId: "",
      officeId: "",
      invoiceNumber: "",
      isEmergency: false,
    },
  });

  // Fetch available services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Fetch office locations
  const { data: offices = [], isLoading: isLoadingOffices } = useQuery<Office[]>({
    queryKey: ['/api/offices'],
  });

  // Mutation for applying to a service
  const applyMutation = useMutation({
    mutationFn: async (data: ServicesFormValues) => {
      const response = await apiRequest("POST", "/api/services/apply", {
        serviceId: parseInt(data.serviceId),
        officeId: parseInt(data.officeId),
        invoiceNumber: data.invoiceNumber,
        isEmergency: data.isEmergency,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Show success toast
      toast({
        title: "Application submitted successfully",
        description: "Your application has been submitted and is being processed",
        variant: "default",
      });
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
      });
    },
  });

  async function onSubmit(data: ServicesFormValues) {
    setIsSubmitting(true);
    try {
      await applyMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6">{t('services.title')}</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('services.service_type')}</FormLabel>
                      <Select 
                        disabled={isLoadingServices} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('services.select_service')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="officeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('services.appointment_location')}</FormLabel>
                      <Select 
                        disabled={isLoadingOffices} 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('services.select_office')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {offices.map((office) => (
                            <SelectItem key={office.id} value={office.id.toString()}>
                              {office.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('services.invoice_number')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter 10-digit invoice number" 
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('services.invoice_hint')}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-base font-medium mb-3">{t('services.applicant_confirmation')}</h3>
                  
                  <div className="bg-muted rounded p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">{t('services.full_name')}:</span>
                      <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('services.national_id')}:</span>
                      <span className="font-medium">{user?.nationalNumber}</span>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isEmergency"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t('services.emergency')}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    t('services.confirm_button')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

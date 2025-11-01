import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  contact_number: z.string().min(10, { message: "Please enter a valid contact number" }),
});

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationType: string;
}

export const ApplicationForm = ({ open, onOpenChange, applicationType }: ApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      contact_number: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to submit an application");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      application_type: applicationType,
      email: values.email,
      contact_number: values.contact_number,
    });

    if (error) {
      setIsSubmitting(false);
      toast.error("Failed to submit application", {
        description: error.message,
      });
      return;
    }

    // Send email notification to admin
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      await supabase.functions.invoke("send-application-email", {
        body: {
          applicationType,
          email: values.email,
          contactNumber: values.contact_number,
          userName: profile?.name || "Unknown User",
        },
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the submission if email fails
    }

    setIsSubmitting(false);

    toast.success("Application submitted successfully!", {
      description: "Our admin team will review your application soon.",
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for {applicationType}</DialogTitle>
          <DialogDescription>
            Please provide your contact information. We'll get back to you soon.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApplicationEmailRequest {
  applicationType: string;
  email: string;
  contactNumber: string;
  userName: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationType, email, contactNumber, userName }: ApplicationEmailRequest = await req.json();
    
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    
    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending application notification to admin: ${adminEmail}`);

    const emailResponse = await resend.emails.send({
      from: "FitApp Applications <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New ${applicationType} Application Received`,
      html: `
        <h1>New ${applicationType} Application</h1>
        <p>A new application has been submitted with the following details:</p>
        <ul>
          <li><strong>Application Type:</strong> ${applicationType}</li>
          <li><strong>Applicant Name:</strong> ${userName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Contact Number:</strong> ${contactNumber}</li>
        </ul>
        <p>Please review this application in the admin dashboard.</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-application-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

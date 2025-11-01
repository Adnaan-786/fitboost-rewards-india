import { useState } from "react";
import { ArrowLeft, Dumbbell, CreditCard, Users, Handshake, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeonButton } from "@/components/ui/neon-button";
import { ApplicationForm } from "@/components/apply/ApplicationForm";

const Apply = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const applicationOptions = [
    {
      id: "gym",
      title: "Apply for Gym Partnership",
      description: "List your gym on our platform and reach thousands of fitness enthusiasts",
      icon: Dumbbell,
    },
    {
      id: "subscription",
      title: "Apply for Subscription Plan",
      description: "Get access to premium features and exclusive content",
      icon: CreditCard,
    },
    {
      id: "trainer",
      title: "Apply as Trainer",
      description: "Share your expertise and train members on our platform",
      icon: Users,
    },
    {
      id: "affiliate",
      title: "Apply for Affiliate Program",
      description: "Earn commissions by promoting our fitness platform",
      icon: Handshake,
    },
    {
      id: "sponsor",
      title: "Apply as Sponsor",
      description: "Partner with us to support the fitness community",
      icon: Award,
    },
  ];

  const handleApplication = (type: string) => {
    setSelectedType(type);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Join Our Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the option that best fits your goals
          </p>
        </div>

        <div className="space-y-6">
          {applicationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
                    <p className="text-muted-foreground mb-4">{option.description}</p>
                    <NeonButton
                      variant="solid"
                      size="default"
                      onClick={() => handleApplication(option.title)}
                    >
                      Apply Now
                    </NeonButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ApplicationForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          applicationType={selectedType}
        />
      </div>
    </div>
  );
};

export default Apply;

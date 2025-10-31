import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import TrainerDirectory from "@/components/trainers/TrainerDirectory";
import MyBookings from "@/components/trainers/MyBookings";
import TrainerMessages from "@/components/trainers/TrainerMessages";

const Trainers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="icon-gradient"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Personal Trainers</h1>
            <p className="text-muted-foreground">Find and connect with certified trainers</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="directory">Find Trainers</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <TrainerDirectory />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <MyBookings />
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <TrainerMessages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Trainers;

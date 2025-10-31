import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Conversation {
  id: string;
  trainer_id: string;
  last_message_at: string;
  trainer_profiles: {
    business_name: string;
    profile_image_url: string | null;
  } | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  read: boolean;
  created_at: string;
}

const TrainerMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      fetchConversations(user.id);
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("trainer_conversations")
        .select(`
          *,
          trainer_profiles(business_name, profile_image_url)
        `)
        .eq("client_id", userId)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("trainer_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("trainer_messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUserId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const conversation = conversations.find((c) => c.id === selectedConversation);
      if (!conversation) return;

      const { error } = await supabase.from("trainer_messages").insert({
        conversation_id: selectedConversation,
        sender_id: currentUserId,
        receiver_id: conversation.trainer_id,
        message_text: newMessage,
      });

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("trainer_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConversation);

      setNewMessage("");
      fetchMessages(selectedConversation);
      fetchConversations(currentUserId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading messages...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Conversations List */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conv.id
                      ? "bg-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <Avatar>
                    <AvatarImage src={conv.trainer_profiles?.profile_image_url || ""} />
                    <AvatarFallback>
                      {conv.trainer_profiles?.business_name?.[0] || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">
                      {conv.trainer_profiles?.business_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.last_message_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="lg:col-span-2 backdrop-blur-sm bg-card/80">
        <CardHeader>
          <CardTitle>
            {selectedConversation
              ? conversations.find((c) => c.id === selectedConversation)
                  ?.trainer_profiles?.business_name
              : "Select a conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] flex flex-col">
          {selectedConversation ? (
            <>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === currentUserId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.message_text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerMessages;

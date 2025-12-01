import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, MapPin, Calendar, Users, Trophy, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EventMap from '@/components/EventMap';
import { z } from 'zod';

// Validation schema for event creation
const eventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  event_type: z.enum(['Competition', 'Workshop', 'Meetup', 'Challenge']),
  location_name: z.string().min(2, 'Location name is required').max(200, 'Location name must be less than 200 characters'),
  location_address: z.string().min(5, 'Address is required').max(500, 'Address must be less than 500 characters'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').nullable().optional(),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').nullable().optional(),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().optional(),
  registration_deadline: z.string().optional(),
  max_participants: z.number().int().positive('Max participants must be a positive number').max(100000, 'Max participants cannot exceed 100,000').nullable().optional(),
  entry_fee: z.number().int().min(0, 'Entry fee cannot be negative').max(1000000, 'Entry fee cannot exceed 1,000,000').default(0),
  prize_pool: z.number().int().min(0, 'Prize pool cannot be negative').max(100000000, 'Prize pool is too large').nullable().optional(),
  image_url: z.string().url('Please enter a valid URL').max(2000, 'URL is too long').optional().or(z.literal(''))
});

type EventFormData = z.infer<typeof eventSchema>;

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Competition',
    location_name: '',
    location_address: '',
    latitude: '',
    longitude: '',
    event_date: '',
    event_time: '',
    registration_deadline: '',
    max_participants: '',
    entry_fee: '0',
    prize_pool: '',
    image_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchProfile();
    }
  }, [user]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        profiles (name)
      `)
      .eq('status', 'upcoming')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });
    
    if (data) setEvents(data);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) setProfile(data);
  };

  const validateForm = (): EventFormData | null => {
    setFormErrors({});
    
    // Convert form strings to proper types for validation
    const dataToValidate = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      event_type: formData.event_type as 'Competition' | 'Workshop' | 'Meetup' | 'Challenge',
      location_name: formData.location_name.trim(),
      location_address: formData.location_address.trim(),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      event_date: formData.event_date,
      event_time: formData.event_time || undefined,
      registration_deadline: formData.registration_deadline || undefined,
      max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : null,
      entry_fee: formData.entry_fee ? parseInt(formData.entry_fee, 10) : 0,
      prize_pool: formData.prize_pool ? parseInt(formData.prize_pool, 10) : null,
      image_url: formData.image_url.trim() || undefined
    };

    const result = eventSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return null;
    }
    
    return result.data;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.verified) {
      toast({
        variant: 'destructive',
        title: 'Verification Required',
        description: 'Only verified users can create events.'
      });
      return;
    }

    const validatedData = validateForm();
    if (!validatedData) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form.'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('events')
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        event_type: validatedData.event_type,
        location_name: validatedData.location_name,
        location_address: validatedData.location_address,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        event_date: validatedData.event_date,
        event_time: validatedData.event_time || null,
        registration_deadline: validatedData.registration_deadline || null,
        max_participants: validatedData.max_participants,
        entry_fee: validatedData.entry_fee,
        prize_pool: validatedData.prize_pool,
        image_url: validatedData.image_url || null,
        organizer_id: user?.id
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating event',
        description: error.message
      });
    } else {
      toast({
        title: 'Event created!',
        description: 'Your event has been published successfully.'
      });
      setIsCreateDialogOpen(false);
      fetchEvents();
      setFormData({
        title: '',
        description: '',
        event_type: 'Competition',
        location_name: '',
        location_address: '',
        latitude: '',
        longitude: '',
        event_date: '',
        event_time: '',
        registration_deadline: '',
        max_participants: '',
        entry_fee: '0',
        prize_pool: '',
        image_url: ''
      });
      setFormErrors({});
    }
    
    setLoading(false);
  };

  const handleRegister = async (eventId: string) => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to register for events.'
      });
      return;
    }

    // First check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingReg) {
      toast({
        variant: 'destructive',
        title: 'Already Registered',
        description: 'You are already registered for this event.'
      });
      return;
    }

    // Get current event data
    const { data: eventData, error: fetchError } = await supabase
      .from('events')
      .select('current_participants, max_participants')
      .eq('id', eventId)
      .single();

    if (fetchError || !eventData) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Unable to fetch event details.'
      });
      return;
    }

    const newCount = (eventData.current_participants || 0) + 1;

    // Try to increment participant count - database constraint prevents overflow
    const { error: incError } = await supabase
      .from('events')
      .update({ current_participants: newCount })
      .eq('id', eventId);

    if (incError) {
      // Check if it's a constraint violation (event full)
      if (incError.message?.includes('check_participants') || incError.code === '23514') {
        toast({
          variant: 'destructive',
          title: 'Event Full',
          description: 'This event has reached maximum capacity.'
        });
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: incError.message
      });
      return;
    }

    // Now insert the registration
    const { error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id
      });

    if (regError) {
      // Rollback: decrement the count
      await supabase
        .from('events')
        .update({ 
          current_participants: Math.max(0, newCount - 1)
        })
        .eq('id', eventId);

      if (regError.code === '23505') {
        toast({
          variant: 'destructive',
          title: 'Already Registered',
          description: 'You are already registered for this event.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: regError.message
        });
      }
      return;
    }

    toast({
      title: 'Registration Successful!',
      description: 'You are now registered for this event.'
    });
    fetchEvents();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Competition': return 'bg-red-500';
      case 'Workshop': return 'bg-blue-500';
      case 'Meetup': return 'bg-green-500';
      case 'Challenge': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Fitness Events & Competitions</h1>
          </div>
          
          {profile?.verified && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a fitness event or competition
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={200}
                        required
                      />
                      {formErrors.title && <p className="text-sm text-destructive mt-1">{formErrors.title}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        maxLength={2000}
                      />
                      {formErrors.description && <p className="text-sm text-destructive mt-1">{formErrors.description}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="event_type">Event Type *</Label>
                      <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Competition">Competition</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Meetup">Meetup</SelectItem>
                          <SelectItem value="Challenge">Challenge</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.event_type && <p className="text-sm text-destructive mt-1">{formErrors.event_type}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="location_name">Location Name *</Label>
                      <Input
                        id="location_name"
                        value={formData.location_name}
                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                        maxLength={200}
                        required
                      />
                      {formErrors.location_name && <p className="text-sm text-destructive mt-1">{formErrors.location_name}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="location_address">Address *</Label>
                      <Input
                        id="location_address"
                        value={formData.location_address}
                        onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                        maxLength={500}
                        required
                      />
                      {formErrors.location_address && <p className="text-sm text-destructive mt-1">{formErrors.location_address}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="latitude">Latitude (-90 to 90)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                      {formErrors.latitude && <p className="text-sm text-destructive mt-1">{formErrors.latitude}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="longitude">Longitude (-180 to 180)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                      {formErrors.longitude && <p className="text-sm text-destructive mt-1">{formErrors.longitude}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="event_date">Event Date *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        required
                      />
                      {formErrors.event_date && <p className="text-sm text-destructive mt-1">{formErrors.event_date}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="event_time">Event Time</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="registration_deadline">Registration Deadline</Label>
                      <Input
                        id="registration_deadline"
                        type="date"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="max_participants">Max Participants</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        max="100000"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      />
                      {formErrors.max_participants && <p className="text-sm text-destructive mt-1">{formErrors.max_participants}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
                      <Input
                        id="entry_fee"
                        type="number"
                        min="0"
                        max="1000000"
                        value={formData.entry_fee}
                        onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                      />
                      {formErrors.entry_fee && <p className="text-sm text-destructive mt-1">{formErrors.entry_fee}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="prize_pool">Prize Pool (₹)</Label>
                      <Input
                        id="prize_pool"
                        type="number"
                        min="0"
                        max="100000000"
                        value={formData.prize_pool}
                        onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                      />
                      {formErrors.prize_pool && <p className="text-sm text-destructive mt-1">{formErrors.prize_pool}</p>}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        maxLength={2000}
                      />
                      {formErrors.image_url && <p className="text-sm text-destructive mt-1">{formErrors.image_url}</p>}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Event'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {!profile?.verified && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4 flex items-center gap-3">
              <BadgeCheck className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-800">
                Want to organize events? Contact support to get verified as an event organizer!
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Events Map
            </CardTitle>
            <CardDescription>
              Explore upcoming fitness events and competitions near you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <EventMap events={events} onEventClick={(id) => setSelectedEventId(id)} />
            ) : (
              <div className="h-[450px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            Upcoming Events ({events.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id}
                id={`event-${event.id}`}
                className={`hover:shadow-lg transition-all ${
                  selectedEventId === event.id ? 'ring-2 ring-primary shadow-xl' : ''
                }`}
              >
                {event.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge className={`${getEventTypeColor(event.event_type)} text-white`}>
                      {event.event_type}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(event.event_date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location_name}</span>
                  </div>
                  
                  {event.max_participants && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.current_participants || 0} / {event.max_participants} registered</span>
                    </div>
                  )}
                  
                  {event.prize_pool > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                      <Trophy className="w-4 h-4" />
                      <span>₹{event.prize_pool.toLocaleString()} prize pool</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">
                      {event.entry_fee > 0 ? `₹${event.entry_fee} entry` : 'Free entry'}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => handleRegister(event.id)}
                      disabled={event.max_participants && event.current_participants >= event.max_participants}
                    >
                      {event.max_participants && event.current_participants >= event.max_participants 
                        ? 'Full' 
                        : 'Register Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {events.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">
                  Check back later for new fitness events and competitions!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events;

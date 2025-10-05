import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GymMap from '@/components/GymMap';

const Gyms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGyms();
    }
  }, [user]);

  const fetchGyms = async () => {
    const { data } = await supabase
      .from('gyms')
      .select('*')
      .order('rating', { ascending: false });
    
    if (data) setGyms(data);
  };

  const sortedGyms = [...gyms].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    } else if (sortBy === 'price-low') {
      const priceOrder = { '$': 1, '$$': 2, '$$$': 3 };
      return priceOrder[a.price_range as keyof typeof priceOrder] - priceOrder[b.price_range as keyof typeof priceOrder];
    } else if (sortBy === 'price-high') {
      const priceOrder = { '$': 1, '$$': 2, '$$$': 3 };
      return priceOrder[b.price_range as keyof typeof priceOrder] - priceOrder[a.price_range as keyof typeof priceOrder];
    }
    return 0;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-orange-600';
    if (rating >= 3.0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };

  const handleGymClick = (gymId: string) => {
    setSelectedGymId(gymId);
    // Scroll to the gym card
    const element = document.getElementById(`gym-${gymId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Find Gyms Near You</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Interactive Map
            </CardTitle>
            <CardDescription>
              Click on markers to view gym details. Colors indicate rating quality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gyms.length > 0 ? (
              <GymMap gyms={gyms} onGymClick={handleGymClick} />
            ) : (
              <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Loading gyms...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gym List Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            All Gyms ({gyms.length})
          </h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGyms.map((gym) => (
            <Card 
              key={gym.id}
              id={`gym-${gym.id}`}
              className={`hover:shadow-lg transition-all ${
                selectedGymId === gym.id ? 'ring-2 ring-primary shadow-xl scale-105' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{gym.name}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {gym.address}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{gym.price_range}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className={`w-5 h-5 fill-current ${getRatingColor(gym.rating)}`} />
                    <span className={`text-2xl font-bold ${getRatingColor(gym.rating)}`}>
                      {gym.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">/5</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getRatingColor(gym.rating)}
                  >
                    {getRatingBadge(gym.rating)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{gym.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {gym.amenities?.slice(0, 4).map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {gym.amenities?.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{gym.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleGymClick(gym.id)}
                >
                  View on Map
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {gyms.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No gyms found</h3>
              <p className="text-muted-foreground">Check back later for gym listings in your area.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Gyms;

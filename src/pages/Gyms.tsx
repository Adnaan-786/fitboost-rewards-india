import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Gyms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    if (user) {
      fetchGyms();
    }
  }, [user]);

  const fetchGyms = async () => {
    const { data } = await supabase
      .from('gyms')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setGyms(data);
  };

  const sortedGyms = [...gyms].sort((a, b) => {
    if (sortBy === 'price-low') {
      const priceOrder = { '$': 1, '$$': 2, '$$$': 3 };
      return priceOrder[a.price_range as keyof typeof priceOrder] - priceOrder[b.price_range as keyof typeof priceOrder];
    } else if (sortBy === 'price-high') {
      const priceOrder = { '$': 1, '$$': 2, '$$$': 3 };
      return priceOrder[b.price_range as keyof typeof priceOrder] - priceOrder[a.price_range as keyof typeof priceOrder];
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Find Gyms</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Map integration requires Mapbox token</p>
                <p className="text-sm text-muted-foreground">Add your Mapbox token to enable map view</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gyms near you</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Sort by Distance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedGyms.map((gym) => (
            <Card key={gym.id} className="hover:shadow-lg transition-shadow">
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
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold">{gym.rating}</span>
                  <span className="text-sm text-muted-foreground">/5</span>
                </div>
                <p className="text-sm text-muted-foreground">{gym.description}</p>
                <div className="flex flex-wrap gap-2">
                  {gym.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Gyms;

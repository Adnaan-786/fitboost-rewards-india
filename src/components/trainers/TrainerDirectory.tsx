import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Search, Award } from "lucide-react";
import { toast } from "sonner";

interface Trainer {
  id: string;
  business_name: string;
  bio: string | null;
  specialties: string[];
  certifications: string[];
  years_experience: number | null;
  profile_image_url: string | null;
  hourly_rate: number | null;
  location_city: string | null;
  location_state: string | null;
  rating: number;
  total_reviews: number;
  verified: boolean;
}

const TrainerDirectory = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterAndSortTrainers();
  }, [trainers, searchQuery, specialtyFilter, priceFilter, sortBy]);

  const fetchTrainers = async () => {
    try {
      const { data, error } = await supabase
        .from("trainer_profiles")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      setTrainers(data || []);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrainers = () => {
    let filtered = [...trainers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (trainer) =>
          trainer.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trainer.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trainer.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Specialty filter
    if (specialtyFilter !== "all") {
      filtered = filtered.filter((trainer) =>
        trainer.specialties.includes(specialtyFilter)
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter((trainer) => {
        if (!trainer.hourly_rate) return false;
        if (priceFilter === "budget" && trainer.hourly_rate <= 50) return true;
        if (priceFilter === "moderate" && trainer.hourly_rate > 50 && trainer.hourly_rate <= 100) return true;
        if (priceFilter === "premium" && trainer.hourly_rate > 100) return true;
        return false;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price-low") return (a.hourly_rate || 999) - (b.hourly_rate || 999);
      if (sortBy === "price-high") return (b.hourly_rate || 0) - (a.hourly_rate || 0);
      if (sortBy === "reviews") return (b.total_reviews || 0) - (a.total_reviews || 0);
      return 0;
    });

    setFilteredTrainers(filtered);
  };

  if (loading) {
    return <div className="text-center py-12">Loading trainers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="backdrop-blur-sm bg-card/80">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                <SelectItem value="Bodybuilding">Bodybuilding</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="Sports Training">Sports Training</SelectItem>
                <SelectItem value="Nutrition">Nutrition</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Budget ($0-$50/hr)</SelectItem>
                <SelectItem value="moderate">Moderate ($51-$100/hr)</SelectItem>
                <SelectItem value="premium">Premium ($100+/hr)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No trainers found matching your criteria
          </div>
        ) : (
          filteredTrainers.map((trainer) => (
            <Card
              key={trainer.id}
              className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all cursor-pointer"
              onClick={() => navigate(`/trainer/${trainer.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={trainer.profile_image_url || ""} />
                    <AvatarFallback>{trainer.business_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{trainer.business_name}</h3>
                      {trainer.verified && (
                        <Badge variant="default" className="bg-blue-500">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {trainer.location_city}, {trainer.location_state}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainer.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {trainer.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.slice(0, 3).map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {trainer.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{trainer.specialties.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{trainer.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({trainer.total_reviews})
                    </span>
                  </div>
                  {trainer.hourly_rate && (
                    <div className="flex items-center gap-1 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {trainer.hourly_rate}/hr
                    </div>
                  )}
                </div>

                <Button className="w-full mt-2">View Profile</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainerDirectory;

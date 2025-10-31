import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

const Store = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true });
    
    if (data) setProducts(data);
  };

  const handlePurchase = async (product: Product) => {
    if (!user) return;
    
    setLoading(true);
    
    // Get user's profile to check balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      toast({
        title: "Error",
        description: "Please complete your profile first",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create order
    const { error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
        total_price: product.price,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order Placed!",
        description: `Your order for ${product.name} has been placed successfully!`,
      });
    }
    
    setLoading(false);
  };

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">FitQuest Store</h1>
              <p className="text-sm text-muted-foreground">Premium gym merchandise</p>
            </div>
          </div>
          <Button variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products available</h3>
              <p className="text-muted-foreground">Check back soon for new merchandise!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{categoryProducts.length}</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">${product.price}</span>
                          <Badge variant="outline">{product.stock} in stock</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          className="w-full" 
                          onClick={() => handlePurchase(product)}
                          disabled={loading || product.stock === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Store;

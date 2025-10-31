import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, History, Calendar, Receipt, QrCode as QrCodeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const MyGym = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [membership, setMembership] = useState<any>(null);
  const [gym, setGym] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMembershipData();
    }
  }, [user]);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);

      // Fetch active membership
      const { data: membershipData } = await supabase
        .from('gym_memberships')
        .select('*, gyms(*)')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipData) {
        setMembership(membershipData);
        setGym(membershipData.gyms);

        // Fetch check-ins
        const { data: checkInsData } = await supabase
          .from('gym_check_ins')
          .select('*')
          .eq('membership_id', membershipData.id)
          .order('check_in_time', { ascending: false })
          .limit(20);

        if (checkInsData) setCheckIns(checkInsData);

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from('gym_payments')
          .select('*')
          .eq('membership_id', membershipData.id)
          .order('payment_date', { ascending: false });

        if (paymentsData) setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const handleRenew = () => {
    toast({
      title: 'Renew Membership',
      description: 'Redirecting to payment portal...',
    });
    // In a real app, this would redirect to a payment page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/gyms')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Gym Membership</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <QrCodeIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Membership</h3>
              <p className="text-muted-foreground mb-6">
                You don't have an active gym membership yet.
              </p>
              <Button onClick={() => navigate('/gyms')}>
                Find a Gym
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/gyms')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Gym Membership</h1>
          </div>
          <Badge className={getStatusColor(membership.status)}>
            {membership.status.toUpperCase()}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="card">
              <QrCodeIcon className="w-4 h-4 mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Receipt className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Digital Membership Card */}
          <TabsContent value="card" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital Membership Card</CardTitle>
                <CardDescription>
                  Scan this QR code at the gym entrance for check-in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center py-8">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <QRCodeSVG
                      value={membership.qr_code}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Membership ID: {membership.id.slice(0, 8)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gym Name</p>
                      <p className="font-semibold">{gym?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member</p>
                      <p className="font-semibold">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Plan Type</p>
                      <p className="font-semibold">{membership.plan_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(membership.status)}>
                        {membership.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gym Information */}
            <Card>
              <CardHeader>
                <CardTitle>Gym Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{gym?.address}</p>
                </div>
                {gym?.amenities && gym.amenities.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {gym.amenities.map((amenity: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Log */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Check-In History</CardTitle>
                <CardDescription>
                  Your recent gym visits ({checkIns.length} total check-ins)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkIns.length > 0 ? (
                  <div className="space-y-3">
                    {checkIns.map((checkIn) => (
                      <div
                        key={checkIn.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">
                              {format(new Date(checkIn.check_in_time), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(checkIn.check_in_time), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No check-ins yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Visit your gym and scan your membership card to check in
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Management */}
          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>Your current subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan Type</p>
                    <p className="text-2xl font-bold">{membership.plan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Price</p>
                    <p className="text-2xl font-bold">${membership.monthly_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {format(new Date(membership.start_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {membership.end_date ? 'End Date' : 'Renewal'}
                    </p>
                    <p className="font-medium">
                      {membership.end_date
                        ? format(new Date(membership.end_date), 'MMMM d, yyyy')
                        : 'Auto-renewing'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleRenew} className="flex-1">
                    Renew Membership
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  Change Payment Method
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Update Billing Address
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive">
                  Cancel Membership
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  All your membership payments and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(payment.payment_date), 'MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_method || 'Card payment'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${payment.amount}</p>
                          <Badge
                            variant={payment.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payment history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyGym;

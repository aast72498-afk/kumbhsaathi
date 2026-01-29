import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Ambulance, ArrowRight, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle>City Map - Crowd Density</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="relative h-full w-full rounded-lg bg-muted-foreground/10 border flex items-center justify-center">
                <p className="text-muted-foreground">Interactive City Map Placeholder</p>
                {/* Placeholder for Map */}
                <div className="absolute top-10 left-10 p-4 bg-background/80 rounded-lg shadow-lg border">
                    <h3 className="font-bold">Ram Kund</h3>
                    <p className="text-green-400">Crowd: Low</p>
                </div>
                <div className="absolute top-40 left-60 p-4 bg-background/80 rounded-lg shadow-lg border">
                    <h3 className="font-bold">Tapovan Ghat</h3>
                    <p className="text-yellow-400">Crowd: Moderate</p>
                </div>
                <div className="absolute bottom-20 right-20 p-4 bg-background/80 rounded-lg shadow-lg border">
                    <h3 className="font-bold">Laxman Kund</h3>
                    <p className="text-red-400">Crowd: High</p>
                </div>
                 <div className="absolute bottom-1/2 right-1/2 p-2 bg-blue-500/80 rounded-full shadow-lg border-2 border-white animate-pulse">
                    <Ambulance className="h-6 w-6 text-white" />
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="p-2 bg-destructive/20 rounded-full">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                </div>
                <div>
                    <p className="font-semibold">High Crowd Density Alert</p>
                    <p className="text-sm text-muted-foreground">Laxman Kund - 2 mins ago</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
             <div className="flex items-start gap-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="p-2 bg-amber-500/20 rounded-full">
                    <Ambulance className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                    <p className="font-semibold">Ambulance Stuck</p>
                    <p className="text-sm text-muted-foreground">Near Ram Kund - 5 mins ago</p>
                </div>
                 <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
             <div className="flex items-start gap-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary/20 rounded-full">
                    <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="font-semibold">Missing Person Reported</p>
                    <p className="text-sm text-muted-foreground">Tapovan Area - 12 mins ago</p>
                </div>
                 <Button variant="ghost" size="icon" className="ml-auto">
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
                <Button variant="destructive" className="w-full justify-start">Clear Emergency Route</Button>
                <Button variant="outline" className="w-full justify-start">Broadcast Crowd Alert</Button>
                <Button variant="outline" className="w-full justify-start">Lock Ghat Entry</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

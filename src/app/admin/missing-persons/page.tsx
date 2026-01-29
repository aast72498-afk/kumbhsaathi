'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileText, UserCheck, Timer, Shield, Loader2 } from 'lucide-react';

export default function MissingPersonsPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDescription, setGeneratedDescription] = useState("");

    const handleGenerateDescription = () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setGeneratedDescription("Male child, approximately 5 years old, last seen wearing a red t-shirt and blue shorts. Average build, fair complexion.");
            setIsGenerating(false);
        }, 1500);
    }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Panel: Case Creation */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Create New Case</CardTitle>
          <CardDescription>Enter details to report a missing person.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="photo-upload">Reference Photo</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                        </div>
                        <Input id="photo-upload" type="file" className="hidden" />
                    </label>
                </div> 
            </div>

          <div className="space-y-2">
            <Label htmlFor="last-seen">Last Seen Location</Label>
            <Input id="last-seen" placeholder="e.g., Near Ram Kund entrance" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age-group">Age Group</Label>
             <Select>
                <SelectTrigger id="age-group">
                    <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="child">Child (0-12)</SelectItem>
                    <SelectItem value="teen">Teenager (13-17)</SelectItem>
                    <SelectItem value="adult">Adult (18-60)</SelectItem>
                    <SelectItem value="senior">Senior (60+)</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clothing">Clothing Description</Label>
            <Textarea id="clothing" placeholder="e.g., Red t-shirt, blue jeans, white cap" />
          </div>
          
          <Button onClick={handleGenerateDescription} disabled={isGenerating} className="w-full">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate AI Description
          </Button>
        </CardContent>
      </Card>

      {/* Center & Right Panels */}
      <div className="lg:col-span-2 space-y-6">
        {/* Center Panel: AI Generated Description */}
        <Card>
            <CardHeader>
                <CardTitle>AI-Generated Report</CardTitle>
                <div className="flex items-center gap-4 pt-2">
                     <Badge variant="secondary" className="border-green-500/50 text-green-400">
                        <Shield className="w-3 h-3 mr-1.5" />
                        No Facial Data Stored
                    </Badge>
                    <Badge variant="secondary" className="border-amber-500/50 text-amber-400">
                        <Timer className="w-3 h-3 mr-1.5" />
                        Auto-deletes in 48 hours
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {generatedDescription ? (
                     <Alert variant="default" className="bg-background">
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Generated Description</AlertTitle>
                        <AlertDescription className="text-lg text-foreground">
                          {generatedDescription}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex items-center justify-center h-24 text-sm text-center text-muted-foreground">
                        <p>Description will be generated here after you submit the case details.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* Right Panel: Potential Matches */}
        <Card>
            <CardHeader>
                <CardTitle>Potential Matches</CardTitle>
                <CardDescription>Review cases reported by other units and the public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Alert className="bg-muted/30">
                     <UserCheck className="h-4 w-4" />
                    <div className="flex items-center justify-between w-full">
                        <div>
                             <AlertTitle>Case ID: MP-83421</AlertTitle>
                             <AlertDescription>Status: <span className="font-semibold text-green-400">Found nearby</span> (Sector 5)</AlertDescription>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                    </div>
                </Alert>
                 <Alert className="bg-muted/30">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                    <div className="flex items-center justify-between w-full">
                        <div>
                             <AlertTitle>Case ID: MP-83419</AlertTitle>
                             <AlertDescription>Status: <span className="font-semibold text-yellow-400">Under Verification</span></AlertDescription>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                    </div>
                </Alert>
                <div className="text-center text-muted-foreground text-sm pt-4">No other potential matches found.</div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

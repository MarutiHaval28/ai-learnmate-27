import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudyVideo {
  title: string;
  url: string;
  description: string;
  duration?: string;
}

export const StudySection = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [videos, setVideos] = useState<StudyVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const classes = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
  const subjects = ["Mathematics", "Science", "English", "History", "Geography", "Physics", "Chemistry", "Biology"];
  const topics = {
    Mathematics: ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics"],
    Science: ["Forces and Motion", "Energy", "Matter", "Life Processes", "Genetics"],
    English: ["Grammar", "Literature", "Writing Skills", "Comprehension", "Poetry"],
    History: ["Ancient History", "Medieval History", "Modern History", "World Wars", "Independence Movement"],
    Geography: ["Physical Geography", "Human Geography", "Economic Geography", "Environmental Geography"],
    Physics: ["Mechanics", "Thermodynamics", "Optics", "Electricity", "Modern Physics"],
    Chemistry: ["Atomic Structure", "Chemical Bonding", "Acids and Bases", "Organic Chemistry", "Inorganic Chemistry"],
    Biology: ["Cell Biology", "Genetics", "Evolution", "Ecology", "Human Physiology"]
  };

  const getStudyMaterials = async () => {
    if (!selectedClass || !selectedSubject || !selectedTopic) {
      toast({
        title: "Please select all fields",
        description: "Select class, subject, and topic to get study materials.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-study-materials', {
        body: {
          class: selectedClass,
          subject: selectedSubject,
          topic: selectedTopic
        }
      });

      if (error) throw error;

      setVideos(data.videos || []);
      toast({
        title: "Study materials loaded!",
        description: `Found ${data.videos?.length || 0} videos for ${selectedTopic}`,
      });
    } catch (error: any) {
      console.error('Error fetching study materials:', error);
      toast({
        title: "Error loading materials",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
        <p className="text-muted-foreground">
          Get AI-curated YouTube videos and study materials for your selected topics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Study Preferences</CardTitle>
          <CardDescription>
            Choose your class, subject, and topic to get personalized study materials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubject && topics[selectedSubject as keyof typeof topics]?.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={getStudyMaterials} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Study Materials
          </Button>
        </CardContent>
      </Card>

      {videos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recommended Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  {video.duration && (
                    <Badge variant="secondary" className="w-fit">
                      {video.duration}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {video.description}
                  </p>
                  <Button 
                    onClick={() => openVideo(video.url)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Video
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Trophy, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TestHistory {
  id: string;
  class: string;
  subject: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
  questions: any;
  correct_answers: any;
  student_answers: any;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

export const ProfileSection = () => {
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTestHistory();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching test history:', error);
      toast({
        title: "Error loading test history",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const averageScore = testHistory.length > 0 
    ? testHistory.reduce((acc, test) => acc + (test.score / test.total_questions), 0) / testHistory.length * 100
    : 0;

  const totalTests = testHistory.length;
  const bestScore = testHistory.length > 0 
    ? Math.max(...testHistory.map(test => (test.score / test.total_questions) * 100))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Test Review</h1>
            <p className="text-muted-foreground">
              {selectedTest.subject} - {selectedTest.topic}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedTest(null)}>
            Back to Profile
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Details
              <Badge variant={selectedTest.score >= selectedTest.total_questions * 0.7 ? "default" : "secondary"}>
                {Math.round((selectedTest.score / selectedTest.total_questions) * 100)}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Taken on {new Date(selectedTest.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTest.questions.map((question: any, index: number) => {
                const userAnswer = selectedTest.student_answers[index];
                const correctAnswer = selectedTest.correct_answers[index];
                const isCorrect = userAnswer === correctAnswer;
                
                return (
                  <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        {isCorrect ? (
                          <Badge className="bg-green-500">Correct</Badge>
                        ) : (
                          <Badge variant="destructive">Incorrect</Badge>
                        )}
                      </div>
                      
                      <p className="mb-3">{question.question}</p>
                      
                      <div className="space-y-2 mb-3">
                        {question.options.map((option: string, optionIndex: number) => (
                          <div key={optionIndex} className={`p-2 rounded text-sm ${
                            optionIndex === correctAnswer 
                              ? 'bg-green-100 border border-green-300 text-green-800'
                              : optionIndex === userAnswer && !isCorrect
                              ? 'bg-red-100 border border-red-300 text-red-800'
                              : 'bg-gray-50'
                          }`}>
                            {option}
                            {optionIndex === correctAnswer && " ✓"}
                            {optionIndex === userAnswer && !isCorrect && " ✗"}
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                        <p className="text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile & Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and review your test performance.
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Loading...'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge>{userProfile?.role || 'Student'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {userProfile ? new Date(userProfile.created_at).toLocaleDateString() : 'Loading...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{bestScore.toFixed(1)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>
            Review your past tests and track your improvement over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testHistory.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tests taken yet.</p>
              <p className="text-sm text-muted-foreground">Start with the Tests section to track your progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testHistory.map((test) => (
                <Card key={test.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{test.subject}</h4>
                          <Badge variant="outline">{test.class}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{test.topic}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.created_at).toLocaleDateString()} at{" "}
                          {new Date(test.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getScoreColor(test.score, test.total_questions)}`}
                            />
                            <span className="font-medium">
                              {test.score}/{test.total_questions}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((test.score / test.total_questions) * 100)}%
                          </p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
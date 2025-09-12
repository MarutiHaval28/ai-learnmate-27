import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Loader2, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TestResult {
  id: string;
  class: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

export const TestsSection = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const { toast } = useToast();
  const { user } = useAuth();

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStarted && timeLeft > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, timeLeft, showResults]);

  const generateTest = async () => {
    if (!selectedClass || !selectedSubject || !selectedTopic) {
      toast({
        title: "Please select all fields",
        description: "Select class, subject, and topic to generate a test.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-test', {
        body: {
          class: selectedClass,
          subject: selectedSubject,
          topic: selectedTopic
        }
      });

      if (error) throw error;

      setQuestions(data.questions || []);
      setUserAnswers(new Array(data.questions?.length || 10).fill(-1));
      setCurrentQuestionIndex(0);
      setTestStarted(true);
      setTimeLeft(600);
      setShowResults(false);
      
      toast({
        title: "Test generated!",
        description: `${data.questions?.length || 10} questions ready for ${selectedTopic}`,
      });
    } catch (error: any) {
      console.error('Error generating test:', error);
      toast({
        title: "Error generating test",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setUserAnswers(newAnswers);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] !== -1 ? userAnswers[currentQuestionIndex + 1] : null);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    const finalAnswers = [...userAnswers];
    if (selectedAnswer !== null) {
      finalAnswers[currentQuestionIndex] = selectedAnswer;
    }

    const correctAnswers = questions.map(q => q.correctAnswer);
    const calculatedScore = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === correctAnswers[index] ? 1 : 0);
    }, 0);

    setScore(calculatedScore);
    setShowResults(true);
    setTestStarted(false);

    // Save test result to database
    try {
      await supabase.from('tests').insert({
        user_id: user?.id,
        class: selectedClass,
        subject: selectedSubject,
        topic: selectedTopic,
        questions: JSON.stringify(questions),
        correct_answers: JSON.stringify(correctAnswers),
        student_answers: JSON.stringify(finalAnswers),
        score: calculatedScore,
        total_questions: questions.length
      });
    } catch (error) {
      console.error('Error saving test result:', error);
    }

    toast({
      title: "Test submitted!",
      description: `You scored ${calculatedScore}/${questions.length} (${Math.round((calculatedScore / questions.length) * 100)}%)`,
    });
  };

  const resetTest = () => {
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setTestStarted(false);
    setTimeLeft(600);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (showResults) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Test Results</h1>
          <p className="text-muted-foreground">
            Review your performance and learn from explanations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Completed
              <Badge variant={score >= questions.length * 0.7 ? "default" : "secondary"}>
                {Math.round((score / questions.length) * 100)}%
              </Badge>
            </CardTitle>
            <CardDescription>
              You scored {score} out of {questions.length} questions correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Progress value={(score / questions.length) * 100} className="h-3" />
              
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <Card key={index} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        
                        <p className="mb-3">{question.question}</p>
                        
                        <div className="space-y-2 mb-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer 
                                ? 'bg-green-100 border border-green-300 text-green-800'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 border border-red-300 text-red-800'
                                : 'bg-gray-50'
                            }`}>
                              {option}
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Button onClick={resetTest} className="w-full">
                Take Another Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assessment in Progress</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 60 ? 'text-red-500 font-bold' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{currentQuestion.question}</p>
            
            <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => selectAnswer(parseInt(value))}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded hover:bg-secondary/50">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(currentQuestionIndex - 1);
                    setSelectedAnswer(userAnswers[currentQuestionIndex - 1] !== -1 ? userAnswers[currentQuestionIndex - 1] : null);
                  }
                }}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <Button 
                onClick={nextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tests & Assessments</h1>
        <p className="text-muted-foreground">
          Take AI-generated tests to evaluate your understanding and track your progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Generate New Test
          </CardTitle>
          <CardDescription>
            Select your class, subject, and topic to generate a personalized assessment.
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

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Information:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 10 multiple-choice questions</li>
              <li>• 10 minutes time limit</li>
              <li>• Instant results with explanations</li>
              <li>• Progress tracking and analytics</li>
            </ul>
          </div>

          <Button onClick={generateTest} className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
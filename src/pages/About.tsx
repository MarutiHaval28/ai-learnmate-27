import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target, Eye, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const About = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={!!user} onLogout={signOut} />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <GraduationCap className="mx-auto mb-6 h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold mb-4">About AI EduTools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to revolutionize education through the power of artificial intelligence, 
            making quality learning accessible to every student around the world.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize education by providing AI-powered learning tools that adapt to every student's unique learning style and pace, ensuring no one is left behind in their educational journey.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To create a world where personalized, intelligent education is available to everyone, fostering a global community of lifelong learners equipped with the skills for tomorrow's challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardContent className="p-0">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Our Values</h3>
              <p className="text-muted-foreground">
                We believe in accessibility, innovation, and student-centered learning. Our platform is built with empathy, ensuring every feature serves the learner's best interests and educational growth.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why AI in Education */}
        <div className="bg-primary/5 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why AI in Education?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Personalized Learning</h3>
              <p className="text-muted-foreground mb-6">
                AI enables us to create learning experiences tailored to each student's strengths, weaknesses, and learning preferences. No two students learn the same way, and our platform adapts accordingly.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Instant Feedback</h3>
              <p className="text-muted-foreground">
                With AI-powered assessments, students receive immediate feedback on their performance, allowing them to understand mistakes and learn from them in real-time.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">24/7 Learning Support</h3>
              <p className="text-muted-foreground mb-6">
                Our AI chatbot provides round-the-clock support, answering questions and providing explanations whenever students need help, breaking down the barriers of traditional classroom hours.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Adaptive Content</h3>
              <p className="text-muted-foreground">
                AI helps us curate and generate educational content that matches each student's current level and learning objectives, ensuring optimal challenge and engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-2">10,000+</div>
              <p className="text-muted-foreground">Study Videos Curated</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Topics Covered</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">AI Support Available</p>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">Student Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience the Future of Learning?</h2>
          <p className="text-muted-foreground mb-6">
            Join our growing community of learners and discover how AI can transform your educational journey.
          </p>
          {!user && (
            <a href="/auth?mode=signup" className="inline-block">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Get Started Today
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
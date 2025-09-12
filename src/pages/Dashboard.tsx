import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StudySection } from "@/components/dashboard/StudySection";
import { ChatbotSection } from "@/components/dashboard/ChatbotSection";
import { TestsSection } from "@/components/dashboard/TestsSection";
import { ProfileSection } from "@/components/dashboard/ProfileSection";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("study");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "study":
        return <StudySection />;
      case "chatbot":
        return <ChatbotSection />;
      case "tests":
        return <TestsSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return <StudySection />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6 bg-background">
          {renderSection()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
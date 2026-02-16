import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { PageHeaderDecor, VineBorder } from "@/components/NatureDecorations";
import VolunteerDashboard from "@/components/dashboard/VolunteerDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative">
        <PageHeaderDecor />
        <VineBorder side="left" />
        <VineBorder side="right" />
        <div className="container relative mx-auto px-4 py-8">
          {role === "admin" ? (
            <AdminDashboard />
          ) : role === "organizer" ? (
            <OrganizerDashboard />
          ) : (
            <VolunteerDashboard />
          )}
        </div>
      </div>
    </div>
  );
}

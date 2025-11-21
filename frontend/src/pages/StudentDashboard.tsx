import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, LogOut, MapPin, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
  jobs: Job;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData?.role !== "student") {
      navigate("/recruiter/dashboard");
      return;
    }

    setProfile(profileData);
    loadApplications(session.user.id);
  };

  const loadApplications = async (userId: string) => {
    setIsLoading(true);
    // 1) Load applications from Supabase (legacy)
    const { data: supaData, error: supaErr } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        job_id,
        student_id,
        jobs (
          id,
          title,
          company,
          location,
          job_type,
          salary_range,
          created_at
        )
      `)
      .eq("student_id", userId)
      .order("created_at", { ascending: false });

    if (supaErr) {
      toast.error("Failed to load applications from Supabase");
    }

    const supaApps = (supaData || []).map((a: any) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      jobs: a.jobs || {
        id: a.job_id,
        title: 'Job',
        company: '',
        location: '',
        job_type: '',
        salary_range: null,
        created_at: null,
      }
    }));

    // 2) Load applications from backend (Mongo)
    let backendApps: any[] = [];
    try {
      const res = await api.get(`/applications?student=${userId}`);
      backendApps = res || [];
    } catch (err) {
      // ignore backend errors, we'll still show supa apps
      console.warn('Failed to load backend applications', err);
      backendApps = [];
    }

    // For backend apps fetch job details for each
    const backendAppsWithJobs = await Promise.all(backendApps.map(async (a: any) => {
      let job = null;
      try {
        job = await api.get(`/jobs/${a.jobId}`);
      } catch (err) {
        job = null;
      }
      return {
        id: a._id || a.id,
        status: a.status,
        created_at: a.createdAt || a.created_at,
        jobs: job ? {
          id: job._id || job.id,
          title: job.title,
          company: job.company || job.companyName || job.companyId,
          location: job.location,
          job_type: job.type || job.job_type,
          salary_range: job.salary_range || job.salaryRange || null,
          created_at: job.createdAt || job.created_at,
        } : {
          id: a.jobId,
          title: 'Job',
          company: '',
          location: '',
          job_type: '',
        }
      };
    }));

    // Merge backend apps and supabase apps, prefer backend app (status) when ids conflict
    const appsMap: Record<string, any> = {};
    backendAppsWithJobs.forEach((a) => { appsMap[a.id] = a; });
    supaApps.forEach((a) => { if (!appsMap[a.id]) appsMap[a.id] = a; });

    const merged = Object.values(appsMap).sort((x: any, y: any) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime());
    setApplications(merged);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-warning text-warning-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JOBNEST
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name}</span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{applications.length}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {applications.filter((a) => a.status === "accepted").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                {applications.filter((a) => ['pending','submitted'].includes(a.status)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => navigate("/jobs")} variant="hero" size="lg">
            <TrendingUp className="mr-2 h-5 w-5" />
            Browse Jobs
          </Button>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Applications</CardTitle>
            <CardDescription>Track the status of your job applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading applications...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                <Button onClick={() => navigate("/jobs")} variant="hero">
                  Browse Available Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{application.jobs.title}</CardTitle>
                          <CardDescription className="text-base">
                            <div className="flex flex-wrap gap-3 mt-2">
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {application.jobs.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.jobs.location}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {application.jobs.job_type}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                            <Badge className={getStatusColor(application.status)}>
                          {application.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                            {application.jobs.salary_range && (
                          <span className="font-semibold text-primary">{application.jobs.salary_range}</span>
                        )}
                            {application.resume_url && (
                              <a
                                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${application.resume_url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-4 text-sm text-primary underline"
                              >
                                View Resume
                              </a>
                            )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

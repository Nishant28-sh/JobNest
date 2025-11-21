import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Briefcase, MapPin, Clock, DollarSign, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  requirements: string;
  created_at: string;
}

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    loadJob();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      
      // Check if already applied
      if (id) {
        try {
          const res = await api.get(`/applications?jobId=${id}&student=${session.user.id}`);
          setHasApplied((res || []).length > 0);
        } catch (err) {
          console.error('Failed to check applications', err);
        }
      }
    }
  };

  const loadJob = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await api.get(`/jobs/${id}`);
      const mapped = {
        id: data._id || data.id,
        title: data.title,
        company: data.company || data.companyName || data.companyId,
        location: data.location,
        job_type: data.type || data.job_type,
        salary_range: data.salary_range || data.salaryRange || null,
        description: data.description,
        requirements: data.requirements || "",
        created_at: data.createdAt || data.created_at,
      };
      setJob(mapped);
    } catch (err) {
      toast.error("Failed to load job details");
      console.error(err);
      navigate("/jobs");
    }
    setIsLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply");
      navigate("/auth");
      return;
    }

    if (profile?.role !== "student") {
      toast.error("Only students can apply for jobs");
      return;
    }

    if (!job) return;

    try {
      // If a resume was attached, send multipart/form-data
      if (resumeFile) {
        const form = new FormData();
        form.append('jobId', job.id);
        form.append('studentId', user.id);
        form.append('cover_letter', coverLetter);
        form.append('resume', resumeFile);
        await api.postForm('/applications', form);
      } else {
        await api.post('/applications', {
          jobId: job.id,
          studentId: user.id,
          cover_letter: coverLetter,
        });
      }
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setIsDialogOpen(false);
      setCoverLetter('');
      setResumeFile(null);
    } catch (err: any) {
      console.error(err);
      const msg = err?.data?.error || err?.data?.message || err?.message || 'Failed to submit application';
      toast.error(String(msg));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/jobs" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JOBNEST
              </h1>
            </Link>
            <Button onClick={() => navigate("/jobs")} variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-cyan-50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-4xl mb-3">{job.title}</CardTitle>
                <CardDescription className="text-xl font-semibold text-primary mb-4">
                  {job.company}
                </CardDescription>
                <div className="flex flex-wrap gap-4 text-base">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    {job.job_type}
                  </span>
                  {job.salary_range && (
                    <span className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-primary" />
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>
              <Badge className="text-sm px-4 py-2">
                Posted: {new Date(job.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-primary">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-primary">Requirements</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </div>

            <div className="pt-6 border-t">
              {hasApplied ? (
                <Button size="lg" variant="outline" disabled className="w-full md:w-auto">
                  Already Applied
                </Button>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="hero" className="w-full md:w-auto">
                      <Send className="mr-2 h-5 w-5" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Tell us why you're a great fit for this position
                      </DialogDescription>
                    </DialogHeader>
                      <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                        <Textarea
                          id="cover-letter"
                          placeholder="Tell us about your experience and why you're interested in this role..."
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resume">Attach Resume (optional)</Label>
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <Button onClick={handleApply} className="w-full" variant="hero">
                        Submit Application
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;

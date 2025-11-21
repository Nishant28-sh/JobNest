import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, LogOut, Plus, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

type AppItem = {
  id: string;
  status: string;
  cover_letter?: string | null;
  resume_url?: string | null;
  jobId?: string | null;
  created_at: string;
  profiles?: { full_name?: string; email?: string | null; phone?: string | null };
  jobTitle?: string | null;
};

const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", company: "", location: "", job_type: "Full-time", salary_range: "", description: "", requirements: "" });

  const jobsRef = useRef<HTMLDivElement | null>(null);
  const appsRef = useRef<HTMLDivElement | null>(null);
  const [appFilter, setAppFilter] = useState<'all' | 'pending'>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/auth'); return; }
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (!profileData) { navigate('/auth'); return; }
    if (profileData.role !== 'recruiter') { navigate('/student/dashboard'); return; }
    setProfile(profileData);
    await loadData(session.user.id);
  }

  async function loadData(userId: string) {
    setIsLoading(true);

    let backendJobs: any[] = [];
    try { backendJobs = await api.get(`/jobs?recruiterId=${userId}`) || []; } catch (e) { backendJobs = []; }
    let supaJobs: any[] = [];
    try { const { data } = await supabase.from('jobs').select('*').eq('recruiter_id', userId).order('created_at', { ascending: false }); supaJobs = data || []; } catch (e) { supaJobs = []; }

    const jobsMap: Record<string, any> = {};
    backendJobs.forEach((j:any) => { const id = j._id || j.id; jobsMap[id] = jobsMap[id] || { id, title: j.title, company: j.company || j.companyName || j.companyId, location: j.location, is_active: j.is_active !== undefined ? j.is_active : true }; });
    supaJobs.forEach((j:any) => { const id = j.id; jobsMap[id] = jobsMap[id] || { id, title: j.title, company: j.company || j.company_name || '', location: j.location, is_active: j.is_active !== undefined ? j.is_active : true }; });
    const mergedJobs = Object.values(jobsMap);
    setJobs(mergedJobs);

    // applications
    let backendApps: any[] = [];
    try {
      const backendJobIds = backendJobs.map((j:any) => j._id || j.id).filter(Boolean);
      if (backendJobIds.length) backendApps = await api.get(`/applications?jobIds=${backendJobIds.join(',')}`) || [];
    } catch (e) { backendApps = []; }

    let supaApps: any[] = [];
    try {
      const supaJobIds = supaJobs.map((j:any) => j.id).filter(Boolean);
      if (supaJobIds.length) {
        const { data } = await supabase.from('applications').select('id,status,cover_letter,created_at,student_id,job_id,jobs(title)').in('job_id', supaJobIds).order('created_at', { ascending: false });
        supaApps = data || [];
      }
    } catch (e) { supaApps = []; }

    const normalizedBackend = backendApps.map((a:any) => ({ id: a._id || a.id, status: a.status, cover_letter: a.cover_letter || null, resume_url: a.resume_url || null, jobId: a.jobId, created_at: a.createdAt || a.created_at, student: a.student }));
    const normalizedSupa = supaApps.map((a:any) => ({ id: a.id, status: a.status, cover_letter: a.cover_letter || null, resume_url: null, jobId: a.job_id, created_at: a.created_at, student: a.student_id, jobTitle: a.jobs?.title }));

    const merged = [...normalizedBackend, ...normalizedSupa];

    const studentIds = Array.from(new Set(merged.map(m => m.student).filter(Boolean)));
    let profilesMap: Record<string, any> = {};
    if (studentIds.length) {
      try { const { data } = await supabase.from('profiles').select('*').in('id', studentIds as string[]); (data || []).forEach((p:any) => profilesMap[p.id] = p); } catch (e) { profilesMap = {}; }
    }

    const finalApps: AppItem[] = merged.map((a:any) => ({
      id: a.id,
      status: a.status,
      cover_letter: a.cover_letter,
      resume_url: a.resume_url || null,
      jobId: a.jobId || null,
      created_at: a.created_at,
      profiles: { full_name: profilesMap[a.student]?.full_name || 'Student', email: profilesMap[a.student]?.email || null, phone: profilesMap[a.student]?.phone || null },
      jobTitle: a.jobTitle || mergedJobs.find((j:any)=>j.id===a.jobId)?.title || 'Job'
    }));

    finalApps.sort((x,y)=> new Date(y.created_at).getTime() - new Date(x.created_at).getTime());
    setApplications(finalApps);
    setIsLoading(false);
  }

  const handlePostJob = async (e:any) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await api.post('/jobs', { title: newJob.title, company: newJob.company, location: newJob.location, type: newJob.job_type, description: newJob.description, salary_range: newJob.salary_range, requirements: newJob.requirements, recruiterId: profile.id });
      toast.success('Job posted');
      setIsDialogOpen(false);
      setNewJob({ title: '', company: '', location: '', job_type: 'Full-time', salary_range: '', description: '', requirements: '' });
      await loadData(profile.id);
    } catch (err:any) { toast.error(err?.message || 'Failed to post job'); }
  };

  const handleUpdateApplicationStatus = async (applicationId:string, status:'accepted'|'rejected') => {
    try { await api.put(`/applications/${applicationId}`, { status }); toast.success('Updated'); await loadData(profile.id); } catch (e:any) { toast.error('Failed to update'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Briefcase className="h-8 w-8 text-primary" /><h1 className="text-2xl font-bold">JOBNEST</h1></div>
          <div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">Welcome, {profile?.full_name}</span><Button variant="outline" size="sm" onClick={async()=>{await supabase.auth.signOut(); navigate('/');}}> <LogOut className="mr-2 h-4 w-4"/> Sign Out</Button></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="cursor-pointer" onClick={() => { jobsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
            <Card className="border-2 border-primary/20 hover:shadow-md"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{jobs.filter(j=>j.is_active).length}</div></CardContent></Card>
          </div>
          <div className="cursor-pointer" onClick={() => { appsRef.current?.scrollIntoView({ behavior: 'smooth' }); setAppFilter('pending'); }}>
            <Card className="border-2 border-warning/20 hover:shadow-md"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-warning">{applications.filter(a=>['pending','submitted'].includes(a.status)).length}</div></CardContent></Card>
          </div>
          <div className="cursor-pointer" onClick={() => { appsRef.current?.scrollIntoView({ behavior: 'smooth' }); setAppFilter('all'); }}>
            <Card className="border-2 border-success/20 hover:shadow-md"><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-success">{applications.length}</div></CardContent></Card>
          </div>
        </div>

        <div className="mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button variant="hero" size="lg"><Plus className="mr-2 h-5 w-5"/> Post New Job</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Post a New Job</DialogTitle><DialogDescription>Fill details</DialogDescription></DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="title">Job Title</Label><Input id="title" value={newJob.title} onChange={(e)=>setNewJob({...newJob,title:e.target.value})} required/></div>
                <div className="space-y-2"><Label htmlFor="company">Company</Label><Input id="company" value={newJob.company} onChange={(e)=>setNewJob({...newJob,company:e.target.value})} required/></div>
                <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={newJob.location} onChange={(e)=>setNewJob({...newJob,location:e.target.value})} required/></div>
                <div className="space-y-2"><Label htmlFor="job_type">Job Type</Label><Select value={newJob.job_type} onValueChange={(v:any)=>setNewJob({...newJob,job_type:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem></SelectContent></Select></div></div>
                <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={4} value={newJob.description} onChange={(e)=>setNewJob({...newJob,description:e.target.value})} required/></div>
                <Button type="submit" className="w-full">Post Job</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div ref={jobsRef} className="mb-8">
          <Card>
            <CardHeader><CardTitle className="text-2xl flex items-center"><Briefcase className="mr-2"/>My Jobs</CardTitle><CardDescription>Jobs you've posted</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-center text-muted-foreground py-8">Loading jobs...</p> : jobs.length === 0 ? <div className="text-center py-8 text-muted-foreground">No jobs yet</div> : (
                <div className="space-y-4">{jobs.map(job => (
                  <div key={job.id} className="p-2"><Card className="p-4 hover:shadow-md cursor-pointer" onClick={() => { setSelectedJobId(job.id); appsRef.current?.scrollIntoView({ behavior: 'smooth' }); setAppFilter('all'); }}>
                    <div className="flex items-center justify-between"><div><div className="font-semibold">{job.title}</div><div className="text-sm text-muted-foreground">{job.company} • {job.location}</div></div><div className="text-sm">{job.is_active ? <Badge className="bg-success">Active</Badge> : <Badge className="bg-muted">Inactive</Badge>}</div></div>
                  </Card></div>
                ))}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div ref={appsRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center"><Users className="mr-2"/>{selectedJobId ? 'Applications for: ' + (jobs.find(j=>j.id===selectedJobId)?.title || 'Job') : 'Recent Applications'}</CardTitle>
                  <CardDescription>{selectedJobId ? 'Review applications for the selected job' : 'Review and manage job applications'}</CardDescription>
                </div>
                {selectedJobId && <Button variant="ghost" onClick={() => { setSelectedJobId(null); jobsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>Back to Jobs</Button>}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-center text-muted-foreground py-8">Loading applications...</p> : (
                <div className="space-y-4">
                  {applications.filter(a => (appFilter==='all'?true:['pending','submitted'].includes(a.status)) && (selectedJobId? a.jobId===selectedJobId : true)).map(application => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{application.profiles?.full_name || 'Student'}</CardTitle>
                            <CardDescription className="mt-2">
                              <div className="space-y-1">
                                <p>Applied for: <span className="font-semibold">{application.jobTitle || 'Job'}</span></p>
                                <p>Email: {application.profiles?.email}</p>
                                {application.profiles?.phone && <p>Phone: {application.profiles.phone}</p>}
                                {application.cover_letter && <p className="mt-2 text-sm"><span className="font-semibold">Cover Letter:</span> {application.cover_letter}</p>}
                                {application.resume_url && <p className="mt-2"><a href={(import.meta.env.VITE_API_URL || 'http://localhost:5000') + application.resume_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View Resume</a></p>}
                              </div>
                            </CardDescription>
                          </div>
                          <Badge className={application.status==='accepted'?'bg-success':application.status==='rejected'?'bg-destructive':'bg-warning'}>{application.status.toUpperCase()}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                          {['pending','submitted'].includes(application.status) && <div className="flex gap-2"><Button size="sm" variant="success" onClick={()=>handleUpdateApplicationStatus(application.id,'accepted')}><CheckCircle className="mr-1 h-4 w-4"/>Accept</Button><Button size="sm" variant="destructive" onClick={()=>handleUpdateApplicationStatus(application.id,'rejected')}><XCircle className="mr-1 h-4 w-4"/>Reject</Button></div>}
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
    </div>
  );
};

export default RecruiterDashboard;

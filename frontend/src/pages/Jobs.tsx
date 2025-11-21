import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, DollarSign, Search, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  created_at: string;
}

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, locationFilter, typeFilter, jobs]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
  };

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/jobs');
      // backend returns array of jobs; adapt field names if necessary
      const mapped = (data || []).map((j: any) => ({
        id: j._id || j.id,
        title: j.title,
        company: j.company || j.companyName || j.companyId,
        location: j.location,
        job_type: j.type || j.job_type,
        salary_range: j.salary_range || j.salaryRange || null,
        description: j.description,
        created_at: j.createdAt || j.created_at || j.created_at || j.createdAt,
      }));
      setJobs(mapped);
      setFilteredJobs(mapped);
    } catch (err: any) {
      toast.error("Failed to load jobs");
      console.error(err);
    }
    setIsLoading(false);
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job.job_type === typeFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                JOBNEST
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button onClick={() => navigate("/student/dashboard")} variant="ghost" size="sm">
                    My Dashboard
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="hero">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Find Your Dream Job</CardTitle>
            <CardDescription>Browse through hundreds of opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, company..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="san francisco">San Francisco</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-primary">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
            <Button onClick={() => { setSearchTerm(""); setLocationFilter("all"); setTypeFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-primary mb-3">
                        {job.company}
                      </CardDescription>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.job_type}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center text-muted-foreground">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {new Date(job.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">{job.description}</p>
                  <Button className="mt-4" variant="hero">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

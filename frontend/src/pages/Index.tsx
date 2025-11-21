import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Zap, Shield, TrendingUp, Award } from "lucide-react";
import heroImage from "@/assets/hero-job-platform.jpg";

const Index = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Thousands of Jobs",
      description: "Access opportunities from top companies across industries",
    },
    {
      icon: Users,
      title: "Direct Connection",
      description: "Connect directly with recruiters and hiring managers",
    },
    {
      icon: Zap,
      title: "Instant Applications",
      description: "Apply to multiple positions with one click",
    },
    {
      icon: Shield,
      title: "Verified Companies",
      description: "All recruiters are verified for your safety",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your application status in real-time",
    },
    {
      icon: Award,
      title: "Premium Features",
      description: "Get noticed with premium visibility options",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              JOBNEST
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/jobs">
              <Button variant="ghost">Browse Jobs</Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-blue-900/80 to-cyan-900/90" />
        </div>
        
        <div className="relative container mx-auto px-4 py-32 md:py-40">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Launch Your
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Dream Career
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Connect with top companies and find opportunities that match your skills and ambitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="w-full sm:w-auto text-lg px-8 py-6">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/jobs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                  Explore Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why Choose JOBNEST?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to succeed in your job search
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-purple-600 to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Take the Next Step?
          </h3>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of students and professionals who have found their dream jobs through JOBNEST
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold shadow-2xl"
            >
              Join JOBNEST Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Briefcase className="h-6 w-6" />
              <span className="text-xl font-bold">JOBNEST</span>
            </div>
            <div className="text-center md:text-right text-gray-400">
              <p>&copy; 2025 JOBNEST. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

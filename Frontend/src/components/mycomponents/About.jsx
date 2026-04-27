import React from 'react';
import { Shield, Eye, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function About() {
  const features = [
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "See It",
      description: "Spot issues in your community—from broken streetlights to hazardous potholes.",
    },
    {
      icon: <MapPin className="h-6 w-6 text-primary" />,
      title: "Report It",
      description: "Easily log the issue with location data and photos directly through our platform.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Track It",
      description: "Monitor the status of your reports and hold local authorities accountable.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Fix It Together",
      description: "Join a community of proactive citizens working to improve your city.",
    }
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-background">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent -z-10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-primary/5 to-transparent -z-10 blur-2xl" />

        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl relative z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            Empowering Citizens to Build Better Cities
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            CitizEye is a community-driven platform designed to bridge the gap between citizens and local authorities. If you see a problem in your neighborhood, we make it easy to report it and get it fix.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/report">
              <Button size="lg" className="mt-8 rounded-full px-8 h-14 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
                Start Reporting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Features */}
      <section className="py-24 bg-background border-t border-border/40 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-20 flex flex-col items-center"> {/* Added flex and items-center */}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl text-center text-lg md:text-xl">
              We believe that every citizen has a voice. Our mission is to provide the tools necessary to make sure that voice is heard, transforming civic frustration into civic action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-primary/5 border-y border-border/40" />
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6 tracking-tight">Developed By</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            This platform was designed and developed by <span className="font-semibold text-foreground">Shahnawaz Shaikh</span>.
          </p>
          <a
            href="https://shahnawaz-shaikh-portfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all">
              View Portfolio
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}

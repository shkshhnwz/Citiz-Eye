import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MiniNav(){
  const location = useLocation();

  return(
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">


        <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-inner">
            <Eye className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            CitizEye
          </span>
        </Link>
        
        {location.pathname !== "/login" && (
          <Link to="/login">
            <Button variant="ghost" className="rounded-full px-5">
              Log in
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
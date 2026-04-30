import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Menu } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { title: "Report an Issue", href: "/report" },
  { title: "My Reports", href: "/my-reports" },
  { title: "About Us", href: "/about" },
];

export default function Navbar() {
  const location = useLocation();

  return (
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


        <div className="hidden md:flex flex-1 items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavigationMenuItem key={item.title}>

                    <NavigationMenuLink render={
                      <Link to={item.href}
                        className={`${navigationMenuTriggerStyle()} bg-transparent text-sm font-medium transition-colors ${isActive
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          }`}
                      />
                    }>
                      {item.title}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>


        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium rounded-full px-5">
              Log in
            </Button>
          </Link>
          <Link to="/report">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
              Report Now
            </Button>
          </Link>
        </div>


        <div className="flex md:hidden items-center gap-3">
          <Link to="/report">
            <Button size="sm" className="rounded-full shadow-md shadow-primary/20">Report</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/50 bg-background/50 backdrop-blur-sm" />
            }>
              <Menu className="h-4 w-4 text-foreground" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 mt-2 rounded-xl p-2 shadow-xl shadow-black/5">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <DropdownMenuItem key={item.title} className={`cursor-pointer rounded-lg mb-1 ${isActive ? "bg-primary/5 text-primary" : ""}`} render={<Link to={item.href} className="w-full text-sm font-medium" />}>
                    {item.title}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuItem className="cursor-pointer rounded-lg" render={<Link to="/login" className="w-full text-sm font-medium text-muted-foreground" />}>
                Log in
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}
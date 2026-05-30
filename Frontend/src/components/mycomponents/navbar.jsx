import * as React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Eye, Menu } from "lucide-react";

import { auth } from "@/firebase/fireBaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

import {
  NavigationMenu,
  NavigationMenuItem,
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

import MiniNav from "./mininavbar";

const navLinks = [
  { title: "My Reports", href: "/my-reports" },
  { title: "About Us", href: "/about" },
];

export default function Navbar() {
  const location = useLocation();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const token = await currentUser.getIdToken();
          const res = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Error fetching profile in navbar:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const activeLinks = isAdmin 
    ? [...navLinks, { title: "Admin Dashboard", href: "/admin" }] 
    : navLinks;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 h-16 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl" />
    );
  }

  if (!user) {
    return <MiniNav />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Eye className="h-5 w-5" />
          </div>

          <span className="text-xl font-bold tracking-tight">
            CitizEye
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {activeLinks.map((item) => {
                const isActive = location.pathname === item.href;

                return (
                  <NavigationMenuItem key={item.title}>
                    <Link
                      to={item.href}
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-sm font-medium transition-colors ${isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* AUTH DESKTOP */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <Link to="/login">
              <Button variant="ghost" className="rounded-full px-5">
                Log in
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              className="rounded-full px-5"
              onClick={handleLogout}
            >
              Log out
            </Button>
          )}

          <Link to="/report">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5">
              Report Now
            </Button>
          </Link>
        </div>

        {/* MOBILE MENU */}
        <div className="flex md:hidden items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-full border flex items-center justify-center">
              <Menu className="h-4 w-4 text-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 mt-2 rounded-xl p-2 shadow-xl"
            >
              {activeLinks.map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  render={<Link to={item.href} className="w-full cursor-pointer" />}
                >
                  {item.title}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="my-2" />

              {!user ? (
                <DropdownMenuItem
                  render={<Link to="/login" className="w-full cursor-pointer font-medium" />}
                >
                  Log in
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer font-medium text-destructive"
                >
                  Log out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300">
          <div className="w-full max-w-sm p-6 bg-card border border-muted-foreground/20 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-4 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-foreground">Confirm Logout</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to log out of your CitizEye account?
            </p>
            <div className="flex gap-3 justify-end mt-2">
              <Button
                variant="ghost"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full px-5 hover:bg-muted text-foreground"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    setShowLogoutModal(false);
                    await signOut(auth);
                  } catch (error) {
                    console.error("Logout failed", error);
                  }
                }}
                className="rounded-full px-6 shadow-lg shadow-destructive/20 hover:shadow-destructive/30"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
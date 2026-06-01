import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase/fireBaseConfig";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Set user display name in Firebase
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // 3. Get Firebase ID token
      const token = await userCredential.user.getIdToken();

      // 4. Sync with MongoDB Backend
      await axios.post(`${API_URL}/api/users/login`, 
        { name }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate("/"); 
    } catch (err) {
      setError(err.message);
      console.error("Signup failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      await axios.post(`${API_URL}/api/users/login`, 
        { name: result.user.displayName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/"); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background/50">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-md relative overflow-hidden transition-all duration-300">
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>

        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-extrabold tracking-tight">Create Account</CardTitle>
            <Button variant="link" className="p-0 text-sm font-semibold" onClick={() => navigate("/login")}>
              Log In
            </Button>
          </div>
          <CardDescription>
            Join CitizEye to report and track civic issues in your neighborhood.
          </CardDescription>
          {error && (
            <div className="p-3 mt-2 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-medium">
              ⚠️ {error}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* NAME */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  className="pl-10 rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourmail@address"
                  className="pl-10 rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  className="pl-10 pr-10 rounded-xl"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  className="pl-10 pr-10 rounded-xl"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full h-11 font-bold mt-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <div className="relative w-full flex items-center justify-center my-1">
            <div className="absolute w-full border-t border-muted-foreground/10"></div>
            <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
          </div>

          <Button variant="outline" className="w-full rounded-full h-11 font-medium transition-all" onClick={handleGoogleSignUp} disabled={loading}>
            Sign Up with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

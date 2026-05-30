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
import { auth } from "@/firebase/fireBaseConfig"; // Ensure this path is correct
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function LoginForm() {
  const navigate = useNavigate();
  
  // 1. ALL HOOKS AT THE TOP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // EMAIL LOGIN LOGIC
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      await axios.post('http://localhost:5000/api/users/login', 
        { name: "Shahnawaz Shaikh" }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      navigate("/"); 
    } catch (err) {
      setError(err.message);
      console.error("Login failed:", err.message);
    }
  };

  // GOOGLE LOGIN LOGIC
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      console.log("Token generated:", token); 
      await axios.post('http://localhost:5000/api/users/login', 
        { name: result.user.displayName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Login</CardTitle>
            <Button variant="link" onClick={() => navigate("/signup")}>Sign Up</Button>
          </div>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}> {/* onSubmit is better for accessibility */}
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Bind state
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto text-sm underline">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Bind state
                  required 
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" onClick={handleLogin}>
            Login
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
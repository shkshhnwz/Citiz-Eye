import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "@/firebase/fireBaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  MapPin, 
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'verified', 'resolved', 'rejected'
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.role === "admin") {
          setIsAdmin(true);
          fetchComplaints(token);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchComplaints = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/all-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || res.data || [];
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let result = complaints;
    
    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        c => 
          (c.description && c.description.toLowerCase().includes(lowerSearch)) ||
          (c.aiClassification?.label && c.aiClassification.label.toLowerCase().includes(lowerSearch)) ||
          (c.location?.address && c.location.address.toLowerCase().includes(lowerSearch))
      );
    }

    // Status Tab
    if (activeTab !== "all") {
      result = result.filter(c => c.status === activeTab);
    }

    setFilteredComplaints(result);
  }, [searchTerm, activeTab, complaints]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      
      const res = await axios.put(
        `${API_URL}/api/admin/complaints/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        // Update local state
        setComplaints(prev => 
          prev.map(c => c._id === id ? { ...c, status: newStatus } : c)
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    verified: complaints.filter(c => c.status === "verified").length,
    ongoing: complaints.filter(c => c.status === "ongoing").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground font-medium">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-md mx-auto py-20 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-destructive/10 rounded-full text-destructive">
            <ShieldAlert className="h-16 w-16" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You do not have the required administrative permissions to access this page. Please log in with an administrator account.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/login")} className="w-full rounded-full">
            Log In as Admin
          </Button>
          <Button onClick={() => navigate("/")} variant="outline" className="w-full rounded-full">
            Return to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Admin Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview and moderation of community reported civic issues.
          </p>
        </div>
        <Button 
          onClick={async () => {
            const user = auth.currentUser;
            if (user) {
              const token = await user.getIdToken();
              fetchComplaints(token);
            }
          }}
          variant="outline"
          className="rounded-full gap-2 hover:bg-muted"
        >
          Refresh Feed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none bg-card/40 backdrop-blur-md shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Reports</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary"><FileText className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered complaints</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-amber-500/5 backdrop-blur-md shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Clock className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-blue-500/5 backdrop-blur-md shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Verified</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><CheckCircle className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.verified}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed for action</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-indigo-500/5 backdrop-blur-md shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Ongoing</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><TrendingUp className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.ongoing}</div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing tasks</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-emerald-500/5 backdrop-blur-md shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><FileCheck className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully addressed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-muted-foreground/10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by label, description, address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background/50 border border-muted-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Tab Selection */}
        <div className="flex bg-muted/60 p-1 rounded-xl w-full md:w-auto overflow-x-auto gap-1">
          {["all", "pending", "verified", "resolved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-background shadow-sm text-primary font-bold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table/List */}
      <div className="bg-card/30 backdrop-blur-md rounded-2xl border border-muted-foreground/10 overflow-hidden shadow-xl">
        {filteredComplaints.length > 0 ? (
          <div className="divide-y divide-muted-foreground/10">
            {filteredComplaints.map((c) => (
              <div key={c._id} className="flex flex-col lg:flex-row p-6 gap-6 hover:bg-muted/10 transition-colors">
                
                {/* Image */}
                <div className="w-full lg:w-48 h-36 bg-muted rounded-xl overflow-hidden relative shrink-0">
                  <img 
                    src={c.imageUrl ? (c.imageUrl.startsWith("http://") || c.imageUrl.startsWith("https://") ? c.imageUrl : `${API_URL}${c.imageUrl}`) : "/placeholder-image.jpg"}
                    alt="Complaint Evidence"
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
                  />
                  
                  {/* AI Prediction Overlays */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className="bg-background/90 text-foreground backdrop-blur border-none font-bold capitalize text-xs">
                      {c.aiClassification?.label || "Unclassified"}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/95 text-primary-foreground backdrop-blur border-none text-[10px] font-semibold">
                      AI Conf: {Math.round((c.aiClassification?.confidence || 0) * 100)}%
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">ID: {c._id.substring(18)}</span>
                        <Badge 
                          className={`capitalize border ${
                            c.status === "resolved" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                              : c.status === "verified" 
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                              : c.status === "ongoing" 
                              ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" 
                              : c.status === "rejected" 
                              ? "bg-destructive/10 text-destructive border-destructive/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <p className="text-foreground font-semibold text-base leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    {/* Location Address */}
                    <div className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-full truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{c.location?.address || `Coordinates: ${c.location?.latitude.toFixed(4)}, ${c.location?.longitude.toFixed(4)}`}</span>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      {updatingId === c._id ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pr-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Updating...
                        </div>
                      ) : (
                        <>
                          {c.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(c._id, "verified")}
                                className="rounded-full border-blue-500/20 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(c._id, "ongoing")}
                                className="rounded-full border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                              >
                                <TrendingUp className="h-4 w-4 mr-1" /> Start Task
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(c._id, "rejected")}
                                className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          
                          {c.status === "verified" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(c._id, "ongoing")}
                                className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10"
                              >
                                <TrendingUp className="h-4 w-4 mr-1" /> Start Task
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(c._id, "resolved")}
                                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(c._id, "rejected")}
                                className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {c.status === "ongoing" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(c._id, "resolved")}
                                className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Complete Task
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(c._id, "rejected")}
                                className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                              >
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {(c.status === "resolved" || c.status === "rejected") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(c._id, "pending")}
                              className="rounded-full text-muted-foreground hover:text-foreground text-xs hover:bg-muted"
                            >
                              Reset to Pending
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 px-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No reports found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              There are no civic reports matching your search or active filter tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

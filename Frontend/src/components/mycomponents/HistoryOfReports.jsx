import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function HistoryOfReports() {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${API_URL}/api/reports/my-reports`);
        setMyReports(response.data);
      } catch (error) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false)
      }
    }
    fetchMyReports();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20">
      <Loader className="animate-spin" />
    </div>
  }
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">My Reported Issues</h1>

      <div className="space-y-4">
        {myReports.length > 0 ? (
          myReports.map((report) => (
            <Card key={report._id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-0 flex flex-col md:flex-row">
                {/* Small preview image */}
                <img
                  src={`${import.meta.env.VITE_API_URL}/${report.image}`}
                  className="w-full md:w-48 h-32 object-cover"
                  alt="Issue"
                />

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg capitalize">{report.label || "Pending AI Analysis"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                    </div>
                    <Badge variant={report.status === "resolved" ? "success" : "secondary"}>
                      {report.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-primary">
                      📍 {report.location || "Coordinates Saved"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">You haven't reported any issues yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};




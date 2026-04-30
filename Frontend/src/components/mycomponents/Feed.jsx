import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";

const Feed = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const [reports, setReports] = useState([]);
    const [loading, setLoading ] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/reports`);
                setReports(response.data);
                setError(null);
            } catch (error) {
                console.error("Fetch Error:", error);
                setError("Failed to load reports. Please check if the server is running.");
            } finally {
                setLoading(false)
            }
        }
        fetchReports();

    }, [])

    // 1. Loading State (Professional UX)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Scanning for civic issues...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex items-center justify-center p-6 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Live Issue Feed</h1>
                <p className="text-muted-foreground">Real-time reports from your community.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <Card key={report._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Image with fallback logic */}
                            <div className="aspect-video w-full bg-muted relative">
                                <img
                                    src={`${API_BASE_URL}/${report.image}`}
                                    alt={report.title || "Report Image"}
                                    className="object-cover w-full h-full"
                                    onError={(e) => { e.target.src = "/placeholder-image.jpg"; }} // Handle broken images
                                />
                            </div>

                            <CardHeader className="p-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-semibold capitalize">
                                        {report.label || "Unclassified Issue"}
                                    </CardTitle>
                                    <Badge variant={report.status === "resolved" ? "default" : "secondary"}>
                                        {report.status}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {report.description}
                                </p>
                                <div className="text-xs font-medium text-primary bg-primary/5 p-2 rounded">
                                    📍 {report.location || "Location not provided"}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">No reports found in your area.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
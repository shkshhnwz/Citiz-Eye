import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, MapPin, Loader2, CheckCircle2, FileImage, Link } from "lucide-react";
import axios from "axios";


const ReportForm = () => {
    const [uploadMethod, setUploadMethod] = useState("file"); // "file" | "url"
    const [imageUrl, setImageUrl] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location", error);
                    alert("Could not get your location. Please check your browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // CRITICAL: Allows the drop to happen
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadMethod === "file" && !file) return alert("Upload an image first!");
        if (uploadMethod === "url" && !imageUrl) return alert("Please provide an image URL!");
        if (!latitude || !longitude) return alert("Please provide location coordinates!");

        setLoading(true);
        const formData = new FormData();
        if (uploadMethod === "file") {
            formData.append("image", file);
        } else {
            formData.append("imageUrl", imageUrl);
        }
        formData.append("description", description);
        formData.append("location", JSON.stringify({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address: address
        }));
        
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            await axios.post(`${API_URL}/api/reports`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Reset after success
            setFile(null);
            setImageUrl("");
            setPreview(null);
            setDescription("");
            setLatitude("");
            setLongitude("");
            setAddress("");
        } catch (err) {
            console.error("Upload error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card className="w-full border-none shadow-2xl bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center tracking-tight">
            Submit New Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* UPLOAD METHOD TOGGLE */}
          <div className="flex bg-muted/50 p-1 rounded-xl w-fit mx-auto">
            <button
              type="button"
              onClick={() => {
                setUploadMethod("file");
                if (file) setPreview(URL.createObjectURL(file));
                else setPreview(null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                uploadMethod === "file" 
                  ? "bg-background shadow-sm text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod("url");
                setPreview(imageUrl || null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                uploadMethod === "url" 
                  ? "bg-background shadow-sm text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Image URL
            </button>
          </div>

          {uploadMethod === "file" ? (
          /* DRAG & DROP ZONE */
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-10 transition-all duration-200 cursor-pointer text-center
              ${isDragging 
                ? "border-primary bg-primary/10 scale-[1.01] shadow-inner" 
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
              }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => handleFile(e.target.files[0])} 
              className="hidden" 
              accept="image/*" 
            />
            
            {preview ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="mx-auto max-h-72 rounded-xl object-cover shadow-lg" 
                />
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute -top-3 -right-3 rounded-full shadow-xl hover:scale-110 transition-transform"
                  onClick={(e) => { 
                    e.stopPropagation(); // Prevents clicking the box again
                    setPreview(null); 
                    setFile(null); 
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">
                    {isDragging ? "Drop to upload" : "Drag and drop your image"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or <span className="text-primary underline font-medium">browse files</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <FileImage className="h-4 w-4" />
                  Supports high-res JPG, PNG
                </div>
              </div>
            )}
          </div>
          ) : (
            /* IMAGE URL INPUT */
            <div className="space-y-4 bg-background/50 border-2 border-dashed border-muted-foreground/20 rounded-2xl p-6">
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Image URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="flex h-10 w-full rounded-xl border border-muted-foreground/20 bg-background/50 pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={imageUrl}
                      onChange={(e) => {
                          setImageUrl(e.target.value);
                          setPreview(e.target.value || null);
                      }}
                    />
                  </div>
                  {imageUrl && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => { setImageUrl(""); setPreview(null); }}
                      className="rounded-xl h-10 w-10 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {preview && uploadMethod === "url" && (
                <div className="relative mt-4 bg-muted/20 p-2 rounded-xl">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Invalid+Image+URL" }}
                    className="mx-auto max-h-72 rounded-xl object-cover shadow-lg" 
                  />
                </div>
              )}
            </div>
          )}

          {/* ADDITIONAL INFO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">
                Issue Description
              </label>
              <span className="text-xs text-muted-foreground/50 italic">Optional</span>
            </div>
            <Textarea 
              placeholder="Describe what's wrong (e.g. 'Pothole near the bus stop')" 
              className="min-h-[120px] bg-background/50 border-muted-foreground/20 focus:ring-primary/20 rounded-xl resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* LOCATION INFO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">
                Location Details
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={getLocation}
                className="h-8 gap-1 text-xs"
              >
                <MapPin className="h-3 w-3" /> Get Current Location
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Latitude <span className="text-red-500">*</span></label>
                <input 
                  type="number"
                  step="any"
                  placeholder="e.g. 40.7128"
                  className="flex h-10 w-full rounded-xl border border-muted-foreground/20 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground ml-1">Longitude <span className="text-red-500">*</span></label>
                <input 
                  type="number"
                  step="any"
                  placeholder="e.g. -74.0060"
                  className="flex h-10 w-full rounded-xl border border-muted-foreground/20 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs text-muted-foreground ml-1">Address <span className="italic opacity-50">(Optional)</span></label>
              <input 
                type="text"
                placeholder="Nearest landmark or street address"
                className="flex h-10 w-full rounded-xl border border-muted-foreground/20 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (uploadMethod === "file" ? !file : !imageUrl)} 
            className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-3 h-5 w-5" />
                Processing through AI...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-3 h-5 w-5" />
                Submit Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm;

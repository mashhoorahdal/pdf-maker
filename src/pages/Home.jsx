import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import Preview from "./Preview";

const Home = () => {
  const [data, setData] = useState({ url: "", screenshots: [] });
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "screenshots") {
      const validFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (validFiles.length) {
        setData((prev) => ({
          ...prev,
          screenshots: [...prev.screenshots, ...validFiles],
        }));
      } else {
        toast.error("Please select image files.");
      }
    } else {
      setData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.url) {
      toast.error("Please enter a URL");
      return;
    }
    if (!data.screenshots.length) {
      toast.error("Please add at least one screenshot");
      return;
    }

    if (editIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editIndex] = data;
      setItems(updatedItems);
      toast.success(`Entry updated successfully`);
    } else {
      setItems((prev) => [...prev, data]);
      toast.success(`Entry added successfully`);
    }
    setData({ url: "", screenshots: [] });
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.success("Entry deleted successfully");
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setData(items[index]);
  };

  const handleExportPDF = async () => {
    if (!items.length) {
      toast.error("No entries to export");
      return;
    }

    const pdf = new jsPDF();
    pdf.setFont("helvetica");

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (i > 0) pdf.addPage();

      pdf.setFontSize(16);
      pdf.text(`Entry ${i + 1}: ${item.url}`, 10, 20);

      let yOffset = 40;
      for (const screenshot of item.screenshots) {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function(event) {
            const imgData = event.target.result;
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              const maxWidth = 190;
              const width = maxWidth;
              const height = width / aspectRatio;
              
              pdf.addImage(imgData, 'JPEG', 10, yOffset, width, height);
              yOffset += height + 10;
              resolve();
            };
          };
          reader.readAsDataURL(screenshot);
        });
      }
    }

    pdf.save("url-tracker.pdf");
    toast.success("PDF exported successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">URL Tracker</h1>
          <p className="text-gray-600 mt-2">Track and organize website content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-white">
                <CardTitle>{editIndex !== null ? "Edit Entry" : "Add Entry"}</CardTitle>
                <CardDescription>Enter URL and add screenshots</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={data.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="screenshots">Screenshots</Label>
                    <Input
                      id="screenshots"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="bg-gray-50">
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                >
                  {editIndex !== null ? "Update" : "Add"}
                </Button>
              </CardFooter>
            </Card>

            {items.map((item, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader className="border-b">
                  <CardTitle>Entry {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 break-all mb-4">{item.url}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {item.screenshots.map((screenshot, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={URL.createObjectURL(screenshot)}
                        alt={`Screenshot ${imgIndex + 1}`}
                        className="w-full h-auto rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 bg-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-8">
            {data.url && <Preview link={data.url} />}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExportPDF}
          className="fixed bottom-6 right-6 z-10 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 animate-bounce"
          disabled={!items.length}
        >
          <div className="relative">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <span className="font-semibold">Export PDF</span>
          {!items.length && (
            <div className="absolute -top-12 right-0 bg-gray-800 text-white text-sm py-1 px-3 rounded shadow-lg whitespace-nowrap">
              Add items to export
              <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
            </div>
          )}
        </Button>
      </div>
      <Toaster />
    </div>
  );
};

export default Home;

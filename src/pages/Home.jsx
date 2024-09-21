import React, { useEffect, useState } from "react";
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

const Home = () => {
  const [data, setData] = useState({ url: '', text: '', screenshots: [] });
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "screenshots") {
      const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
      if (validFiles.length) {
        setData(prev => ({ ...prev, screenshots: [...prev.screenshots, ...validFiles] }));
      } else {
        toast.error("Please select image files.");
      }
    } else {
      setData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = () => {
    if (data.url && data.screenshots.length) {
      if (editIndex !== null) {
        const updatedItems = items.map((item, index) =>
          index === editIndex ? data : item
        );
        setItems(updatedItems);
        toast(`${data.url} updated successfully`);
      } else {
        toast(`${data.url} added successfully`);
        setItems(prev => [...prev, data]);
      }
      setData({ url: '', screenshots: [] });
      setEditIndex(null);
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  const handleDelete = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    toast("Item deleted successfully");
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setData(items[index]);
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF();
    pdf.setFont("Arial");
  
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
  
      pdf.setFontSize(16);
      pdf.text(`URL ${index + 1}: ${item.url}`, 10, 10 + index * 70);
      pdf.setFontSize(12);
  
      const promises = item.screenshots.map((screenshot, imgIndex) => {
        return new Promise((resolve) => {
          const imgData = URL.createObjectURL(screenshot);
          const img = new Image();
  
          img.src = imgData;
          img.onload = () => {
            const imgWidth = img.width * 0.75;
            const imgHeight = img.height * 0.75;
            const maxWidth = 180;
            const maxHeight = 100;
            const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            const finalWidth = imgWidth * ratio;
            const finalHeight = imgHeight * ratio;
  
            const yPos = 20 + (imgIndex * (finalHeight + 10)) + index * 70;
  
            pdf.addImage(imgData, 'JPEG', 10, yPos, finalWidth, finalHeight);
            resolve();
          };
        });
      });
  
      await Promise.all(promises);
  
      const lastImageHeight = item.screenshots.length > 0 ? 20 + ((item.screenshots.length - 1) * (100 + 10)) + index * 70 : 0;
      pdf.line(10, lastImageHeight + 10, 200, lastImageHeight + 10);
  
      if (index < items.length - 1) {
        pdf.addPage();
      }
    }
  
    pdf.save("items.pdf");
    toast("PDF exported successfully");
  };
  

  useEffect(() => {
    console.log("Effect");
  }, [items]);

  return (
    <>
      <h1 className="font-bold text-center mt-5">URL TRACKER TOOL</h1>
      <div className="md:mt-10 md:ml-20 justify-center p-3">
        <Card>
          <CardHeader>
            <CardTitle>{editIndex !== null ? "Edit Item" : "Add Item"}</CardTitle>
            <CardDescription>Add the URL and screenshots</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="url">Type the URL</Label>
              <Input
                onChange={handleInputChange}
                id="url"
                type="text"
                placeholder="http://..."
                value={data.url}
                className="mb-3"
              />
              <Label htmlFor="screenshots">Upload Screenshots</Label>
              <Input
                onChange={handleInputChange}
                id="screenshots"
                type="file"
                accept="image/*"
                multiple
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleSubmit}>
              {editIndex !== null ? "Update" : "Add"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Toaster />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3">
        {items.length > 0 &&
          items.map((item, key) => (
            <Card key={key} className="flex flex-col">
              <CardHeader>
                <CardTitle>{item.url}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {item.screenshots.map((screenshot, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(screenshot)}
                    alt="Screenshot"
                    className="w-full h-auto mb-2"
                  />
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(key)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-500"
                  onClick={() => handleDelete(key)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
      <Button
        variant="outline"
        onClick={handleExportPDF}
        className="fixed bottom-4 right-4 z-10 bg-slate-600 hover:bg-green-600"
      >
        Export as PDF
      </Button>
    </>
  );
};

export default Home;

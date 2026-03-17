import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ImagePlus,
  Loader2,
  PackageSearch,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Category, ItemType } from "../backend.d";
import { createStorageClient, useBackend } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const categories = Object.values(Category);

export default function PostItemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const backend = useBackend();
  const { identity } = useInternetIdentity();

  const initialType =
    searchParams.get("type") === "found" ? ItemType.found : ItemType.lost;
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>(Category.other);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backend || !title || !description || !location || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        setUploading(true);
        try {
          const storageClient = await createStorageClient(identity);
          const bytes = new Uint8Array(await imageFile.arrayBuffer());
          const { hash } = await storageClient.putFile(bytes, (pct) =>
            setUploadProgress(pct),
          );
          imageUrl = await storageClient.getDirectURL(hash);
        } finally {
          setUploading(false);
        }
      }

      await backend.createItem(
        itemType,
        title,
        description,
        category,
        location,
        date,
        imageUrl,
      );
      toast.success("Item posted successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post item. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const isLost = itemType === ItemType.lost;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Post an Item
        </h1>
        <p className="text-muted-foreground mt-2">
          Help reunite lost items with their owners.
        </p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Item Details</CardTitle>
          <div className="flex rounded-lg overflow-hidden border border-border mt-3">
            <button
              type="button"
              onClick={() => setItemType(ItemType.lost)}
              data-ocid="post_item.lost_toggle"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                isLost
                  ? "bg-red-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <AlertCircle className="w-4 h-4" /> Lost
            </button>
            <button
              type="button"
              onClick={() => setItemType(ItemType.found)}
              data-ocid="post_item.found_toggle"
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                !isLost
                  ? "bg-emerald-600 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <PackageSearch className="w-4 h-4" /> Found
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="title" className="mb-1.5 block">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Black iPhone 14 Pro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-ocid="post_item.title_input"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-1.5 block">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail including any identifying features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-ocid="post_item.description_textarea"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as Category)}
                >
                  <SelectTrigger data-ocid="post_item.category_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date" className="mb-1.5 block">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-ocid="post_item.date_input"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="mb-1.5 block">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Central Park, New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                data-ocid="post_item.location_input"
                required
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Image (optional)</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden h-48">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <Progress value={uploadProgress} className="w-32" />
                      <span className="text-white text-sm">
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="post_item.upload_button"
                  className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm font-medium">
                    Click to upload image
                  </span>
                  <span className="text-xs">PNG, JPG up to 10MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || uploading}
              data-ocid="post_item.submit_button"
              className="w-full h-11 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Post{" "}
                  {isLost ? "Lost" : "Found"} Item
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

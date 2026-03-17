import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Loader2,
  MapPin,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { type Item, ItemType, Status } from "../backend.d";
import ItemCard from "../components/ItemCard";
import { useBackend } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const backend = useBackend();
  const { identity } = useInternetIdentity();
  const [item, setItem] = useState<Item | null>(null);
  const [similar, setSimilar] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!id || !backend) return;
    setLoading(true);
    Promise.all([
      backend.getItemById(id),
      backend.getSimilarItems(id).catch(() => [] as Item[]),
    ])
      .then(([itemData, similarData]) => {
        setItem(itemData);
        setSimilar(similarData.filter((s) => s.id !== id).slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, backend]);

  const handleClaim = async () => {
    if (!id || !backend || !claimMessage.trim()) return;
    setSubmitting(true);
    try {
      await backend.createClaim(id, claimMessage);
      toast.success("Claim submitted successfully!");
      setClaimOpen(false);
      setClaimMessage("");
    } catch {
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !backend) return;
    setResolving(true);
    try {
      await backend.updateItemStatus(id, Status.resolved);
      setItem((prev) => (prev ? { ...prev, status: Status.resolved } : prev));
      toast.success("Item marked as resolved!");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setResolving(false);
    }
  };

  const isOwner =
    item &&
    identity &&
    item.postedBy.toString() === identity.getPrincipal().toString();
  const isLost = item?.itemType === ItemType.lost;
  const isResolved = item?.status === Status.resolved;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-72 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Item not found.</p>
        <Button
          onClick={() => navigate("/browse")}
          variant="outline"
          className="mt-4"
        >
          Browse Items
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="rounded-xl overflow-hidden bg-muted h-72 md:h-auto">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {item.category === "electronics"
                ? "📱"
                : item.category === "keys"
                  ? "🔑"
                  : "📦"}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                isLost ? "badge-lost" : "badge-found"
              }`}
            >
              {isLost ? "LOST" : "FOUND"}
            </span>
            {isResolved && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                <CheckCircle className="w-3.5 h-3.5" /> RESOLVED
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            {item.title}
          </h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {item.description}
          </p>

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground">{item.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground capitalize">
                {item.category}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {identity && !isOwner && !isResolved && (
              <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                <DialogTrigger asChild>
                  <Button
                    data-ocid="item_detail.claim_button"
                    className="font-semibold"
                  >
                    Claim This Item
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="claim_modal.dialog">
                  <DialogHeader>
                    <DialogTitle>Submit a Claim</DialogTitle>
                    <DialogDescription>
                      Describe why you believe this item belongs to you or how
                      you can help.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2">
                    <Label htmlFor="claim-msg" className="mb-2 block">
                      Your message
                    </Label>
                    <Textarea
                      id="claim-msg"
                      placeholder="e.g. This is my laptop. It has a sticker on the back..."
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      data-ocid="claim_modal.textarea"
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setClaimOpen(false)}
                      data-ocid="claim_modal.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleClaim}
                      disabled={submitting || !claimMessage.trim()}
                      data-ocid="claim_modal.submit_button"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        "Submit Claim"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {isOwner && !isResolved && (
              <Button
                variant="outline"
                onClick={handleResolve}
                disabled={resolving}
                data-ocid="item_detail.resolve_button"
              >
                {resolving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                  </>
                )}
              </Button>
            )}
            {!identity && !isResolved && (
              <p className="text-sm text-muted-foreground">
                Sign in to claim this item.
              </p>
            )}
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">
              AI-Suggested Similar Items
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Based on text similarity
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((s, i) => (
              <ItemCard key={s.id} item={s} index={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

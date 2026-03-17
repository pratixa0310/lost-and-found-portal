import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Loader2,
  MessageSquare,
  PackageSearch,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { type Claim, type Item, Status } from "../backend.d";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import { useBackend } from "../hooks/useBackend";

const statusColors: Record<string, string> = {
  [Status.active]: "bg-green-100 text-green-700",
  [Status.resolved]: "bg-blue-100 text-blue-700",
  [Status.pending]: "bg-yellow-100 text-yellow-700",
  [Status.approved]: "bg-green-100 text-green-700",
  [Status.rejected]: "bg-red-100 text-red-700",
};

const SK_3 = ["a", "b", "c"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const backend = useBackend();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!backend) return;
    backend
      .getUserItems()
      .then(setMyItems)
      .catch(console.error)
      .finally(() => setLoadingItems(false));
    backend
      .getUserClaims()
      .then(setMyClaims)
      .catch(console.error)
      .finally(() => setLoadingClaims(false));
  }, [backend]);

  const handleDelete = async (id: string) => {
    if (!backend) return;
    setDeletingId(id);
    try {
      await backend.deleteItem(id);
      setMyItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item deleted.");
    } catch {
      toast.error("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your posts and claims
          </p>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts" data-ocid="dashboard.my_posts_tab">
            My Posts{" "}
            {myItems.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {myItems.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims" data-ocid="dashboard.my_claims_tab">
            My Claims{" "}
            {myClaims.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {myClaims.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {loadingItems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SK_3.map((k) => (
                <ItemCardSkeleton key={k} />
              ))}
            </div>
          ) : myItems.length === 0 ? (
            <div
              className="text-center py-20"
              data-ocid="dashboard.empty_state"
            >
              <PackageSearch className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-40" />
              <p className="text-muted-foreground text-lg font-medium">
                No items posted yet
              </p>
              <Button onClick={() => navigate("/post")} className="mt-4">
                Post Your First Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item, i) => (
                <div key={item.id} className="relative group">
                  <ItemCard item={item} index={i + 1} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    data-ocid={`dashboard.delete_button.${i + 1}`}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 px-2"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims">
          {loadingClaims ? (
            <div className="flex flex-col gap-3">
              {SK_3.map((k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : myClaims.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-40" />
              <p className="text-muted-foreground text-lg font-medium">
                No claims submitted yet
              </p>
              <Button
                onClick={() => navigate("/browse")}
                variant="outline"
                className="mt-4"
              >
                Browse Items to Claim
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myClaims.map((claim, i) => (
                <Card
                  key={claim.id}
                  data-ocid={`dashboard.claim.item.${i + 1}`}
                  className="border border-border"
                >
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Claim on item:{" "}
                        <button
                          type="button"
                          className="text-primary cursor-pointer hover:underline bg-transparent border-none p-0"
                          onClick={() => navigate(`/items/${claim.itemId}`)}
                        >
                          {claim.itemId.slice(0, 12)}...
                        </button>
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {claim.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(
                          Number(claim.createdAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusColors[claim.status] || "bg-muted text-muted-foreground"}`}
                    >
                      {claim.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

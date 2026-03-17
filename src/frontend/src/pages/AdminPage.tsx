import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { type Claim, type Item, Status } from "../backend.d";
import { useBackend } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const SK_5 = ["a", "b", "c", "d", "e"];

export default function AdminPage() {
  const navigate = useNavigate();
  const backend = useBackend();
  const { identity } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!backend || !identity) {
      navigate("/login");
      return;
    }
    backend
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
        if (result) {
          backend
            .getAllItemsAdmin()
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoadingItems(false));
          backend
            .getAllClaimsAdmin()
            .then(setClaims)
            .catch(console.error)
            .finally(() => setLoadingClaims(false));
        } else {
          setLoadingItems(false);
          setLoadingClaims(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, [backend, identity, navigate]);

  const handleDeleteItem = async (id: string) => {
    if (!backend) return;
    setActionId(id);
    try {
      await backend.deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item deleted.");
    } catch {
      toast.error("Failed to delete item.");
    } finally {
      setActionId(null);
    }
  };

  const handleUpdateClaim = async (claimId: string, status: Status) => {
    if (!backend) return;
    setActionId(claimId);
    try {
      await backend.updateClaimStatus(claimId, status);
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status } : c)),
      );
      toast.success(`Claim ${status}.`);
    } catch {
      toast.error("Failed to update claim.");
    } finally {
      setActionId(null);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4 opacity-60" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mt-4"
        >
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all posts and claims
          </p>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="mb-6">
          <TabsTrigger value="posts" data-ocid="admin.posts_tab">
            All Posts{" "}
            {items.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims" data-ocid="admin.claims_tab">
            All Claims{" "}
            {claims.length > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                {claims.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {loadingItems ? (
            <div className="flex flex-col gap-2">
              {SK_5.map((k) => (
                <Skeleton key={k} className="h-12 rounded" />
              ))}
            </div>
          ) : (
            <Card className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        className="font-medium cursor-pointer hover:text-primary"
                        onClick={() => navigate(`/items/${item.id}`)}
                      >
                        {item.title.slice(0, 30)}
                        {item.title.length > 30 ? "..." : ""}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.itemType === "lost" ? "badge-lost" : "badge-found"}`}
                        >
                          {item.itemType.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.category}
                      </TableCell>
                      <TableCell>{item.location.slice(0, 20)}</TableCell>
                      <TableCell className="capitalize">
                        {item.status}
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={actionId === item.id}
                          data-ocid="admin.delete_button"
                          className="h-7 px-2"
                        >
                          {actionId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No items found.
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="claims">
          {loadingClaims ? (
            <div className="flex flex-col gap-2">
              {SK_5.map((k) => (
                <Skeleton key={k} className="h-12 rounded" />
              ))}
            </div>
          ) : (
            <Card className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">
                        {claim.itemId.slice(0, 16)}...
                      </TableCell>
                      <TableCell>
                        {claim.message.slice(0, 50)}
                        {claim.message.length > 50 ? "..." : ""}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                            claim.status === Status.approved
                              ? "bg-green-100 text-green-700"
                              : claim.status === Status.rejected
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {claim.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {claim.status === Status.pending && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() =>
                                  handleUpdateClaim(claim.id, Status.approved)
                                }
                                disabled={actionId === claim.id}
                                data-ocid="admin.approve_button"
                              >
                                {actionId === claim.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() =>
                                  handleUpdateClaim(claim.id, Status.rejected)
                                }
                                disabled={actionId === claim.id}
                                data-ocid="admin.reject_button"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {claims.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No claims found.
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

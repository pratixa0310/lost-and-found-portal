import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  PackageSearch,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Item, Stats } from "../backend.d";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import { useBackend } from "../hooks/useBackend";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export default function HomePage() {
  const navigate = useNavigate();
  const backend = useBackend();
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend) return;
    setLoading(true);
    Promise.all([backend.getItems(), backend.getStats()])
      .then(([allItems, statsData]) => {
        setItems(allItems.slice(0, 6));
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [backend]);

  const statCards = stats
    ? [
        {
          label: "Items Reported Lost",
          value: Number(stats.totalLost),
          icon: AlertCircle,
          color: "text-red-500",
        },
        {
          label: "Items Found",
          value: Number(stats.totalFound),
          icon: PackageSearch,
          color: "text-emerald-500",
        },
        {
          label: "Successfully Resolved",
          value: Number(stats.totalResolved),
          icon: CheckCircle,
          color: "text-blue-500",
        },
        {
          label: "Total Claims",
          value: Number(stats.totalClaims),
          icon: TrendingUp,
          color: "text-primary",
        },
      ]
    : [];

  return (
    <div>
      <section className="gradient-hero py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Community Lost & Found
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mb-6">
            Reuniting People
            <br />
            <span className="text-primary">with Their Belongings</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Post lost or found items, connect with your community, and help
            bring belongings back to their owners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="destructive"
              onClick={() => navigate("/post?type=lost")}
              data-ocid="home.report_lost_button"
              className="h-12 px-8 text-base font-semibold"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              Report Lost Item
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/post?type=found")}
              data-ocid="home.report_found_button"
              className="h-12 px-8 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <PackageSearch className="w-5 h-5 mr-2" />
              Report Found Item
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/browse")}
              data-ocid="home.browse_button"
              className="h-12 px-8 text-base font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Items
            </Button>
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-12 px-4 border-b border-border bg-card">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {statCards.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
                <div className="font-display text-3xl font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Recent Items
              </h2>
              <p className="text-muted-foreground mt-1">
                Latest lost and found reports from the community
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/browse")}
              className="hidden sm:flex"
            >
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SKELETON_KEYS.map((k) => (
                <ItemCardSkeleton key={k} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <PackageSearch className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-40" />
              <p className="text-muted-foreground text-lg">
                No items posted yet. Be the first!
              </p>
              <Button onClick={() => navigate("/post")} className="mt-4">
                <Plus className="w-4 h-4 mr-2" /> Post an Item
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {items.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

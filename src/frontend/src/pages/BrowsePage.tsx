import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, PackageSearch, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Category, type Item, ItemType } from "../backend.d";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import { useBackend } from "../hooks/useBackend";

const categories = Object.values(Category);
const SK_BROWSE = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function BrowsePage() {
  const backend = useBackend();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    if (!backend) return;
    backend
      .getItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [backend]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.itemType === typeFilter;
      const matchesCat =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesLoc =
        !locationFilter ||
        item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesType && matchesCat && matchesLoc;
    });
  }, [items, search, typeFilter, categoryFilter, locationFilter]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setLocationFilter("");
  };
  const hasFilters =
    search ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    locationFilter;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Browse Items
        </h1>
        <p className="text-muted-foreground mt-2">
          Search through lost and found reports in your community.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto h-7 text-xs gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="browse.search_input"
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger data-ocid="browse.type_select">
              <SelectValue placeholder="Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type: All</SelectItem>
              <SelectItem value={ItemType.lost}>Lost</SelectItem>
              <SelectItem value={ItemType.found}>Found</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger data-ocid="browse.category_select">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category: All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {loading
          ? "Loading..."
          : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SK_BROWSE.map((k) => (
            <ItemCardSkeleton key={k} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" data-ocid="browse.empty_state">
          <PackageSearch className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-lg font-medium">
            No items found
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {filtered.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

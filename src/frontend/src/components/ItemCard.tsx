import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ImageOff, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { type Item, ItemType, Status } from "../backend.d";

interface ItemCardProps {
  item: Item;
  index?: number;
}

const categoryIcons: Record<string, string> = {
  electronics: "📱",
  clothing: "👕",
  accessories: "👜",
  documents: "📄",
  keys: "🔑",
  pets: "🐾",
  wallet: "👛",
  other: "📦",
};

export default function ItemCard({ item, index = 1 }: ItemCardProps) {
  const isLost = item.itemType === ItemType.lost;
  const isResolved = item.status === Status.resolved;

  return (
    <Link
      to={`/items/${item.id}`}
      data-ocid={`item_card.item.${index}`}
      className="block"
    >
      <Card
        className={`card-hover cursor-pointer overflow-hidden border border-border ${
          isResolved ? "opacity-70" : ""
        }`}
      >
        {/* Image area */}
        <div className="relative h-44 bg-muted overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <span className="text-4xl">
                {categoryIcons[item.category] || "📦"}
              </span>
              <ImageOff className="w-5 h-5 opacity-40" />
            </div>
          )}
          {/* Type badge overlay */}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                isLost ? "badge-lost" : "badge-found"
              }`}
            >
              {isLost ? "LOST" : "FOUND"}
            </span>
          </div>
          {isResolved && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                RESOLVED
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-foreground line-clamp-1 mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="w-3.5 h-3.5" />
                <span className="capitalize">{item.category}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

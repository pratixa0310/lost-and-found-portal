import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Claim {
    id: string;
    status: Status;
    itemId: string;
    createdAt: bigint;
    claimedBy: Principal;
    message: string;
}
export interface Item {
    id: string;
    status: Status;
    title: string;
    postedBy: Principal;
    date: string;
    createdAt: bigint;
    description: string;
    imageUrl: string;
    itemType: ItemType;
    category: Category;
    location: string;
}
export interface Stats {
    totalFound: bigint;
    totalResolved: bigint;
    totalLost: bigint;
    totalClaims: bigint;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    documents = "documents",
    clothing = "clothing",
    accessories = "accessories",
    other = "other",
    keys = "keys",
    pets = "pets",
    wallet = "wallet",
    electronics = "electronics"
}
export enum ItemType {
    found = "found",
    lost = "lost"
}
export enum Status {
    resolved = "resolved",
    active = "active",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClaim(itemId: string, message: string): Promise<Claim>;
    createItem(itemType: ItemType, title: string, description: string, category: Category, location: string, date: string, imageUrl: string): Promise<Item>;
    deleteItem(id: string): Promise<void>;
    getAllClaimsAdmin(): Promise<Array<Claim>>;
    getAllItemsAdmin(): Promise<Array<Item>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClaimsForItem(itemId: string): Promise<Array<Claim>>;
    getItemById(id: string): Promise<Item | null>;
    getItems(): Promise<Array<Item>>;
    getSimilarItems(itemId: string): Promise<Array<Item>>;
    getStats(): Promise<Stats>;
    getUserClaims(): Promise<Array<Claim>>;
    getUserItems(): Promise<Array<Item>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClaimStatus(claimId: string, status: Status): Promise<void>;
    updateItemStatus(id: string, status: Status): Promise<void>;
}

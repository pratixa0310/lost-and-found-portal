# Lost and Found Portal

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- User authentication (register, login, logout) with role-based access (user, admin)
- Post Lost Item: title, description, category, location, date, image upload
- Post Found Item: same fields with "found" type
- Item listing page with search and filter (by category, location, date, type)
- Item detail page with claim request button
- Claim request system: authenticated users can submit a claim on a found item; item owner is notified via status
- Admin panel: view all posts, delete posts, view all claims, manage users
- User dashboard: view own posts (lost/found), view own submitted claims and their status
- AI-style item matching: when viewing a lost item, suggest similar found items using text similarity on title+description
- Homepage with hero section, stats, recent items
- Navbar with login/logout, links to post item, dashboard
- Animated item cards, hover effects, loading skeletons

### Modify
N/A (new project)

### Remove
N/A (new project)

## Implementation Plan
1. Select components: authorization, blob-storage
2. Generate Motoko backend:
   - Item type: { id, type (lost/found), title, description, category, location, date, imageUrl, postedBy, status, createdAt }
   - Categories: Electronics, Clothing, Accessories, Documents, Keys, Pets, Wallet, Other
   - CRUD: createItem, getItems, getItemById, updateItem, deleteItem
   - Filtering: by type, category, location, date range
   - Claim type: { id, itemId, claimedBy, message, status (pending/approved/rejected), createdAt }
   - Claim CRUD: createClaim, getClaimsForItem, getUserClaims, updateClaimStatus
   - Admin functions: getAllItems, getAllClaims, deleteItem, getAllUsers
   - Similarity matching: getSimilarItems(itemId) -- compare title+description tokens
3. Build React frontend:
   - Pages: Home, Items (browse), ItemDetail, PostItem, Dashboard, AdminPanel, Login, Register
   - Components: Navbar, ItemCard (animated), SearchFilter, ClaimModal, LoadingSkeleton, HeroSection
   - Wire authorization, blob-storage for image uploads
   - Implement text similarity matching display on ItemDetail

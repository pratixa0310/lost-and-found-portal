import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Timer "mo:core/Timer";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Author "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  module App {
    public type ItemType = {
      #lost;
      #found;
    };

    public type Status = {
      #pending;
      #resolved;
      #approved;
      #rejected;
      #active;
    };
  };

  type ItemType = App.ItemType;
  type Status = App.Status;

  type Category = {
    #electronics;
    #clothing;
    #accessories;
    #documents;
    #keys;
    #pets;
    #wallet;
    #other;
  };

  type Stats = {
    totalLost : Nat;
    totalFound : Nat;
    totalResolved : Nat;
    totalClaims : Nat;
  };

  public type Claim = {
    id : Text;
    itemId : Text;
    claimedBy : Principal;
    message : Text;
    status : Status;
    createdAt : Int;
  };

  public type Item = {
    id : Text;
    itemType : ItemType;
    title : Text;
    description : Text;
    category : Category;
    location : Text;
    date : Text;
    imageUrl : Text;
    postedBy : Principal;
    status : Status;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  module Item {
    public func compare(item1 : Item, item2 : Item) : Order.Order {
      Text.compare(item1.id, item2.id);
    };
  };

  module Claim {
    public func compare(claim1 : Claim, claim2 : Claim) : Order.Order {
      Text.compare(claim1.id, claim2.id);
    };
  };

  let items = Map.empty<Text, Item>();
  let claims = Map.empty<Text, Claim>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 0;

  // Authorization Setup
  let accessControlState = Author.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Author.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Author.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Author.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Item Functions
  public shared ({ caller }) func createItem(itemType : ItemType, title : Text, description : Text, category : Category, location : Text, date : Text, imageUrl : Text) : async Item {
    if (not Author.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create items");
    };

    let id = nextId.toText();
    nextId += 1;

    let newItem : Item = {
      id;
      itemType;
      title;
      description;
      category;
      location;
      date;
      imageUrl;
      postedBy = caller;
      status = #active;
      createdAt = Time.now();
    };

    items.add(id, newItem);
    newItem;
  };

  public query ({ caller }) func getItems() : async [Item] {
    items.values().toArray().filter(
      func(item) {
        item.status == #active;
      }
    );
  };

  public query ({ caller }) func getItemById(id : Text) : async ?Item {
    items.get(id);
  };

  public query ({ caller }) func getUserItems() : async [Item] {
    items.values().toArray().filter(
      func(item) {
        item.postedBy == caller;
      }
    );
  };

  public shared ({ caller }) func updateItemStatus(id : Text, status : Status) : async () {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.postedBy != caller and not Author.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only item owner or admin can update");
        };
        items.add(id, { item with status });
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Text) : async () {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.postedBy != caller and not Author.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only item owner or admin can delete");
        };
        items.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllItemsAdmin() : async [Item] {
    if (not (Author.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    items.values().toArray();
  };

  public query ({ caller }) func getSimilarItems(itemId : Text) : async [Item] {
    switch (items.get(itemId)) {
      case (null) { [] };
      case (?item) {
        let similarityScores = Map.empty<Text, Nat>();

        items.values().toArray().filter(
          func(otherItem) {
            otherItem.status == #active and otherItem.itemType != item.itemType;
          }
        ).forEach(
          func(otherItem) {
            let score = calculateSimilarity(item.title # " " # item.description, otherItem.title # " " # otherItem.description);
            similarityScores.add(otherItem.id, score);
          }
        );

        let sortedItems = items.values().toArray().sort(
          func(a, b) {
            switch (Nat.compare(toNat(similarityScores.get(a.id)), toNat(similarityScores.get(b.id)))) {
              case (#greater) { #less };
              case (#less) { #greater };
              case (#equal) { #equal };
            };
          }
        );

        sortedItems.sliceToArray(0, Nat.min(5, sortedItems.size()));
      };
    };
  };

  func toNat(score : ?Nat) : Nat {
    switch (score) {
      case (null) { 0 };
      case (?s) { s };
    };
  };

  func calculateSimilarity(text1 : Text, text2 : Text) : Nat {
    let words1 = text1.trim(#char ' ').toLower().split(#char ' ').toArray();
    let words2 = text2.trim(#char ' ').toLower().split(#char ' ').toArray();

    let set1 = Set.empty<Text>();
    for (word in words1.values()) {
      set1.add(word);
    };
    let set2 = Set.empty<Text>();
    for (word in words2.values()) {
      set2.add(word);
    };

    let intersection = set1.intersection(set2).size();
    let union = set1.union(set2).size();

    if (union == 0) { 0 } else {
      (intersection * 100) / union;
    };
  };

  // Claim Functions
  public shared ({ caller }) func createClaim(itemId : Text, message : Text) : async Claim {
    if (not Author.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create claims");
    };

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.postedBy == caller) {
          Runtime.trap("Cannot claim your own item");
        };

        let id = nextId.toText();
        nextId += 1;

        let newClaim : Claim = {
          id;
          itemId;
          claimedBy = caller;
          message;
          status = #pending;
          createdAt = Time.now();
        };

        claims.add(id, newClaim);
        newClaim;
      };
    };
  };

  public query ({ caller }) func getClaimsForItem(itemId : Text) : async [Claim] {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        if (item.postedBy != caller and not Author.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only item owner or admin can view claims");
        };
        claims.values().toArray().filter(
          func(claim) {
            claim.itemId == itemId;
          }
        );
      };
    };
  };

  public query ({ caller }) func getUserClaims() : async [Claim] {
    claims.values().toArray().filter(
      func(claim) {
        claim.claimedBy == caller;
      }
    );
  };

  public shared ({ caller }) func updateClaimStatus(claimId : Text, status : Status) : async () {
    switch (claims.get(claimId)) {
      case (null) { Runtime.trap("Claim not found") };
      case (?claim) {
        switch (items.get(claim.itemId)) {
          case (null) { Runtime.trap("Associated item not found") };
          case (?item) {
            if (item.postedBy != caller and not Author.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only item owner or admin can update claim status");
            };
            claims.add(claimId, { claim with status });
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllClaimsAdmin() : async [Claim] {
    if (not (Author.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    claims.values().toArray();
  };

  // Stats Function
  public query ({ caller }) func getStats() : async Stats {
    let allItems = items.values().toArray();
    let allClaims = claims.values().toArray();

    {
      totalLost = allItems.filter(func(item) { item.itemType == #lost }).size();
      totalFound = allItems.filter(func(item) { item.itemType == #found }).size();
      totalResolved = allItems.filter(func(item) { item.status == #resolved }).size();
      totalClaims = allClaims.size();
    };
  };
};

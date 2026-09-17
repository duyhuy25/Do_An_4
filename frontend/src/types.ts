export interface User {
  UserID: number;
  RoleID: number;
  FullName: string;
  Email: string;
  RoleName: string;
  Phone?: string;
  StudentCode?: string | null;
  ClassName?: string;
}

export interface Category {
  CategoryID: number;
  CategoryName: string;
  Description?: string;
}

export interface Location {
  LocationID: number;
  LocationName: string;
  Building?: string;
  Floor?: string;
}

export interface StorageLocation {
  StorageLocationID: number;
  StorageName: string;
  LocationDescription?: string;
  Capacity?: number;
  CurrentQuantity: number;
  ResponsibleUserID?: number;
}

export interface LostReport {
  LostReportID: number;
  UserID: number;
  UserName: string;
  UserPhone?: string;
  CategoryID: number;
  CategoryName: string;
  LocationID?: number;
  LocationName?: string;
  Title: string;
  Description?: string;
  LostDate: string;
  DistinguishingFeatures?: string;
  RewardAmount?: number;
  Status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FOUND' | 'CLOSED';
  ApprovedBy?: number;
  ApprovedAt?: string;
  ImageURL?: string;
  CreatedAt: string;
}

export interface Item {
  ItemID: number;
  CategoryID: number;
  CategoryName: string;
  LocationID?: number;
  LocationName?: string;
  ItemName: string;
  Description?: string;
  IdentifyingFeatures?: string;
  FoundDate: string;
  Status: 'FOUND' | 'RECEIVED' | 'STORED' | 'VERIFYING' | 'CLAIMED' | 'RETURNED' | 'EXPIRED' | 'DISPOSED';
  StorageLocationID?: number;
  StorageName?: string;
  TrackingCode: string;
  ReceivedAt?: string;
  ReceivedBy?: number;
  ReturnedAt?: string;
  ImageURL?: string;
  CreatedAt: string;
}

export interface Claim {
  ClaimID: number;
  ItemID: number;
  ItemName: string;
  UserID: number;
  UserName: string;
  UserEmail: string;
  UserPhone?: string;
  ClaimReason?: string;
  OwnershipEvidence?: string;
  Status: 'PENDING' | 'VERIFYING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  SubmittedAt: string;
  ReviewedBy?: number;
  ReviewedAt?: string;
  RejectionReason?: string;
}

export interface MatchSuggestion {
  MatchID: number;
  LostReportID: number;
  LostTitle: string;
  ItemID: number;
  ItemName: string;
  MatchScore: number;
  Reason: string;
  Status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  CreatedAt: string;
}

export interface AdminStats {
  totalLost: number;
  pendingLost: number;
  totalItems: number;
  storedItems: number;
  returnedItems: number;
  pendingClaims: number;
  totalUsers: number;
}

export interface AuditLog {
  LogID: number;
  Action: string;
  EntityName: string;
  EntityID: number;
  UserID: number;
  Details: string;
  CreatedAt: string;
}

export interface UserReport {
  ReportID: number;
  ReportedByUserID: number;
  ReportedByName: string;
  TargetTitle: string;
  Reason: string;
  Status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  CreatedAt: string;
}

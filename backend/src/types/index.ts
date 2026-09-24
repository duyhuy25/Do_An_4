export interface Role {
  RoleID: number;
  RoleName: string;
  Description?: string;
}

export interface User {
  UserID: number;
  RoleID: number;
  FullName: string;
  Email: string;
  Password?: string;
  Phone?: string;
  StudentCode?: string | null;
  RoleName: string;
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
  LocationID?: number | null;
  LocationName?: string;
  Title: string;
  Description?: string;
  LostDate: string;
  DistinguishingFeatures?: string;
  RewardAmount?: number;
  Status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FOUND' | 'CLOSED';
  ApprovedBy?: number | null;
  ApprovedAt?: string | null;
  ImageURL?: string;
  CreatedAt: string;
}

export interface Item {
  ItemID: number;
  CategoryID: number;
  CategoryName: string;
  LocationID?: number | null;
  LocationName?: string;
  ItemName: string;
  Description?: string;
  IdentifyingFeatures?: string;
  FoundDate: string;
  Status: 'FOUND' | 'RECEIVED' | 'STORED' | 'VERIFYING' | 'CLAIMED' | 'RETURNED' | 'EXPIRED' | 'DISPOSED';
  StorageLocationID?: number;
  StorageName?: string;
  TrackingCode: string;
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
  ReviewedBy?: number | null;
  ReviewedAt?: string | null;
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

export interface UserReport {
  ReportID: number;
  ReportedByUserID: number;
  ReportedByName: string;
  TargetTitle: string;
  Reason: string;
  Status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  CreatedAt: string;
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

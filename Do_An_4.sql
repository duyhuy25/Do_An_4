CREATE DATABASE Do_An_4;
GO

USE Do_An_4;
GO

----create bảng vai trò----
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
INSERT INTO Roles (RoleName, Description)
VALUES
(N'Student', N'Sinh viên'),
(N'Staff', N'Nhân viên tiếp nhận đồ thất lạc'),
(N'Admin', N'Quản trị viên hệ thống');
GO
---người dùng---
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    RoleID INT NOT NULL,
    StudentCode VARCHAR(20) NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    AvatarURL VARCHAR(500) NULL,
    Department NVARCHAR(100) NULL,
    ClassName NVARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Users_Roles
        FOREIGN KEY (RoleID)
        REFERENCES Roles(RoleID)
);
GO
--- danh mục ----
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,

    CategoryName NVARCHAR(100) NOT NULL UNIQUE,

    Description NVARCHAR(255) NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
INSERT INTO Categories (CategoryName)
VALUES
(N'Điện thoại'),
(N'Laptop'),
(N'Máy tính bảng'),
(N'Tai nghe'),
(N'Ví'),
(N'Chìa khóa'),
(N'Giấy tờ'),
(N'Sách'),
(N'Ba lô'),
(N'Quần áo'),
(N'Đồng hồ'),
(N'Phụ kiện'),
(N'Khác');
GO
---địa điểm trong trường---
CREATE TABLE Locations (
    LocationID INT IDENTITY(1,1) PRIMARY KEY,
    LocationName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    Building NVARCHAR(100) NULL,
    Floor NVARCHAR(50) NULL,
    Latitude DECIMAL(10,7) NULL,
    Longitude DECIMAL(10,7) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO
INSERT INTO Locations
(LocationName, Building, Floor)
VALUES
(N'Thư viện', N'Tòa A', N'Tầng 1'),
(N'Căng tin', N'Tòa B', N'Tầng 1'),
(N'Sân bóng', NULL, NULL),
(N'Sân trường', NULL, NULL),
(N'Ký túc xá', N'Tòa C', N'Tầng 1'),
(N'Bãi gửi xe', NULL, NULL),
(N'Tòa A', N'Tòa A', NULL),
(N'Tòa B', N'Tòa B', NULL),
(N'Tòa C', N'Tòa C', NULL);
GO
--- đồ mất ---
CREATE TABLE LostReports (
    LostReportID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    CategoryID INT NOT NULL,
    LocationID INT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    LostDate DATETIME2 NOT NULL,
    DistinguishingFeatures NVARCHAR(MAX) NULL,
    RewardAmount DECIMAL(12,2) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    ApprovedBy INT NULL,
    ApprovedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_LostReports_User
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_LostReports_Category
        FOREIGN KEY (CategoryID)
        REFERENCES Categories(CategoryID),

    CONSTRAINT FK_LostReports_Location
        FOREIGN KEY (LocationID)
        REFERENCES Locations(LocationID),

    CONSTRAINT FK_LostReports_ApprovedBy
        FOREIGN KEY (ApprovedBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_LostReports_Status
        CHECK (Status IN (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'FOUND',
            'CLOSED'
        ))
);
GO
--- đồ vật ---
CREATE TABLE Items (
    ItemID INT IDENTITY(1,1) PRIMARY KEY,

    CategoryID INT NOT NULL,

    LocationID INT NULL,

    ItemName NVARCHAR(200) NOT NULL,

    Description NVARCHAR(MAX) NULL,

    IdentifyingFeatures NVARCHAR(MAX) NULL,

    FoundDate DATETIME2 NOT NULL,

    Status VARCHAR(30) NOT NULL DEFAULT 'FOUND',

    StorageLocationID INT NULL,

    TrackingCode VARCHAR(50) NOT NULL UNIQUE,

    ReceivedAt DATETIME2 NULL,

    ReceivedBy INT NULL,

    ReturnedAt DATETIME2 NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Items_Category
        FOREIGN KEY (CategoryID)
        REFERENCES Categories(CategoryID),

    CONSTRAINT FK_Items_Location
        FOREIGN KEY (LocationID)
        REFERENCES Locations(LocationID),

    CONSTRAINT FK_Items_ReceivedBy
        FOREIGN KEY (ReceivedBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Items_Status
        CHECK (Status IN (
            'FOUND',
            'RECEIVED',
            'STORED',
            'VERIFYING',
            'CLAIMED',
            'RETURNED',
            'EXPIRED',
            'DISPOSED'
        ))
);
GO
--- đồ vật tìm được ---
CREATE TABLE FoundReports (
    FoundReportID INT IDENTITY(1,1) PRIMARY KEY,

    ItemID INT NOT NULL,

    FoundByUserID INT NOT NULL,

    ReportDescription NVARCHAR(MAX) NULL,

    ReportedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    ApprovedBy INT NULL,

    ApprovedAt DATETIME2 NULL,

    CONSTRAINT FK_FoundReports_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT FK_FoundReports_FoundBy
        FOREIGN KEY (FoundByUserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_FoundReports_ApprovedBy
        FOREIGN KEY (ApprovedBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_FoundReports_Status
        CHECK (Status IN (
            'PENDING',
            'APPROVED',
            'REJECTED',
            'RECEIVED',
            'CLOSED'
        ))
);
GO
---nhiều ảnh---
CREATE TABLE ItemImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,

    ItemID INT NULL,

    LostReportID INT NULL,

    ImageURL VARCHAR(500) NOT NULL,

    IsPrimary BIT NOT NULL DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_ItemImages_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT FK_ItemImages_LostReport
        FOREIGN KEY (LostReportID)
        REFERENCES LostReports(LostReportID),

    CONSTRAINT CK_ItemImages_Reference
        CHECK (
            ItemID IS NOT NULL
            OR LostReportID IS NOT NULL
        )
);
GO
---kho đồ---
CREATE TABLE StorageLocations (
    StorageLocationID INT IDENTITY(1,1) PRIMARY KEY,

    StorageName NVARCHAR(100) NOT NULL,

    LocationDescription NVARCHAR(255) NULL,

    Capacity INT NULL,

    CurrentQuantity INT NOT NULL DEFAULT 0,

    ResponsibleUserID INT NULL,

    IsActive BIT NOT NULL DEFAULT 1,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Storage_Responsible
        FOREIGN KEY (ResponsibleUserID)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Storage_Capacity
        CHECK (
            Capacity IS NULL OR Capacity >= 0
        ),

    CONSTRAINT CK_Storage_CurrentQuantity
        CHECK (
            CurrentQuantity >= 0
        )
);
GO
---yc nhận lại đồ---
CREATE TABLE Claims (
    ClaimID INT IDENTITY(1,1) PRIMARY KEY,

    ItemID INT NOT NULL,

    UserID INT NOT NULL,

    ClaimReason NVARCHAR(MAX) NULL,

    OwnershipEvidence NVARCHAR(MAX) NULL,

    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    ReviewedBy INT NULL,

    ReviewedAt DATETIME2 NULL,

    RejectionReason NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Claims_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT FK_Claims_User
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_Claims_ReviewedBy
        FOREIGN KEY (ReviewedBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Claims_Status
        CHECK (
            Status IN (
                'PENDING',
                'VERIFYING',
                'APPROVED',
                'REJECTED',
                'CANCELLED'
            )
        )
);
GO
---xác minh chủ món đồ ---
CREATE TABLE ClaimVerifications (
    VerificationID INT IDENTITY(1,1) PRIMARY KEY,

    ClaimID INT NOT NULL,

    VerifiedBy INT NOT NULL,

    VerificationMethod NVARCHAR(100) NULL,

    VerificationNotes NVARCHAR(MAX) NULL,

    Result VARCHAR(30) NOT NULL,

    VerifiedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Verification_Claim
        FOREIGN KEY (ClaimID)
        REFERENCES Claims(ClaimID),

    CONSTRAINT FK_Verification_User
        FOREIGN KEY (VerifiedBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Verification_Result
        CHECK (
            Result IN (
                'MATCHED',
                'NOT_MATCHED',
                'NEED_MORE_INFO'
            )
        )
);
GO
--- save lịch sử trao trả---
CREATE TABLE Returns (
    ReturnID INT IDENTITY(1,1) PRIMARY KEY,

    ItemID INT NOT NULL,

    ClaimID INT NOT NULL,

    ReturnedToUserID INT NOT NULL,

    HandledByUserID INT NOT NULL,

    ReturnDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    ReturnMethod NVARCHAR(100) NULL,

    ReceiverSignatureURL VARCHAR(500) NULL,

    Notes NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Returns_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT FK_Returns_Claim
        FOREIGN KEY (ClaimID)
        REFERENCES Claims(ClaimID),

    CONSTRAINT FK_Returns_Receiver
        FOREIGN KEY (ReturnedToUserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_Returns_Handler
        FOREIGN KEY (HandledByUserID)
        REFERENCES Users(UserID)
);
GO
--- có thể là món b cần tìm ---
CREATE TABLE MatchSuggestions (
    MatchID INT IDENTITY(1,1) PRIMARY KEY,

    LostReportID INT NOT NULL,

    ItemID INT NOT NULL,

    MatchScore DECIMAL(5,2) NULL,

    Reason NVARCHAR(MAX) NULL,

    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Match_LostReport
        FOREIGN KEY (LostReportID)
        REFERENCES LostReports(LostReportID),

    CONSTRAINT FK_Match_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT CK_Match_Score
        CHECK (
            MatchScore >= 0
            AND MatchScore <= 100
        ),

    CONSTRAINT CK_Match_Status
        CHECK (
            Status IN (
                'PENDING',
                'CONFIRMED',
                'REJECTED'
            )
        )
);
GO
---bài đăng dc duyệt---
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,

    Title NVARCHAR(200) NOT NULL,

    Message NVARCHAR(MAX) NOT NULL,

    NotificationType VARCHAR(50) NULL,

    RelatedID INT NULL,

    IsRead BIT NOT NULL DEFAULT 0,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Notifications_User
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
);
GO
---cảnh báo bài đang vi phạm---
CREATE TABLE Reports (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,

    ReportedByUserID INT NOT NULL,

    TargetUserID INT NULL,

    ItemID INT NULL,

    LostReportID INT NULL,

    FoundReportID INT NULL,

    Reason NVARCHAR(MAX) NOT NULL,

    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    HandledBy INT NULL,

    HandledAt DATETIME2 NULL,

    Resolution NVARCHAR(MAX) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_Reports_ReportedBy
        FOREIGN KEY (ReportedByUserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_Reports_TargetUser
        FOREIGN KEY (TargetUserID)
        REFERENCES Users(UserID),

    CONSTRAINT FK_Reports_Item
        FOREIGN KEY (ItemID)
        REFERENCES Items(ItemID),

    CONSTRAINT FK_Reports_LostReport
        FOREIGN KEY (LostReportID)
        REFERENCES LostReports(LostReportID),

    CONSTRAINT FK_Reports_FoundReport
        FOREIGN KEY (FoundReportID)
        REFERENCES FoundReports(FoundReportID),

    CONSTRAINT FK_Reports_HandledBy
        FOREIGN KEY (HandledBy)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Reports_Status
        CHECK (
            Status IN (
                'PENDING',
                'PROCESSING',
                'RESOLVED',
                'REJECTED'
            )
        )
);
GO
--- lưu ls thao tác qtr ---
CREATE TABLE AuditLogs (
    LogID BIGINT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NULL,

    Action VARCHAR(100) NOT NULL,

    EntityName VARCHAR(100) NULL,

    EntityID INT NULL,

    OldValue NVARCHAR(MAX) NULL,

    NewValue NVARCHAR(MAX) NULL,

    IPAddress VARCHAR(45) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT FK_AuditLogs_User
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID)
);
GO
USE master;
GO

-- Xóa database cũ nếu đang bị lỗi dở dang
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'Do_An_4')
BEGIN
    ALTER DATABASE Do_An_4 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE Do_An_4;
END
GO

CREATE DATABASE Do_An_4;
GO

USE Do_An_4;
GO

-- =============================================
-- 1. TẠO CÁC BẢNG DANH MỤC (CƠ BẢN)
-- =============================================

CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

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

-- =============================================
-- 2. TẠO BẢNG NGƯỜI DÙNG & KHO LƯU TRỮ
-- =============================================

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    RoleID INT NOT NULL,
    StudentCode VARCHAR(20) NULL, -- Đã bỏ UNIQUE ở đây để tránh lỗi NULL duplicate
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
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);
GO

-- Tạo UNIQUE Index cho StudentCode nhưng BỎ QUA các giá trị NULL
CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_StudentCode 
ON Users(StudentCode) 
WHERE StudentCode IS NOT NULL;
GO

CREATE TABLE StorageLocations (
    StorageLocationID INT IDENTITY(1,1) PRIMARY KEY,
    StorageName NVARCHAR(100) NOT NULL,
    LocationDescription NVARCHAR(255) NULL,
    Capacity INT NULL,
    CurrentQuantity INT NOT NULL DEFAULT 0,
    ResponsibleUserID INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Storage_Responsible FOREIGN KEY (ResponsibleUserID) REFERENCES Users(UserID),
    CONSTRAINT CK_Storage_Capacity CHECK (Capacity IS NULL OR Capacity >= 0),
    CONSTRAINT CK_Storage_CurrentQuantity CHECK (CurrentQuantity >= 0)
);
GO

-- =============================================
-- 3. CÁC BẢNG QUẢN LÝ BÁO CÁO & VẬT PHẨM
-- =============================================

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
    CONSTRAINT FK_LostReports_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_LostReports_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    CONSTRAINT FK_LostReports_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    CONSTRAINT FK_LostReports_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(UserID),
    CONSTRAINT CK_LostReports_Status CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'FOUND', 'CLOSED'))
);
GO

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
    CONSTRAINT FK_Items_Category FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    CONSTRAINT FK_Items_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    CONSTRAINT FK_Items_StorageLocation FOREIGN KEY (StorageLocationID) REFERENCES StorageLocations(StorageLocationID),
    CONSTRAINT FK_Items_ReceivedBy FOREIGN KEY (ReceivedBy) REFERENCES Users(UserID),
    CONSTRAINT CK_Items_Status CHECK (Status IN ('FOUND', 'RECEIVED', 'STORED', 'VERIFYING', 'CLAIMED', 'RETURNED', 'EXPIRED', 'DISPOSED'))
);
GO

CREATE TABLE FoundReports (
    FoundReportID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    FoundByUserID INT NOT NULL,
    ReportDescription NVARCHAR(MAX) NULL,
    ReportedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    ApprovedBy INT NULL,
    ApprovedAt DATETIME2 NULL,
    CONSTRAINT FK_FoundReports_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT FK_FoundReports_FoundBy FOREIGN KEY (FoundByUserID) REFERENCES Users(UserID),
    CONSTRAINT FK_FoundReports_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(UserID),
    CONSTRAINT CK_FoundReports_Status CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'CLOSED'))
);
GO

CREATE TABLE ItemImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NULL,
    LostReportID INT NULL,
    ImageURL VARCHAR(500) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ItemImages_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT FK_ItemImages_LostReport FOREIGN KEY (LostReportID) REFERENCES LostReports(LostReportID),
    CONSTRAINT CK_ItemImages_Reference CHECK (ItemID IS NOT NULL OR LostReportID IS NOT NULL)
);
GO

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
    CONSTRAINT FK_Claims_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT FK_Claims_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Claims_ReviewedBy FOREIGN KEY (ReviewedBy) REFERENCES Users(UserID),
    CONSTRAINT CK_Claims_Status CHECK (Status IN ('PENDING', 'VERIFYING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);
GO

CREATE TABLE ClaimVerifications (
    VerificationID INT IDENTITY(1,1) PRIMARY KEY,
    ClaimID INT NOT NULL,
    VerifiedBy INT NOT NULL,
    VerificationMethod NVARCHAR(100) NULL,
    VerificationNotes NVARCHAR(MAX) NULL,
    Result VARCHAR(30) NOT NULL,
    VerifiedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Verification_Claim FOREIGN KEY (ClaimID) REFERENCES Claims(ClaimID),
    CONSTRAINT FK_Verification_User FOREIGN KEY (VerifiedBy) REFERENCES Users(UserID),
    CONSTRAINT CK_Verification_Result CHECK (Result IN ('MATCHED', 'NOT_MATCHED', 'NEED_MORE_INFO'))
);
GO

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
    CONSTRAINT FK_Returns_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT FK_Returns_Claim FOREIGN KEY (ClaimID) REFERENCES Claims(ClaimID),
    CONSTRAINT FK_Returns_Receiver FOREIGN KEY (ReturnedToUserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Returns_Handler FOREIGN KEY (HandledByUserID) REFERENCES Users(UserID)
);
GO

CREATE TABLE MatchSuggestions (
    MatchID INT IDENTITY(1,1) PRIMARY KEY,
    LostReportID INT NOT NULL,
    ItemID INT NOT NULL,
    MatchScore DECIMAL(5,2) NULL,
    Reason NVARCHAR(MAX) NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Match_LostReport FOREIGN KEY (LostReportID) REFERENCES LostReports(LostReportID),
    CONSTRAINT FK_Match_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT CK_Match_Score CHECK (MatchScore >= 0 AND MatchScore <= 100),
    CONSTRAINT CK_Match_Status CHECK (Status IN ('PENDING', 'CONFIRMED', 'REJECTED'))
);
GO
select * from MatchSuggestions

CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType VARCHAR(50) NULL,
    RelatedID INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO

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
    CONSTRAINT FK_Reports_ReportedBy FOREIGN KEY (ReportedByUserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Reports_TargetUser FOREIGN KEY (TargetUserID) REFERENCES Users(UserID),
    CONSTRAINT FK_Reports_Item FOREIGN KEY (ItemID) REFERENCES Items(ItemID),
    CONSTRAINT FK_Reports_LostReport FOREIGN KEY (LostReportID) REFERENCES LostReports(LostReportID),
    CONSTRAINT FK_Reports_FoundReport FOREIGN KEY (FoundReportID) REFERENCES FoundReports(FoundReportID),
    CONSTRAINT FK_Reports_HandledBy FOREIGN KEY (HandledBy) REFERENCES Users(UserID),
    CONSTRAINT CK_Reports_Status CHECK (Status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED'))
);
GO

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
    CONSTRAINT FK_AuditLogs_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO

-- =============================================
-- 4. CHÈN DỮ LIỆU MẪU
-- =============================================

INSERT INTO Roles (RoleName, Description) VALUES
(N'Student', N'Sinh viên'),
(N'Staff', N'Nhân viên tiếp nhận đồ thất lạc'),
(N'Admin', N'Quản trị viên hệ thống');
GO

INSERT INTO Categories (CategoryName) VALUES
(N'Điện thoại'), (N'Laptop'), (N'Máy tính bảng'), (N'Tai nghe'), (N'Ví'),
(N'Chìa khóa'), (N'Giấy tờ'), (N'Sách'), (N'Ba lô'), (N'Quần áo'),
(N'Đồng hồ'), (N'Phụ kiện'), (N'Khác');
GO

INSERT INTO Locations (LocationName, Building, Floor) VALUES
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

INSERT INTO Users (RoleID, StudentCode, FullName, Email, Phone, PasswordHash, Department, ClassName) VALUES 
(1, 'SV001', N'Nguyễn Văn An', 'an.nv@student.edu.vn', '0912345678', '$2a$12$e8Zb1...', N'Công nghệ thông tin', N'CNTT1-K62'),
(1, 'SV002', N'Trần Thị Bích', 'bich.tt@student.edu.vn', '0923456789', '$2a$12$e8Zb1...', N'Kinh tế', N'KT2-K63'),
(1, 'SV003', N'Lê Hoàng Cường', 'cuong.lh@student.edu.vn', '0934567890', '$2a$12$e8Zb1...', N'Ngoại ngữ', N'NNA1-K61'),
(2, NULL, N'Phạm Văn Dũng', 'dung.pv@staff.edu.vn', '0945678901', '$2a$12$e8Zb1...', N'Phòng Quản lý KTX', NULL),
(3, NULL, N'Vũ Thị Quản Trị', 'admin@edu.vn', '0956789012', '$2a$12$e8Zb1...', N'Phòng CNTT', NULL);
GO

INSERT INTO StorageLocations (StorageName, LocationDescription, Capacity, CurrentQuantity, ResponsibleUserID) VALUES 
(N'Kho Phòng Bảo vệ Tòa A', N'Tầng 1 Tòa A, cạnh cổng chính', 50, 2, 4),
(N'Kho Văn phòng KTX', N'Phòng 101 Tòa C', 30, 1, 4);
GO

INSERT INTO LostReports (UserID, CategoryID, LocationID, Title, Description, LostDate, DistinguishingFeatures, RewardAmount, Status, ApprovedBy, ApprovedAt) VALUES 
(1, 1, 1, N'Mất điện thoại iPhone 13 Pro', N'Quên trên bàn học khu tự học tầng 1', '2026-03-01 10:30:00', N'Ốp lưng màu xanh lá, màn hình nứt nhẹ góc dưới', 500000.00, 'APPROVED', 4, '2026-03-01 11:00:00'),
(2, 5, 2, N'Rơi ví tiền màu nâu', N'Rơi lúc ăn trưa tại căng tin', '2026-03-02 12:15:00', N'Ví da nam, bên trong có CCCD tên Trần Thị Bích và 200k', 0.00, 'APPROVED', 4, '2026-03-02 13:00:00'),
(3, 6, 6, N'Mất chùm chìa khóa xe máy', N'Đánh rơi ở bãi xe sinh viên', '2026-03-03 08:00:00', N'Chùm 3 chìa có móc khóa hình Doraemon', 0.00, 'PENDING', NULL, NULL);
GO

INSERT INTO Items (CategoryID, LocationID, ItemName, Description, IdentifyingFeatures, FoundDate, Status, StorageLocationID, TrackingCode, ReceivedAt, ReceivedBy) VALUES 
(1, 1, N'Điện thoại iPhone màu xanh', N'Nhặt được trên bàn thư viện', N'Màn hình có vỡ góc, ốp xanh', '2026-03-01 10:45:00', 'STORED', 1, 'TRK-20260301-01', '2026-03-01 11:30:00', 4),
(5, 2, N'Ví da màu nâu', N'Quên trên bàn ăn căng tin', N'Có giấy tờ tùy thân', '2026-03-02 12:30:00', 'RECEIVED', 1, 'TRK-20260302-02', '2026-03-02 14:00:00', 4);
GO

INSERT INTO FoundReports (ItemID, FoundByUserID, ReportDescription, ReportedAt, Status, ApprovedBy, ApprovedAt) VALUES 
(1, 3, N'Tôi nhặt được máy ở khu tự học thư viện và đã giao cho bảo vệ', '2026-03-01 10:50:00', 'APPROVED', 4, '2026-03-01 11:30:00'),
(2, 1, N'Nhặt được ví ở căng tin tòa B', '2026-03-02 12:40:00', 'APPROVED', 4, '2026-03-02 14:00:00');
GO

INSERT INTO ItemImages (ItemID, LostReportID, ImageURL, IsPrimary) VALUES 
(1, NULL, '/uploads/items/iphone13_front.jpg', 1),
(NULL, 1, '/uploads/lost/iphone13_back.jpg', 1),
(2, NULL, '/uploads/items/wallet_brown.jpg', 1);
GO

INSERT INTO MatchSuggestions (LostReportID, ItemID, MatchScore, Reason, Status) VALUES 
(1, 1, 92.50, N'Trùng khớp Danh mục (Điện thoại), Địa điểm (Thư viện) và đặc điểm ốp lưng màu xanh', 'CONFIRMED'),
(2, 2, 85.00, N'Trùng khớp Danh mục (Ví) và Địa điểm (Căng tin)', 'PENDING');
GO

INSERT INTO Claims (ItemID, UserID, ClaimReason, OwnershipEvidence, Status, SubmittedAt, ReviewedBy, ReviewedAt) VALUES 
(1, 1, N'Đây là điện thoại tôi làm rơi sáng nay', N'Cung cấp mật khẩu mở khóa màn hình là 123456 và số IMEI', 'APPROVED', '2026-03-01 14:00:00', 4, '2026-03-01 15:00:00');
GO

INSERT INTO ClaimVerifications (ClaimID, VerifiedBy, VerificationMethod, VerificationNotes, Result) VALUES 
(1, 4, N'Mở khóa trực tiếp', N'Sinh viên nhập đúng mật khẩu màn hình trước mặt cán bộ', 'MATCHED');
GO

INSERT INTO Returns (ItemID, ClaimID, ReturnedToUserID, HandledByUserID, ReturnDate, ReturnMethod, Notes) VALUES 
(1, 1, 1, 4, '2026-03-01 15:30:00', N'Nhận trực tiếp tại văn phòng', N'Sinh viên đã kiểm tra lại máy và ký xác nhận');
GO

-- Chạy riêng đoạn lệnh chèn Notifications này
INSERT INTO Notifications (UserID, Title, Message, NotificationType, RelatedID, IsRead) 
VALUES 
(1, N'Bài đăng đã được duyệt', N'Bài đăng báo mất Điện thoại của bạn đã được quản trị viên phê duyệt.', 'LOST_REPORT_APPROVED', 1, 1),
(1, N'Tìm thấy món đồ phù hợp', N'Hệ thống phát hiện một vật phẩm có khả năng là của bạn. Vui lòng kiểm tra!', 'MATCH_FOUND', 1, 0),
(2, N'Bài đăng đã được duyệt', N'Bài đăng báo mất Ví tiền của bạn đã được phê duyệt.', 'LOST_REPORT_APPROVED', 2, 0);
GO

INSERT INTO Reports (ReportedByUserID, TargetUserID, LostReportID, Reason, Status) VALUES 
(2, 3, 3, N'Bài đăng chứa thông tin không chính xác hoặc cố tình spam', 'PENDING');
GO

INSERT INTO AuditLogs (UserID, Action, EntityName, EntityID, OldValue, NewValue, IPAddress) VALUES 
(4, 'APPROVE_LOST_REPORT', 'LostReports', 1, 'Status: PENDING', 'Status: APPROVED', '192.168.1.15'),
(4, 'CREATE_RETURN', 'Returns', 1, NULL, 'ReturnID: 1', '192.168.1.15');
GO

-- 1. Bảng danh mục riêng cho rao vặt (Ví dụ: Đồ dùng học tập, Sách cũ, Đồ điện tử, Nội thất KTX, Pass phòng/Ở ghép)
CREATE TABLE ClassifiedCategories (
    ClassifiedCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 2. Bảng tin rao vặt chính (Có tích hợp quản lý thời gian và hạn định)
CREATE TABLE ClassifiedPosts (
    PostID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,                          -- Người đăng tin (Sinh viên)
    ClassifiedCategoryID INT NOT NULL,
    LocationID INT NULL,                          -- Địa điểm/Khu vực KTX liên quan (liên kết bảng Locations sẵn có)
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Price DECIMAL(12,2) NULL,                     -- Giá tiền (nếu bán hoặc cho thuê phòng, NULL nếu cho tặng/thỏa thuận)
    PostType VARCHAR(30) NOT NULL DEFAULT 'SELL', -- 'SELL' (Bán/Thanh lý), 'BUY' (Cần mua), 'RENT' (Cho thuê/Pass phòng), 'ROOMMATE' (Tìm ở ghép)
    ContactPhone VARCHAR(15) NULL,
    ContactZalo VARCHAR(50) NULL,
    
    -- Quản lý mốc thời gian & Hạn định
    PostExpiryDate DATETIME2 NULL,                -- Hạn đăng tải / Hạn hiển thị bài viết trên hệ thống
    DeliveryDeadline DATETIME2 NULL,              -- Hạn giao việc / Hạn hoàn thành giao dịch (nếu có nhận việc)
    AssignedToUserID INT NULL,                    -- Sinh viên nhận thực hiện giao dịch / nhận việc hộ (nếu có)
    AcceptedAt DATETIME2 NULL,                    -- Thời điểm có người nhận việc
    
    Status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'SOLD', 'EXPIRED', 'CLOSED'
    ApprovedBy INT NULL,                          -- Nhân viên/Admin duyệt bài
    ApprovedAt DATETIME2 NULL,
    ViewCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    
    CONSTRAINT FK_ClassifiedPosts_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_ClassifiedPosts_Category FOREIGN KEY (ClassifiedCategoryID) REFERENCES ClassifiedCategories(ClassifiedCategoryID),
    CONSTRAINT FK_ClassifiedPosts_Location FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    CONSTRAINT FK_ClassifiedPosts_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES Users(UserID),
    CONSTRAINT FK_ClassifiedPosts_AssignedUser FOREIGN KEY (AssignedToUserID) REFERENCES Users(UserID),
    CONSTRAINT CK_ClassifiedPosts_Type CHECK (PostType IN ('SELL', 'BUY', 'RENT', 'ROOMMATE')),
    CONSTRAINT CK_ClassifiedPosts_Status CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'SOLD', 'EXPIRED', 'CLOSED'))
);
GO

-- 3. Bảng hình ảnh cho tin rao vặt
CREATE TABLE ClassifiedImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    PostID INT NOT NULL,
    ImageURL VARCHAR(500) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ClassifiedImages_Post FOREIGN KEY (PostID) REFERENCES ClassifiedPosts(PostID) ON DELETE CASCADE
);
GO

-- 4. Bảng bình luận / hỏi đáp trong bài rao vặt
CREATE TABLE ClassifiedComments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY,
    PostID INT NOT NULL,
    UserID INT NOT NULL,
    CommentText NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ClassifiedComments_Post FOREIGN KEY (PostID) REFERENCES ClassifiedPosts(PostID) ON DELETE CASCADE,
    CONSTRAINT FK_ClassifiedComments_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
GO

-- 5. Cập nhật liên kết bảng Reports sẵn có để hỗ trợ báo cáo vi phạm bài rao vặt
ALTER TABLE Reports ADD PostID INT NULL;
GO
ALTER TABLE Reports ADD CONSTRAINT FK_Reports_ClassifiedPost FOREIGN KEY (PostID) REFERENCES ClassifiedPosts(PostID);
GO


-- =============================================
-- DỮ LIỆU MẪU (SEED DATA) CHO MODULE RAO VẶT
-- =============================================

-- Danh mục rao vặt
INSERT INTO ClassifiedCategories (CategoryName, Description) VALUES
(N'Đồ dùng học tập & Sách', N'Giáo trình cũ, tài liệu, bút thước, máy tính bỏ túi'),
(N'Đồ điện tử & Phụ kiện', N'Laptop cũ, tai nghe, sạc dự phòng, chuột, bàn phím'),
(N'Nội thất & Đồ dùng KTX', N'Quạt điện, đèn bàn, kệ sách mini, chiếu, chăn gối'),
(N'Pass phòng & Tìm người ở ghép KTX', N'Tìm sinh viên ở ghép phòng KTX, chuyển nhượng hợp đồng phòng'),
(N'Khác', N'Các vật dụng linh tinh khác trong trường');
GO

-- Bài đăng rao vặt mẫu (Có test trường hợp bài đang chạy và bài đã tự động EXPIRED do quá hạn đăng tải)
INSERT INTO ClassifiedPosts (UserID, ClassifiedCategoryID, LocationID, Title, Description, Price, PostType, PostExpiryDate, DeliveryDeadline, Status, ApprovedBy, ApprovedAt) VALUES 
(1, 4, 5, N'Pass giường tầng KTX tòa C phòng 402', N'Do chuyển trọ ngoài nên mình cần pass lại suất giường tầng ở KTX tòa C, phòng thoáng mát.', 350000.00, 'RENT', '2026-04-30 23:59:59', '2026-04-10 18:00:00', 'APPROVED', 5, SYSDATETIME()),
(2, 2, 7, N'Thanh lý tai nghe Bluetooth Sony cũ', N'Ít dùng nên bán lại cho bạn nào cần, âm thanh vẫn rất tốt, kèm cáp sạc.', 250000.00, 'SELL', '2026-03-25 23:59:59', '2026-03-20 12:00:00', 'APPROVED', 5, SYSDATETIME()),
(3, 3, 5, N'Cần tìm bạn ở ghép KTX Tòa C', N'Phòng trống 1 chỗ, sinh hoạt sạch sẽ, giờ giấc thoải mái.', NULL, 'ROOMMATE', '2026-03-10 23:59:59', '2026-03-08 20:00:00', 'EXPIRED', 5, SYSDATETIME()); -- Bài mẫu đã quá hạn và chuyển trạng thái về EXPIRED (hết nhu cầu)
GO

-- Hình ảnh rao vặt mẫu
INSERT INTO ClassifiedImages (PostID, ImageURL, IsPrimary) VALUES 
(1, '/uploads/classified/ktx_room_402.jpg', 1),
(2, '/uploads/classified/sony_headphone.jpg', 1);
GO

-- Bình luận mẫu trên bài rao vặt
INSERT INTO ClassifiedComments (PostID, UserID, CommentText) VALUES 
(1, 2, N'Phòng mấy người ở vậy bạn ơi? Điện nước tính theo giá nhà nước hay dịch vụ?');
GO



SELECT name, is_disabled
FROM sys.server_principals
WHERE name = 'sa';

ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = '123', CHECK_POLICY = OFF;
CREATE PROCEDURE dbo.spDoctorsGet
    @DoctorId INT = NULL,
    @UserId INT = NULL,
    @ApprovalStatus NVARCHAR(20) = NULL
AS
BEGIN
    IF @DoctorId IS NOT NULL
        SELECT * FROM dbo.Doctors WHERE DoctorId = @DoctorId;
    ELSE IF @UserId IS NOT NULL
        SELECT * FROM dbo.Doctors WHERE UserId = @UserId;
    ELSE IF @ApprovalStatus IS NOT NULL
        SELECT * FROM dbo.Doctors WHERE ApprovalStatus = @ApprovalStatus;
    ELSE
        SELECT * FROM dbo.Doctors;
END

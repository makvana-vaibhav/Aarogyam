CREATE PROCEDURE dbo.spUsersGet
    @UserId INT = NULL,
    @Email NVARCHAR(100) = NULL
AS
BEGIN
    IF @UserId IS NOT NULL
        SELECT * FROM dbo.Users WHERE UserId = @UserId;
    ELSE IF @Email IS NOT NULL
        SELECT * FROM dbo.Users WHERE Email = @Email;
    ELSE
        SELECT * FROM dbo.Users;
END

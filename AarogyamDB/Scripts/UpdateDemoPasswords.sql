-- Update PasswordHash for all demo users (UserId 2 to 11) to '123456'
-- Exact BCrypt Hash for '123456': $2a$11$IQUTrzofwPgdNPhoK0h4reZ08HVzGDdp/MnFHd5pwO1vimPS3hrSK

UPDATE dbo.Users
SET PasswordHash = '$2a$11$IQUTrzofwPgdNPhoK0h4reZ08HVzGDdp/MnFHd5pwO1vimPS3hrSK'
WHERE UserId BETWEEN 2 AND 11;

SELECT UserId, Email, RoleId, PasswordHash FROM dbo.Users WHERE UserId BETWEEN 2 AND 11;

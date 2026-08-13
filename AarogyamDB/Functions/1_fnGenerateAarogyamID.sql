-- Generates a new Aarogyam ID : ARG-YYYY-000001
CREATE OR ALTER FUNCTION dbo.fnGenerateAarogyamID()
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @Year NVARCHAR(4) = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
    DECLARE @Prefix NVARCHAR(10) = 'ARG-' + @Year + '-';
    DECLARE @MaxNum INT = 0;

    SELECT @MaxNum = ISNULL(MAX(
        TRY_CAST(SUBSTRING(AarogyamId, LEN(@Prefix) + 1, 20) AS INT)
    ), 0)
    FROM dbo.Patients
    WHERE AarogyamId LIKE @Prefix + '%';

    IF @MaxNum = 0
    BEGIN
        SELECT @MaxNum = ISNULL(COUNT(*), 0) FROM dbo.Patients;
    END

    DECLARE @NextNum INT = @MaxNum + 1;
    DECLARE @NewId NVARCHAR(20) = @Prefix + RIGHT('000000' + CAST(@NextNum AS NVARCHAR(10)), 6);

    WHILE EXISTS (SELECT 1 FROM dbo.Patients WHERE AarogyamId = @NewId)
    BEGIN
        SET @NextNum = @NextNum + 1;
        SET @NewId = @Prefix + RIGHT('000000' + CAST(@NextNum AS NVARCHAR(10)), 6);
    END

    RETURN @NewId;
END

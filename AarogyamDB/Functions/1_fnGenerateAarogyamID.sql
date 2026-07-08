-- Generates a new Aarogyam ID : ARG-YYYY-000001
CREATE FUNCTION dbo.fnGenerateAarogyamID()
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @Year NVARCHAR(4) = CAST(YEAR(GETDATE()) AS NVARCHAR(4));
    DECLARE @NextNumber INT;
    DECLARE @NewId NVARCHAR(20);

    SELECT @NextNumber = COUNT(*) + 1 FROM dbo.Patients;

    -- pad the number with zeros so it is always 6 digits, e.g. 000042
    SET @NewId = 'ARG-' + @Year + '-' + RIGHT('000000' + CAST(@NextNumber AS NVARCHAR(6)), 6);

    RETURN @NewId;
END

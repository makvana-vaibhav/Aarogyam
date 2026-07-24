namespace Aarogyam.API.Services;

public interface IQrCodeService
{
    byte[] GenerateQrPng(string content);
}

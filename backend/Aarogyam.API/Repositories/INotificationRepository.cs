namespace Aarogyam.API.Repositories;

public interface INotificationRepository
{
    Task CreateAsync(int userId, string title, string message);
}

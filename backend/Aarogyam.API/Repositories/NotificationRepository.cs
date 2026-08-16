using Aarogyam.API.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AarogyamDbContext _context;

    public NotificationRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(int userId, string title, string message)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "EXEC dbo.spNotificationsManage @Action, @NotificationId, @UserId, @Title, @Message, @IsRead, @EmailSentAt",
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@NotificationId", DBNull.Value),
            new SqlParameter("@UserId", userId),
            new SqlParameter("@Title", title),
            new SqlParameter("@Message", message),
            new SqlParameter("@IsRead", false),
            new SqlParameter("@EmailSentAt", DBNull.Value));
    }
}

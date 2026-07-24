namespace Aarogyam.API.Models.Responses;

public class NotificationRow
{
    public int NotificationId { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime? EmailSentAt { get; set; }

    public DateTime CreatedAt { get; set; }
}

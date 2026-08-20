using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aarogyam.API.Helpers;

/// <summary>
/// All timestamps are stored in the database as UTC (via SYSUTCDATETIME()), but EF/Dapper
/// materialize them as DateTime with Kind=Unspecified. Without this converter,
/// System.Text.Json serializes them with no trailing "Z"/offset (e.g. "2026-08-16T10:30:00"),
/// which the frontend's `new Date(...)` then misinterprets as browser-local time instead of UTC.
/// Marking the Kind as Utc before writing lets the default DateTime formatting append the "Z".
/// </summary>
public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDateTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(DateTime.SpecifyKind(value, DateTimeKind.Utc));
    }
}

/// <summary>
/// Nullable counterpart of <see cref="UtcDateTimeConverter"/>. System.Text.Json does not
/// automatically apply a JsonConverter&lt;DateTime&gt; to DateTime? properties, so this
/// converter must be registered separately to cover nullable timestamp properties.
/// </summary>
public class UtcNullableDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        return reader.GetDateTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(DateTime.SpecifyKind(value.Value, DateTimeKind.Utc));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}

/// <summary>
/// For the handful of DateTime columns that are NOT true UTC instants - namely
/// Visits.VisitDate, which is captured straight from a doctor's local (IST) datetime-local
/// input and persisted as-is with no UTC conversion anywhere in the pipeline. Serializing that
/// value through <see cref="UtcDateTimeConverter"/> would mislabel it "Z" (UTC), causing the
/// frontend's `new Date(...)` to shift it by the viewer's UTC offset on top of an already-local
/// value - e.g. a visit logged at 2:30 PM IST would render as 8:00 PM. Writing it with an
/// explicit "+05:30" offset instead makes the intended IST wall-clock time unambiguous
/// regardless of the viewer's browser timezone.
/// </summary>
public class IstDateTimeConverter : JsonConverter<DateTime>
{
    private static readonly TimeSpan IstOffset = TimeSpan.FromHours(5.5);

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return reader.GetDateTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Unspecified), IstOffset));
    }
}

/// <summary>Nullable counterpart of <see cref="IstDateTimeConverter"/>.</summary>
public class IstNullableDateTimeConverter : JsonConverter<DateTime?>
{
    private static readonly TimeSpan IstOffset = TimeSpan.FromHours(5.5);

    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        return reader.GetDateTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            writer.WriteStringValue(new DateTimeOffset(DateTime.SpecifyKind(value.Value, DateTimeKind.Unspecified), IstOffset));
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}

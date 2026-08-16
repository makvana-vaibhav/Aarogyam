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

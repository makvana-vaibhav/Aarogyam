// Hashes a password with BCrypt.Net-Next — the same library and defaults
// Aarogyam.API uses — so the output can be inserted straight into
// Users.PasswordHash and validated by the API's normal login flow.
//
// Usage: dotnet run -c Release -- "<password>"
// Prints only the hash to stdout (used by create-admin.sh via `tail -1`).

if (args.Length != 1 || string.IsNullOrWhiteSpace(args[0]))
{
    Console.Error.WriteLine("Usage: dotnet run -c Release -- \"<password>\"");
    Environment.Exit(1);
}

Console.WriteLine(BCrypt.Net.BCrypt.HashPassword(args[0]));

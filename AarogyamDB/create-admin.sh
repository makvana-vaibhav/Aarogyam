#!/usr/bin/env bash
# Creates one Admin user directly in the Users table - already email-verified
# and active, so it can log in immediately through the normal /api/auth/login
# endpoint without ever going through the OTP flow (there is no public
# "register as admin" API by design).
#
# Usage:
#   ./create-admin.sh -S <server[,port]> -d <database> -U <user> -P <db-password> \
#                      -e <admin-email> -p <admin-phone> -w <admin-password>
#
# Any flag left out will be prompted for (passwords use hidden input).
# DB connection details can also come from SQLCMD_SERVER / SQLCMD_DATABASE /
# SQLCMD_USER / SQLCMD_PASSWORD environment variables, same as deploy-procedures.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HASH_TOOL_DIR="$SCRIPT_DIR/Tools/HashPassword"

SERVER="${SQLCMD_SERVER:-}"
DATABASE="${SQLCMD_DATABASE:-}"
DB_USER="${SQLCMD_USER:-}"
DB_PASSWORD="${SQLCMD_PASSWORD:-}"
ADMIN_EMAIL=""
ADMIN_PHONE=""
ADMIN_PASSWORD=""

while getopts "S:d:U:P:e:p:w:" opt; do
  case "$opt" in
    S) SERVER="$OPTARG" ;;
    d) DATABASE="$OPTARG" ;;
    U) DB_USER="$OPTARG" ;;
    P) DB_PASSWORD="$OPTARG" ;;
    e) ADMIN_EMAIL="$OPTARG" ;;
    p) ADMIN_PHONE="$OPTARG" ;;
    w) ADMIN_PASSWORD="$OPTARG" ;;
    *)
      echo "Usage: $0 -S <server> -d <database> -U <db-user> -P <db-password> -e <admin-email> -p <admin-phone> -w <admin-password>"
      exit 1
      ;;
  esac
done

if [ -z "$SERVER" ]; then read -rp "Server (e.g. host or host,port): " SERVER; fi
if [ -z "$DATABASE" ]; then read -rp "Database [AarogyamDB]: " DATABASE; DATABASE="${DATABASE:-AarogyamDB}"; fi
if [ -z "$DB_USER" ]; then read -rp "DB username [SA]: " DB_USER; DB_USER="${DB_USER:-SA}"; fi
if [ -z "$DB_PASSWORD" ]; then read -rsp "DB password: " DB_PASSWORD; echo; fi
if [ -z "$ADMIN_EMAIL" ]; then read -rp "Admin email: " ADMIN_EMAIL; fi
if [ -z "$ADMIN_PHONE" ]; then read -rp "Admin phone number: " ADMIN_PHONE; fi
if [ -z "$ADMIN_PASSWORD" ]; then read -rsp "Admin password: " ADMIN_PASSWORD; echo; fi

if ! command -v sqlcmd >/dev/null 2>&1; then
  echo "sqlcmd not found. Install it first (e.g. 'brew install sqlcmd')." >&2
  exit 1
fi

echo "Hashing password (dotnet run, BCrypt.Net-Next - same library the API uses)..."
PASSWORD_HASH="$(cd "$HASH_TOOL_DIR" && dotnet run -c Release -- "$ADMIN_PASSWORD" 2>/tmp/hash_tool_err.log | tail -1)"

if [ -z "$PASSWORD_HASH" ]; then
  echo "Failed to generate a password hash:" >&2
  cat /tmp/hash_tool_err.log >&2
  rm -f /tmp/hash_tool_err.log
  exit 1
fi
rm -f /tmp/hash_tool_err.log

SQL_FILE="$(mktemp /tmp/create_admin_XXXXXX.sql)"
trap 'rm -f "$SQL_FILE"' EXIT

cat > "$SQL_FILE" <<'EOF'
DECLARE @RoleId INT = (SELECT RoleId FROM dbo.RoleMaster WHERE RoleName = 'Admin');

IF @RoleId IS NULL
BEGIN
    PRINT 'No Admin row in RoleMaster - deploy Tables/Procedures first.';
END
ELSE IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = '$(AdminEmail)' OR PhoneNumber = '$(AdminPhone)')
BEGIN
    PRINT 'A user with this email or phone number already exists - nothing created.';
END
ELSE
BEGIN
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (@RoleId, '$(AdminEmail)', '$(AdminPhone)', '$(PasswordHash)', 1, 1);

    PRINT 'Admin user created: UserId ' + CAST(SCOPE_IDENTITY() AS NVARCHAR(20));
END
EOF

sqlcmd -S "$SERVER" -d "$DATABASE" -U "$DB_USER" -P "$DB_PASSWORD" -C -b \
  -v AdminEmail="$ADMIN_EMAIL" -v AdminPhone="$ADMIN_PHONE" -v PasswordHash="$PASSWORD_HASH" \
  -i "$SQL_FILE"

echo
echo "Done. Log in at /api/auth/login with:"
echo "  email:    $ADMIN_EMAIL"
echo "  password: (the one you just entered)"

#!/usr/bin/env bash
# Deploys every stored procedure in Procedures/ against a SQL Server database, in
# numeric filename order (1_..., 2_..., ..., 45_...). Safe to re-run any time -
# every procedure uses CREATE OR ALTER, so this just (re)creates them in place.
#
# Usage:
#   ./deploy-procedures.sh -S <server[,port]> -d <database> -U <user> -P <password>
#
# Connection details can also come from environment variables instead of flags:
#   SQLCMD_SERVER, SQLCMD_DATABASE, SQLCMD_USER, SQLCMD_PASSWORD
#
# Example:
#   ./deploy-procedures.sh -S localhost -d AarogyamDB -U SA -P 'Vaibhav@1411'

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROC_DIR="$SCRIPT_DIR/Procedures"

SERVER="${SQLCMD_SERVER:-}"
DATABASE="${SQLCMD_DATABASE:-}"
USERNAME="${SQLCMD_USER:-}"
PASSWORD="${SQLCMD_PASSWORD:-}"

while getopts "S:d:U:P:" opt; do
  case "$opt" in
    S) SERVER="$OPTARG" ;;
    d) DATABASE="$OPTARG" ;;
    U) USERNAME="$OPTARG" ;;
    P) PASSWORD="$OPTARG" ;;
    *) echo "Usage: $0 -S <server> -d <database> -U <user> -P <password>"; exit 1 ;;
  esac
done

if [ -z "$SERVER" ]; then read -rp "Server (e.g. localhost or host,port): " SERVER; fi
if [ -z "$DATABASE" ]; then read -rp "Database [AarogyamDB]: " DATABASE; DATABASE="${DATABASE:-AarogyamDB}"; fi
if [ -z "$USERNAME" ]; then read -rp "Username [SA]: " USERNAME; USERNAME="${USERNAME:-SA}"; fi
if [ -z "$PASSWORD" ]; then read -rsp "Password: " PASSWORD; echo; fi

if ! command -v sqlcmd >/dev/null 2>&1; then
  echo "sqlcmd not found. Install it first (e.g. 'brew install sqlcmd')." >&2
  exit 1
fi

# Sort by the leading number in each filename (1_, 2_, ..., 45_) rather than
# lexicographically, so 2_ runs before 10_. (Avoiding mapfile/readarray here
# since macOS ships bash 3.2, which doesn't have them.)
FILES=()
while IFS= read -r line; do
  FILES+=("$line")
done < <(find "$PROC_DIR" -maxdepth 1 -name "*.sql" -print0 \
  | xargs -0 -n1 basename \
  | sort -t_ -k1,1n)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "No .sql files found in $PROC_DIR" >&2
  exit 1
fi

echo "Deploying ${#FILES[@]} procedures to [$DATABASE] on [$SERVER] as [$USERNAME]..."
echo

FAILED=0
for file in "${FILES[@]}"; do
  printf '%-45s ' "$file"
  if sqlcmd -S "$SERVER" -d "$DATABASE" -U "$USERNAME" -P "$PASSWORD" -C -b -i "$PROC_DIR/$file" >/tmp/sqlcmd_output.log 2>&1; then
    echo "OK"
  else
    echo "FAILED"
    echo "----- output -----"
    cat /tmp/sqlcmd_output.log
    echo "-------------------"
    FAILED=1
    break
  fi
done

rm -f /tmp/sqlcmd_output.log

if [ "$FAILED" -eq 1 ]; then
  echo
  echo "Stopped after a failure. Fix the procedure above and re-run - CREATE OR ALTER is safe to repeat."
  exit 1
fi

echo
echo "All ${#FILES[@]} procedures deployed successfully."

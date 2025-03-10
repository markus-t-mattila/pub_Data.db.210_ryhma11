#!/bin/sh
echo "Resetting database..."
psql -h localhost -U postgres -W -f reset_db.sql

echo "Initializing database..."
psql -h localhost -U postgres -W -f init_db.sql
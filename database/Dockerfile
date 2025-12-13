# Use official PostgreSQL image
FROM postgres:16-alpine

# Install additional tools if needed
RUN apk add --no-cache curl

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Set proper permissions
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1
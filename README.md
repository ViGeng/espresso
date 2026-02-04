# ☕ Espresso

A modern, minimal coffee lab manager for tracking daily coffee consumption and statistics.

## 🚀 Quick Start (Docker)

Run the app locally with a single command. The database persists in `espresso_data` volume.

```bash
docker run -d \
  -p 3000:3000 \
  -v espresso_data:/app/data \
  --name espresso \
  ghcr.io/vigeng/espresso:latest
```

Access at: http://localhost:3000

## ⚡ Update

To get the latest version from GitHub:

```bash
# Pull latest image
docker pull ghcr.io/vigeng/espresso:latest

# Restart container
docker stop espresso && docker rm espresso
docker run -d \
  -p 3000:3000 \
  -v espresso_data:/app/data \
  --name espresso \
  ghcr.io/vigeng/espresso:latest
```

> **Note**: Your data is safe! The `-v espresso_data:/app/data` flag ensures the database is stored in a persistent Docker volume, so it survives container updates and removals.

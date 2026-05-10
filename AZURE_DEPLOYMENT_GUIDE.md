# PhotoSphere Azure Deployment Guide

This project is ready for GitHub Actions deployment to Azure using Docker images.

## 1. Upload project to GitHub

```bash
git init
git add .
git commit -m "Initial PhotoSphere project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 2. Create Azure resources

Create these in Azure Portal:

1. Resource Group
2. Azure Container Registry, for example `photosphereacr`
3. Azure Web App for backend, Linux container
4. Azure Web App for frontend, Linux container
5. MongoDB database, recommended: MongoDB Atlas or Azure Cosmos DB MongoDB API
6. Redis, recommended: Azure Cache for Redis
7. Object storage, recommended: Azure Blob Storage or MinIO-compatible storage if you configure it yourself

> Important: The local `docker-compose.yml` uses Mongo, Redis and MinIO containers. For Azure production deployment, use managed services instead of local containers.

## 3. Add GitHub repository secrets

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

Add these secrets:

```text
AZURE_CREDENTIALS
ACR_LOGIN_SERVER
ACR_USERNAME
ACR_PASSWORD
AZURE_BACKEND_WEBAPP_NAME
AZURE_FRONTEND_WEBAPP_NAME
VITE_API_URL
```

Example values:

```text
ACR_LOGIN_SERVER=photosphereacr.azurecr.io
AZURE_BACKEND_WEBAPP_NAME=photosphere-backend-app
AZURE_FRONTEND_WEBAPP_NAME=photosphere-frontend-app
VITE_API_URL=https://photosphere-backend-app.azurewebsites.net/api
```

## 4. Create AZURE_CREDENTIALS

Install Azure CLI, then run:

```bash
az login
az ad sp create-for-rbac \
  --name "photosphere-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP \
  --sdk-auth
```

Copy the full JSON output and save it as GitHub secret:

```text
AZURE_CREDENTIALS
```

## 5. Backend Azure App Settings

In Azure Portal → Backend Web App → Settings → Environment variables, add:

```text
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
CLIENT_URL=https://your-frontend-app.azurewebsites.net
REDIS_URL=your_redis_connection_string
MINIO_ENDPOINT=your_storage_endpoint
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET=photosphere-media
STORAGE_PUBLIC_BASE_URL=your_public_storage_url
```

For testing seed accounts, you can also add:

```text
SEED_CREATOR_EMAIL=creator@photosphere.local
SEED_CREATOR_PASSWORD=password123
SEED_CONSUMER_EMAIL=consumer@photosphere.local
SEED_CONSUMER_PASSWORD=password123
```

## 6. Push to deploy

After secrets and Azure resources are ready:

```bash
git add .
git commit -m "Add Azure GitHub Actions deployment"
git push
```

GitHub Actions will build backend and frontend Docker images, push them to Azure Container Registry, then deploy both Azure Web Apps.

## 7. Check deployment

Open:

```text
https://YOUR_FRONTEND_WEBAPP_NAME.azurewebsites.net
https://YOUR_BACKEND_WEBAPP_NAME.azurewebsites.net/api/health
```

If frontend works but API fails, check:

1. `VITE_API_URL` GitHub secret
2. Backend `CLIENT_URL` app setting
3. MongoDB connection string
4. Redis connection string
5. Azure Web App logs

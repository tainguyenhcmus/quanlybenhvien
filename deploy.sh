#!/bin/bash

# Deployment Script for Hospital Management System
# Usage: ./deploy.sh [backend|frontend|all]

set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}📦 Deploying Backend...${NC}"
    cd backend
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm install --production
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "⚠️  Warning: .env file not found. Please create it from .env.example"
    fi
    
    echo -e "${GREEN}✅ Backend ready for deployment${NC}"
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}📦 Deploying Frontend...${NC}"
    cd frontend
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    npm install
    
    # Build frontend
    echo "Building frontend..."
    npm run build
    
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    echo "📁 Build output: frontend/dist/"
    cd ..
}

# Main deployment logic
case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all|"")
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "Usage: ./deploy.sh [backend|frontend|all]"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment completed!${NC}"


# Deployment Instructions (AWS EC2 + Docker Compose)

This guide provides step-by-step instructions to deploy AgriMind to an Amazon EC2 instance using Docker Compose.

## 1. Provision an EC2 Instance
1. Log in to AWS Management Console.
2. Launch a new EC2 instance (Ubuntu Server 22.04 LTS is recommended).
3. Instance Type: `t3.medium` or higher (needs enough RAM for Chroma and Mongo alongside Node).
4. Configure Security Group:
   - Allow SSH (Port 22)
   - Allow HTTP (Port 80)
   - Allow Custom TCP (Port 8080) for Frontend
   - Allow Custom TCP (Port 5000) for Backend access (if not proxied by frontend)

## 2. Connect to your Instance & Install Docker
```bash
ssh -i "your-key.pem" ubuntu@ec2-x-x-x-x.compute-1.amazonaws.com

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo apt install docker-compose -y
```

## 3. Clone Repository & Environment Setup
```bash
git clone <your-repo-url> agrimind
cd agrimind

# Setup environment variables
cp backend/.env.example backend/.env
nano backend/.env
# Add your real Anthropic API Key, Twilio Keys, and Weather API Keys.
```

## 4. Spin Up Services
Run the following command in the root tracking `docker-compose.yml`:
```bash
sudo docker-compose up -d --build
```
This command will:
1. Build the Node.js Backend image.
2. Build the Vite Frontend image (compiled to static Nginx).
3. Pull MongoDB and ChromaDB from Docker Hub.
4. Orchestrate them on an internal bridge network.

## 5. First-time DB Seeding
Once the services are up, seed the Chroma database for RAG context:
```bash
sudo docker-compose exec backend npm run seed
```

## 6. Verification
- Open your browser to `http://<EC2-PUBLIC-IP>:8080` to view the frontend.
- API is accessible at `http://<EC2-PUBLIC-IP>:5000/api/...`

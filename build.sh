ECR_REGISTRY=767397833843.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
docker build -t bia .
docker tag bia:latest $ECR_REGISTRY/bia2:latest
docker push $ECR_REGISTRY/bia2:latest

./build.sh
aws ecs update-service --cluster cl1biaplan10des2 --service svc1cl1biaplan10des2  --force-new-deployment
#inserir o ecs
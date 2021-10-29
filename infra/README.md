aws ecs register-task-definition --cli-input-json file://taskdef.json  --region us-west-2
aws ecs create-service --cli-input-json file://create-service.json  --region us-west-2

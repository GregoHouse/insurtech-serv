#!/bin/bash

# Pull the DynamoDB Local image
docker pull amazon/dynamodb-local:1.21.0

# Run the DynamoDB Local container
docker run -d -p 8000:8000 --name dynamodb amazon/dynamodb-local:1.21.0 -jar DynamoDBLocal.jar -sharedDb || true

# Create the table in DynamoDB Local
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:8000 > /dev/null

# Start the container if it's not running
docker start dynamodb || true
echo 'DynamoDB running in http://localhost:8000'
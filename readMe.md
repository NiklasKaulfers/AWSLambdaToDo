# Documentation (kinda)

## Functionality
each folder is its own lambda function in AWS\
they get an event through API Gateway with Lambda Proxy Integration\
each lambda also has full permissions for DynamoDB

## Implementation
compile files\
setup dynamo db table according to table design\
set up an IAM roles with those permissions:
- AmazonAPIGatewayInvokeFullAccess
- AmazonDynamoDBFullAccess
- AWSLambdaInvocation-DynamoDB

zip contents of each folder in dist (compiled files from src)\
each one of them will be its own lambda function for each of them:
- attach the prior created IAM role
- upload respective lambda as zip

setup APIGateway with LambdaProxyIntegration according to API linking with ur lambdas

## What's being worked on
currently it's just the to-to-lambda\
therefor others are not as improved and might be faulty

## Environment Variables
it needs TODO_TABLE_NAME and LIST_TABLE_NAME as environment variables in an .env file.\
this needs to be created as it is not stored within the repo

## API linking
/List (Post) -> lists\
/List/{id} (Delete) - lists\
/List/{id} (Get) - lists\
/List/{id} (Put) - lists\
/ToDo (Post) - to-do-lambda\
/ToDo/{id} (Delete) - to-do-lambda\
/ToDo/{id} (Get) - to-do-lambda\
/ToDo/{id} (Put) - to-do-lambda\
/ToDo/addToList (Post) - add-to-do-to-list\
/ToDos (Get) - get-all-to-dos

## Table Design
### Table 1: ToDos
id (Primary Key, string)\
name (string)\
ToDos (string set)

### Table 2: Lists
Id (Primary Key, string)\
description (string)\
inLists (string set)\
isCompleted (boolean)\
title (string)

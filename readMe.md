# Documentation (kinda)

## Usage
each folder is its own lambda function in AWS\
they get an event through API Gateway with Lambda Proxy Integration\
each lambda also has full permissions for DynamoDB

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

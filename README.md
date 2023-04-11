# Mesh Issue Reproduction

Mesh appears to ignore the `@httpOperation` directive when building the fetch request to the data source when it receives an annotated schema from Hive.

For example when we make this query:

```gql
query MyQuery {
  reminders {
    id
    complete
    title
    dateTime
    description
  }
}
```

We expect the request to be translated as follows

```
Method: GET
Base URL: http://localhost:3000/
Path: /reminders
get a list of reminders
```

When we build the datasource workspace we get the following Query and type

```gql
# from src/datasource/.mesh/schema.graphql

type Query @globalOptions(sourceName: "Datasource") {
  "Get all reminders"
  reminders: [Reminder] @httpOperation(path: "/reminders", operationSpecificHeaders: "{\"accept\":\"application/json\"}", httpMethod: GET)
}

type Reminder {
  "The ID of the reminder"
  id: Int!
  "The title of the reminder"
  title: String!
  "The description of the reminder"
  description: String
  "The date and time of the reminder"
  dateTime: DateTime
  "Whether the reminder is complete or not"
  complete: Boolean!
}

```

Notice the directives decorating the query with the appropriate data. path, operation headers, and the http method are all correct.

## The Error:

Our Query from earlier 

```gql
query MyQuery {
  reminders {
    id
    complete
    title
    dateTime
    description
  }
}
```

returns this result:

```json
{
  "errors": [
    {
      "message": "Unexpected response: \"Forbidden\""
    }
  ],
  "extensions": {
    "httpDetails": [
      {
        "sourceName": "Datasource",
        "request": {
          "timestamp": 1681161784989,
          "url": "http://localhost:3000/",
          "method": "POST",
          "headers": {
            "accept": "application/graphql-response+json, application/json, multipart/mixed",
            "content-type": "application/json"
          }
        },
        "response": {
          "timestamp": 1681161785080,
          "status": 403,
          "statusText": "Forbidden",
          "headers": {
            "vary": "X-HTTP-Method, X-HTTP-Method-Override, X-Method-Override",
            "content-type": "text/plain; charset=utf-8",
            "content-length": "9",
            "connection": "close"
          }
        },
        "responseTime": 91
      }
    ]
  }
}
```

Notice that the HTTP Extensions are saying there is a POST request being made so our actual request looks like this:

```
POST http://localhost:3000/
```

We appear to be missing all of the details from @httpOperation in the actual request.

Expected request to be made:
```
GET http://localhost:3000/reminders
```

## Steps to Run & Reproduce

1. install `pnpm` with `npm install -g pnpm`
2. clone and pull this repo
3. run `pnpm install` from the root
4. build the datasource schema by running `pnpm run build-ds`
5. publish the schema to Hive by running `pnpm run publish`
6. pull the latest schema and run both the gateway and the server with `pnpm run local`

run any GET query.

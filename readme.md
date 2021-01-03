# HTTP Endpoint Timming

Make HTTP calls to your api's after each deploy or push to check your performance did not decreased


## Ussage 

We need a config file with the information about the paths, authroization and other options. 

```json
{
    "basepath": "https://api.website.com",
    "parallelism": {
        "enabled": false, 
        "maxRequests": 1
    },
    "endpoints": [{
        "timeoutMS": 120000,
        "path": "/upload/xml",
        "method": "POST",
        "allowKeepAliveAgent": false, 
        "headers": { 
            "Authorization": "7uJf38Oixh"
        },
        "type": ["application/x-www-form-urlencoded", "application/json"], 
        "content": {
            "urlBody": "https://trello-attachments.s3.amazonaws.com/5b212ef1b9c8c8ed628b2336/5ee8e088723df33f388cdf02/701ffd1baedc5ff85690530928b2892f/1000_attendees.xml",
            "body": {}
        }
    }]
}
```

* basepath: The URL of the API. 
* paralelism: This is not developed yet
* endpoints: an array with the information for run the testings, you can add as much as you want, the action will make a call one by one
    * timeout: Set a millisecond timeout to close the connection if the time reached. `default: 60000`
    * path: the path you want to test 
    * method: all HTTP methods are allowed here 
    * allowKeepAliveAgent: If you want to keep alive the connection while the action is running the request. this will be useful if you want to avoid measuring the network latency, the default values are:   
        - AGENT_REQ_FREESOCKETTIMEOUT = 15000
        - AGENT_REQ_TIMEOUT = 30000
        - AGENT_REQ_MAXSOCKETS = 30
        - AGENT_REQ_MAXFREESOCKETS = 5
    * type: the Content-Type suitable to perform the requests, the values allowed are: `application/x-www-form-urlencoded, application/json`
    * content: this object will handle the body of your request, if you body content is too large you can use a url pointing to a file, the action will download it. 
        - urlBody: `only if you body is loacted in a url` this option will be over the body field. 
        - body: thie field should be an object with the body request. If you want to use this option, please set `"urlBody": null|false`



# leonardo-dao-vinci

# Running the project
## User Interface
From the root directory run the following, long-running, command:s
```
cd client
npm install
npm run start
```

## Server for communicating with the OpenSea API
```
cd openseaIntegration
npm install
. .env; node index.js
```

Note: make sure that you are running Node 8.11.4

The server handles requests on the URL `http://localhost:3001/auction/token/<tokenId>`
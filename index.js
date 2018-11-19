let WebSocketServer = require("ws").Server;
let http = require("http");
let express = require("express");
let app = express();
let port = process.env.PORT || 5000;
let uuid = require("node-uuid");
let clients = [];

app.use(express.static(__dirname + "/"));

let server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);

let wss = new WebSocketServer({ server: server });
console.log("websocket server created");

wss.on("connection", function(ws) {
  console.log("websocket connection open");

  let client_uuid = uuid.v1();
  clients.push({ id: client_uuid, ws: ws });
  console.log("client [%s] connected", client_uuid);

ws.on("message", function(message) {    
    for (var i = 0; i < clients.length; i++) {
      let clientSocket = clients[i].ws;
      if (clientSocket.readyState === 1) {
        // console.log("client [%s]: %s", clients[i].id, message);
        let pos = JSON.parse(message);
        let mess = pos[1];
        let type = pos[0];
        // "DEL" "MOVE" "MESSAGE";
        switch(type){
          case "MOVE":
          clientSocket.send(
            JSON.stringify({
              id: client_uuid,
              type: type,
              lat: pos[1],
              lng: pos[2],
              title: pos[3]
            })
          );
          break;
          case "MESSAGE":
          clientSocket.send(  
            JSON.stringify({
              id: client_uuid,
              type: type,
              message:mess,
            })
          );
           break;
           case "DEL":
          clientSocket.send(
            JSON.stringify({
              id: client_uuid,
              type: type,
              
            })
          );
          break;
        }
        
        
      }
    }
  
    
  });

  ws.on("close", function() {
    
    console.log("websocket connection close"+client_uuid);
  });
});

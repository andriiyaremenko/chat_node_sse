var app = require('express')();
var requests = [];
var messages = [];
var users = [];
var getMessage = function(msg, who){
    return msg.to.indexOf(who) != -1||msg.to.length==1 ? msg : false;
};

app.get('/getUserList', function(req, res){
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(JSON.stringify({list: users}));
});

app.get('/stream', function(req, res){
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write("data: its me!\n\n");
    var mesCount = 0;
    var usCount = 0;
    var userName = req.query.name;
    setInterval(function(){
      if(mesCount<messages.length){
        var msg = getMessage(messages[mesCount], userName);
        if(msg){
          res.write("event: chatMessage\n");
          res.write("data: " + JSON.stringify(msg) + "\n\n");
        };
        mesCount++;
      };
      if(usCount<users.length){
        res.write("event: join data\n");
        res.write("data: "+JSON.stringify(users[usCount])+"\n\n");
        usCount++;
      };
    },1000);
});

app.post('/postName', function(req, res){
  req.on('data', function(data){
    userName = JSON.parse(data).name;
    users.push(userName);
  });
  res.end("");
});

app.post('/postMessage', function(req, res){
  req.on('data', function(data){
    messages.push(JSON.parse(data));
  });
  res.end("");
});

app.get('/', function(req, res){
  res.sendfile('sseChat.html');
});

app.listen(8000, function(){
  console.log('listening on *: 8000')
});

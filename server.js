var express = require('express');
var socket = require('socket.io');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var mongoose = require('mongoose');
app.use(express.static(__dirname));

var dbUrl ='mongodb+srv://chatApp:123@cluster0-hnhvs.gcp.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(dbUrl ,{ useUnifiedTopology: true , useNewUrlParser: true }, (err) => { 
    console.log('mongoDb connected',err);
 });
const connection = mongoose.connection;
connection.once('open',()=>{
    console.log('connection established');
})

var Message = mongoose.model('Message',{name:String , message:String});



var server = app.listen(3000,() =>{
    console.log("listening on port 3000 ...");
});
var io=socket(server);

io.on('connection',(socket)=>{
    console.log('new person joined chatroom');


    socket.on('typing',(name)=>{
        socket.broadcast.emit('typing', name);
    })
})




app.get('/messages',(req,res)=>{
    Message.find({},(err , messages) =>{
        res.send(messages);
    })
});

app.post('/messages', (req, res) => {
    var message =new Message(req.body);
    message.save((err)=>{
        if(err){res.sendStatus(500)}
        io.emit('addMessage',req.body);
        res.sendStatus(200);
    })
    
});

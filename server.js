var http       = require('http');
var url        = require('url');
var db         = require('mongodb');
var express    = require('express');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var session    = require('express-session');
var app        = express();

mongoose.connect('mongodb://localhost/database');
var contact = mongoose.Schema({
    name:String,
    number:Number,
    job:String,
    address:String
});
var user = mongoose.Schema({
    username:String,
    password:String,
    email:String
});

contact = mongoose.model("contact",contact);
user = mongoose.model("memebr",user);

app.engine('html', require('ejs').renderFile);
//Directories
app.use('/scripts', express.static(__dirname + '/js'));
app.use('/views', express.static(__dirname + '/views'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
//Views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//Json Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({secret:"swp"}));

app.post('/add_contact',function(req,res){

    if(!req.body.name || !req.body.number|| !req.body.job || !req.body.address){
        res.send({error:1,error_mess:"Some field is empity"});
    }else{
        var data = new contact({name:req.body.name,
                                number:req.body.number,
                                job:req.body.job,
                                address:req.body.address});
        data.save(function(err,contact){
            if(err)
                res.send({error:1,error_mess:err});
            else
                res.send({error:0});
        });
    }
});
app.get('/get_contact',function(req,res){
    contact.find({},function(err,result){      
        var data = {records:result};
        res.send(data); 
    });
});
app.delete("/del_contact/:id",function(req,res){
    if(typeof req.session._id == 'undefined'){
        res.send({error:1,error_mess:"you are not authrozied to delete"});
    }else{
        contact.findByIdAndRemove(req.params.id,
        function(err){
            if(err) res.send({error:1,error_mess:err});
            else res.send({error:0});
        });
    }
});
app.post("/upd_contact",function(req,res){
    contact.findByIdAndUpdate(req.body.id,{name:req.body.name,
                                             number:req.body.number,
                                             job:req.body.job,
                                             address:req.body.address},
    function(err){
        if(err) res.send({error:1,error_mess:err});
        else res.send({error:0});
    });
});
app.get('/',function(req,res){
    res.render('index.html');
});
app.post('/signin',function(req,res){
    if(!req.body.username || !req.body.password){
        console.log("username or password is empity");
        res.send();
    }else{
        user.find({username:req.body.username,password:req.body.password},
        function(err,result){
            if(err){console.log(err); res.send({error:1,error_mess:"no data"});}
            else{
                if(Object.keys(result).length >= 1) {
                    req.session._id      = result[0]._id;
                    req.session.username = result[0].username;   
                    res.send(result); 
                }else{
                    res.send();
                }
            }
        });
    }
});
app.post('/signup',function(req,res){
    if(!req.body.username || !req.body.password || !req.body.email){
        console.log("username or password or email is emptiy");
        res.send({error:1,error_mess:"username or password or email is emptiy"});
    }else{
        var data = new user({username:req.body.username,
                               password:req.body.password,
                               email:req.body.email});
        data.save(function(err,user){
            if(err) res.send({error:1,error_mess:err});
            else res.send({error:0});
        });
    }
});
app.delete('/signout',function(req,res){
    req.session.destroy();
    res.send({error:0});
});
app.get('/auth',function(req,res){
    if(typeof req.session._id != "undefined"){
        res.send({auth:true,id:req.session._id,username:req.session.username});
    }else{
        res.send({auth:false}); console.log("not authorized");
    }
});
app.listen(3000);



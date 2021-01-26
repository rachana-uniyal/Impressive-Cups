
var express = require('express');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
 var path = require('path');
var multer  = require('multer');
var fs = require('fs-extra');
var session = require('express-session'); 
var MemoryStore = require('memorystore')(session)
var flash = require('connect-flash'); 
var cookieParser = require('cookie-parser');
const port = process.env.PORT;




var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'admin',
      password : 'passwd',
      database : 'mughub'
    });
connection.connect(function(err) {
 // if (err) throw err
  console.log('You are now connected...')
})

const storage = multer.diskStorage({
destination: (req, file, cb) => {
  var user = req.body.name;
  var dir = "./uploads/" + user
  fs.exists(dir, exist => {
  if (!exist) {
    return fs.mkdir(dir, error => cb(error, dir))
  }
  return cb(null, dir)
  })
},
filename: (req, file, cb) => {
  var user = req.body.name;
  var today = Date();
  cb(null, user+'-'+today+'-'+file.originalname);
}
})
const upload = multer({ storage })
//start body-parser configuration
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//end body-parser configuration


 
//create app server
var server = app.listen(port, () => {
 
 // var host = server.address().address  "127.0.0.1",
  //var port = server.address().port
 
  //console.log("Example app listening at http://%s:%s", host, port)
 // console.log("App running on port ${port}");
 
});

app.use(session({ 
    secret:'SECRET', 
    cookie: { maxAge: 60000 },
     store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    saveUninitialized: true, 
    resave: true,
})); 
 
app.use(flash());

app.use(function(req, res, next) {
  res.locals.message = req.flash();
  next();
});




 

// Set EJS as templating engine 

app.set('view engine', 'ejs'); 
app.set('views', __dirname+'/views');

//rest api to create a new record into mysql database
app.post('/submitform',upload.single('imgpath'), function (req, res) {

   var postData  = req.body; //name, req.body.mobileno, req.body.address, req.body.comment, req.body.imgpath, today ];
   connection.query('INSERT INTO details SET ? ', postData , function (error, results, fields) {
    if (error) throw error;
    else
    {
     
       req.flash('success', 'Order Placed successfully!');
       //console.log(res.locals.message);
        res.redirect('/'); 
    }
  });
});

app.get('/', function(req, res) {
    res.render('index', req.flash("Welcome !"));

});
  

  


app.use("/public" , express.static(path.join(__dirname, '/public')));


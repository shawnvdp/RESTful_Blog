let bodyParser  = require("body-parser"),
mongoose        = require("mongoose"),
express         = require("express"),
app             = express();

//create local mongodb if it doesn't exist, otherwise use it
mongoose.connect("mongodb://localhost/restful_blog", {useNewUrlParser: true});

//express setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//define a schema that the blog post entries will follow
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //data type 'Date' with the current date as default value
});
//mongoose model config
let Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES

app.get("/", function(req, res){
    res.redirect("blogs");
})

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){ //find all entries in our database, handle err/results in callback function
        if (err){
            console.log("ERROR");
        } else{
            res.render("index", {blogs: blogs}); //pass blog results into index.ejs, calling it 'blogs'
        }
    });
});


//serve server on port 3000
app.listen(3000, function(){
    console.log("RESTful blog now listening on port 3000.");
})
let expressSanitizer    = require("express-sanitizer"),
methodOverride          = require("method-override"),
bodyParser              = require("body-parser"),
mongoose                = require("mongoose"),
express                 = require("express"),
app                     = express();

//create local mongodb if it doesn't exist, otherwise use it
mongoose.connect("mongodb://localhost/restful_blog", {useNewUrlParser: true});

//express setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //must go after bodyParser
app.use(methodOverride("_method")); //configure the string Method_Override looks for (put/delete requests)

//define a schema that the blog post entries will follow
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} //data type 'Date' with the current date as default value
});
//mongoose model config
let Blog = mongoose.model("Blog", blogSchema);

//ROOT
app.get("/", function(req, res){
    res.redirect("blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){ //find all entries in our database, handle err/results in callback function
        if (err){
            console.log("ERROR");
        } else{
            res.render("index", {blogs: blogs}); //pass blog results into index.ejs, calling it 'blogs'
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE
app.post("/blogs", function(req, res){
    //grab the form data from the request's body
    let formData = req.body.blog;
    req.body.blog.body = req.sanitize(req.body.blog.body); //req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
    Blog.create(formData, function(err, newBlog){
        if (err){
            res.render("new");
        } else{
            res.redirect("/blogs");
        }
    });
});

//SHOW
app.get("/blogs/:id", function(req, res){
    //grab the ':id' field from the url inside req.params
    let blogID = req.params.id;
    //search the database and grab matching _id entry
    Blog.findById(blogID, function(err, foundBlog){
        if (err){
            res.redirect("index");
        } else{
            res.render("show", {blog: foundBlog});
        }
    })
});

//EDIT
app.get("/blogs/:id/edit", function(req, res){
    let blogID = req.params.id;
    Blog.findById(blogID, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//UPDATE
app.put("/blogs/:id", function(req, res){
    let blogID = req.params.id;
    req.body.blog.body = req.sanitize(req.body.blog.body); //req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
    //lookup matching entry and update in 1 method
    Blog.findByIdAndUpdate(blogID, req.body.blog, function(err, updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else{
            //redirect to blog's SHOW page
            res.redirect("/blogs/" + blogID);
        }
    });
});

//DELETE
app.delete("/blogs/:id", function(req, res){
    let blogID = req.params.id;
    //lookup matching entry and delete in 1 method
    Blog.findByIdAndDelete(blogID, function(err){
        if (err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    });
});


//serve server on port 3000
app.listen(3000, function(){
    console.log("RESTful blog now listening on port 3000.");
})
let expressSanitizer    = require("express-sanitizer"),
methodOverride          = require("method-override"),
bodyParser              = require("body-parser"),
mongoose                = require("mongoose"),
express                 = require("express"),
seedDB                  = require("./seeds"),
Blog                    = require("./models/blog"),
comments                = require("./models/comment"),
app                     = express();

//create local mongodb if it doesn't exist, otherwise use it
mongoose.connect("mongodb://localhost/restful_blog", {useNewUrlParser: true});

//express setup
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
//must go after bodyParser
app.use(expressSanitizer());
//configure the string Method_Override looks for (put/delete requests)
app.use(methodOverride("_method"));
//execute the imported seedDB function (removes all, then populates blogs/comments)
seedDB();

//ROOT
app.get("/", function(req, res){
    res.redirect("blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res){
    //find all entries in our database, handle err/results in callback function
    Blog.find({}, function(err, blogs){
        if (err){
            console.log("ERROR");
        } else{
            //pass blog results into index.ejs, calling it 'blogs'
            res.render("index", {blogs: blogs});
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
    //req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
    req.body.blog.body = req.sanitize(req.body.blog.body);
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
    //populate the comments array holding Comment _id references, .exec to actually exec the query
    Blog.findById(blogID).populate("comments").exec(function(err, foundBlog){
        if (err){
            res.redirect("index");
            console.log(err);
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
    //req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
    req.body.blog.body = req.sanitize(req.body.blog.body);
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
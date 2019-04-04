let expressSanitizer = require("express-sanitizer"),
	methodOverride = require("method-override"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	express = require("express"),
	app = express(),
	seedDB = require("./seeds"),
	Comment = require("./models/comment"),
	Blog = require("./models/blog");

//create local mongodb if it doesn't exist, otherwise use it
mongoose.connect("mongodb://localhost/restful_blog", {
	useNewUrlParser: true
});

//express setup
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
//must go after bodyParser
app.use(expressSanitizer());
//configure the string Method_Override looks for (put/delete requests)
app.use(methodOverride("_method"));
//execute the imported seedDB function (removes all, then populates blogs/comments)
seedDB();

//ROOT
app.get("/", function(req, res) {
	res.redirect("blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req, res) {
	//find all entries in our database, handle err/results in callback function
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log("ERROR");
		} else {
			//pass blog results into index.ejs, calling it 'blogs'
			res.render("blogs/index", {
				blogs: blogs
			});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("blogs/new");
});

//CREATE
app.post("/blogs", function(req, res) {
	//grab the form data from the request's body
	let formData = req.body.blog;
	//req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(formData, function(err, newBlog) {
		if (err) {
			res.render("blogs/new");
		} else {
			res.redirect("/blogs");
		}
	});
});

//SHOW
app.get("/blogs/:id", function(req, res) {
	//grab the ':id' field from the url inside req.params
	let blogID = req.params.id;
	//populate the comments array holding Comment _id references, .exec to actually exec the query
	Blog.findById(blogID)
		.populate("comments")
		.exec(function(err, foundBlog) {
			if (err) {
				res.redirect("index");
				console.log(err);
			} else {
				res.render("blogs/show", {
					blog: foundBlog
				});
			}
		});
});

//EDIT
app.get("/blogs/:id/edit", function(req, res) {
	let blogID = req.params.id;
	Blog.findById(blogID, function(err, foundBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.render("blogs/edit", {
				blog: foundBlog
			});
		}
	});
});

//UPDATE
app.put("/blogs/:id", function(req, res) {
	let blogID = req.params.id;
	//req.body = form data, blog.body = 'name' attribute object, set that equal to sanitized version of current(strip script tags)
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//lookup matching entry and update in 1 method
	Blog.findByIdAndUpdate(blogID, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect("/blogs");
		} else {
			//redirect to blog's SHOW page
			res.redirect("/blogs/" + blogID);
		}
	});
});

//DELETE
app.delete("/blogs/:id", function(req, res) {
	let blogID = req.params.id;
	//lookup matching entry and delete in 1 method
	Blog.findByIdAndDelete(blogID, function(err) {
		if (err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

/*
 ** COMMENTS ROUTES **
 */

//NEW
app.get("/blogs/:id/comments/new", function(req, res) {
	let blogID = req.params.id;
	Blog.findById(blogID, function(err, blog) {
		if (err) {
			console.log(err);
			res.redirect("/blogs/" + blogID);
		} else {
			res.render("comments/new", { blog: blog });
		}
	});
});

//CREATE
app.post("/blogs/:id/comments", function(req, res) {
	let blogID = req.params.id;
	Blog.findById(blogID, function(err, blog) {
		if (err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			//pass in the comment object from the form's 'name' attributes (comment[author], comment[text])
			//which is an exact match for our 'Comment' mongoose model {title: String, author: String}
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					console.log(err);
				} else {
					//push newly created comment into found blog's comments[]
					blog.comments.push(comment);
					blog.save();
					res.redirect("/blogs/" + blog._id);
				}
			});
		}
	});
});

//serve server on port 3000
app.listen(3000, function() {
	console.log("RESTful blog now listening on port 3000.");
});

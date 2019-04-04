let mongoose = require("mongoose"),
    Comment = require("./models/comment"),
    Blog = require("./models/blog");

//placeholder blog data to create a few blogs on launch
let data = [{
        title: "1",
        image: "https://i.imgur.com/VLY6ZGt.jpg",
        body: "11"
    },
    {
        title: "2",
        image: "https://i.imgur.com/Fo5gqZ4.jpg",
        body: "22"
    },
    {
        title: "3",
        image: "https://i.imgur.com/MINW5Xv.jpg",
        body: "33"
    },
]

function seedDB() {
    //remove all blogs
    Blog.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all blog posts");
            //once we have removed all blogs without errors, loop through the data array
            data.forEach(function (post) {
                //create blog post for each entry in data array
                Blog.create(post, function (err, postCreated) {
                    if (err) {
                        console.log(err);
                    } else {
                        //create a placeholder comment
                        Comment.create({
                            text: "This is a comment",
                            author: "That one guy"
                        }, function (err, comment) {
                            if (err) {
                                console.log(err);
                            } else {
                                //if we have successfully created a comment, add it to the newly created blog's 'comments' array
                                postCreated.comments.push(comment);
                                //actually save the new post including the comment to the DB
                                postCreated.save();
                            }
                        });
                    }
                });
            });
        }
    });
}

//export the seedDB function so we can import and execute it in app.js
module.exports = seedDB;
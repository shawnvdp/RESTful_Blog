let mongoose = require("mongoose"),
Comment      = require("./comment");

//define a schema that the blog post entries will follow
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    //data type 'Date' with the current date as default value
    created: {type: Date, default: Date.now},
    //comments is an array that holds references to the _id's of comment objects
    comments: [
        {
            //mongoose ._id
            type: mongoose.Schema.Types.ObjectId,
            //we will be referencing actual 'Comment' objects with the above mongoose object ._id
            ref: "Comment"
        }
    ]
});
//export the mongoose model object
module.exports = mongoose.model("Blog", blogSchema);
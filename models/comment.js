let mongoose = require("mongoose");

//define a schema that the comment entries will follow
let commentSchema = new mongoose.Schema({
    text: String,
    author: String
});

//export the mongoose model object
module.exports = mongoose.model("Comment", commentSchema);
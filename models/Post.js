const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
  title: { type: String, require: true },
  content: String,
  status: {
    type: String,
    enum: ["BROUILLON", "PUBLISHED"],
    default: "BROUILLON",
  },
  author: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

const Post = mongoose.model("post", PostSchema);

module.exports = Post;

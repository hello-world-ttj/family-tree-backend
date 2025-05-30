const mongoose = require("mongoose");

const news_schema = mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Latest",
        "Current Affairs",
        "Trending",
        "History",
        "Entertainment",
        "Volunteering",
        "Events/ Programmes",
      ],
    },
    title: { type: String },
    content: { type: String },
    media: { type: String },
    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "unpublished",
    },
    pdf: { type: String },
  },
  { timestamps: true }
);

const News = mongoose.model("News", news_schema);

module.exports = News;

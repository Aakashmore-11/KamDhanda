const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const companySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    companyLogo: {
      type: String,
      default: "https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg",
    },
    companyWebsiteUrl: String, //optional
    companyDescription: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    location: {
      type: String,
      required: true
    },
    recruiters: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    industry: {
      type: String,
      enum: [
        "Information Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Retail",
        "Manufacturing",
        "Media",
        "Consulting",
        "Government",
        "Other",
      ],
      required: true,

    },

    departments: [{
      type: String,
      enum: [
        "Development",
        "Design",
        "Marketing",
        "Sales",
        "HR",
        "Finance",
        "Operations",
        "Support",
        "Other"
      ],
      required: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  },
  { timestamps: true }
);

const Company = model("companies", companySchema);
module.exports = Company;

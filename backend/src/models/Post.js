const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    peoplePresent: [{ type: String, trim: true }],
    imageUrl: { type: String, required: true },
    imageObjectKey: { type: String, required: true },
    originalFilename: { type: String, required: true },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', caption: 'text', location: 'text', peoplePresent: 'text' });

module.exports = mongoose.model('Post', postSchema);

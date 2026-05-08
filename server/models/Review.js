const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    alert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
      required: true,
      unique: true, // One review per alert
    },
    woman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
    tags: [
      {
        type: String,
        enum: ['Quick Response', 'Very Helpful', 'Professional', 'Calm & Supportive', 'Arrived Fast'],
      },
    ],
  },
  { timestamps: true }
);

reviewSchema.index({ volunteer: 1 });
reviewSchema.index({ woman: 1 });

// After saving a review, update volunteer's average rating
reviewSchema.post('save', async function () {
  const User = mongoose.model('User');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { volunteer: this.volunteer } },
    { $group: { _id: '$volunteer', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.volunteer, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);

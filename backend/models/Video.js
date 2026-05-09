const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index 0-3
  explanation: { type: String },
});

const videoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Video',
    },
    channelName: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '',
    },
    viewCount: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: String,
      default: '',
    },
    transcript: {
      type: String,
      default: '',
    },
    transcriptWordCount: {
      type: Number,
      default: 0,
    },
    analysis: {
      summary: { type: String, default: '' },
      bulletPoints: [{ type: String }],
      keyConcepts: [
        {
          term: String,
          definition: String,
          importance: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        },
      ],
      mcqs: [mcqSchema],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative', 'mixed'],
        default: 'neutral',
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate',
      },
      tags: [{ type: String }],
      estimatedReadTime: { type: Number, default: 0 }, // minutes
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    userNotes: {
      type: String,
      default: '',
    },
    processingTime: {
      type: Number, // milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + video lookup
videoSchema.index({ userId: 1, videoId: 1 });
videoSchema.index({ userId: 1, createdAt: -1 });
videoSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('Video', videoSchema);

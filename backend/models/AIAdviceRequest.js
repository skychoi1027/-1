/**
 * AI 피드백 요청 모델
 */
const mongoose = require('mongoose');

const aiAdviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  compatibilityResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompatibilityResult',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  salAnalysis: [
    {
      type: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
    },
  ],
  aiAdvice: {
    advice: {
      type: String,
      default: '',
    },
    tips: [String],
    summary: {
      type: String,
      default: '',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AIAdviceRequest', aiAdviceRequestSchema);


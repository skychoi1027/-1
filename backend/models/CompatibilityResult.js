/**
 * 궁합 결과 모델
 */
const mongoose = require('mongoose');

const compatibilityResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userInputId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInput',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  explanation: {
    type: String,
    required: true,
  },
  saju1: {
    year: {
      gan: String,
      ji: String,
    },
    month: {
      gan: String,
      ji: String,
    },
    day: {
      gan: String,
      ji: String,
    },
    hour: {
      gan: String,
      ji: String,
    },
  },
  saju2: {
    year: {
      gan: String,
      ji: String,
    },
    month: {
      gan: String,
      ji: String,
    },
    day: {
      gan: String,
      ji: String,
    },
    hour: {
      gan: String,
      ji: String,
    },
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
        default: 0,
      },
      description: {
        type: String,
        default: '',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CompatibilityResult', compatibilityResultSchema);


/**
 * 사용자 정보 입력 모델 (두 명의 정보)
 */
const mongoose = require('mongoose');

const userInputSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user1: {
    name: {
      type: String,
      required: true,
    },
    birthDate: {
      type: String,
      required: true,
    },
    birthTime: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['남', '여'],
      required: true,
    },
  },
  user2: {
    name: {
      type: String,
      required: true,
    },
    birthDate: {
      type: String,
      required: true,
    },
    birthTime: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['남', '여'],
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserInput', userInputSchema);


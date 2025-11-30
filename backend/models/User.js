/**
 * 사용자 모델 (회원 정보)
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  profile: {
    name: {
      type: String,
      default: '',
    },
    birthDate: {
      type: String,
      default: '',
    },
    birthTime: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['남', '여', ''],
      default: '',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 업데이트 시 updatedAt 자동 갱신
userSchema.pre('save', async function () {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
});

module.exports = mongoose.model('User', userSchema);


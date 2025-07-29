import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    tokens: Number,
    model: String,
    processingTime: Number
  }
});

const componentVersionSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true
  },
  jsx: {
    type: String,
    required: true
  },
  css: {
    type: String,
    default: ''
  },
  props: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  generationPrompt: String,
  metadata: {
    model: String,
    tokens: Number,
    processingTime: Number
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Component Session'
  },
  description: {
    type: String,
    default: ''
  },
  messages: [messageSchema],
  components: [componentVersionSchema],
  currentComponentVersion: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  settings: {
    autoSave: {
      type: Boolean,
      default: true
    },
    model: {
      type: String,
      default: 'gemini-2.0-flash-lite'
    },
    maxTokens: {
      type: Number,
      default: 4096
    }
  },
  statistics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Update statistics on save
sessionSchema.pre('save', function(next) {
  this.statistics.totalMessages = this.messages.length;
  this.statistics.totalTokens = this.messages.reduce((total, msg) => {
    return total + (msg.metadata?.tokens || 0);
  }, 0);
  this.statistics.lastActiveAt = new Date();
  next();
});

// Index for better query performance
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ isPublic: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;

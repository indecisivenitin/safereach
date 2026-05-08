
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    // =====================================================
    // WOMAN WHO CREATED SOS
    // =====================================================

    woman: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // =====================================================
    // VOLUNTEER WHO ACCEPTED ALERT
    // =====================================================

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // =====================================================
    // WOMAN MESSAGE
    // =====================================================

    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Message cannot exceed 200 characters'],
      default: 'SOS! I need immediate help.',
    },

    // =====================================================
    // VOLUNTEER RESPONSE MESSAGE
    // =====================================================

    responseMessage: {
      type: String,
      trim: true,
      maxlength: [200, 'Response message cannot exceed 200 characters'],
      default: '',
    },

    // =====================================================
    // ALERT LOCATION
    // =====================================================

    location: {

      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,

        validate: {
          validator(value) {

            return (
              Array.isArray(value) &&
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 &&
              value[1] >= -90 &&
              value[1] <= 90
            );
          },

          message:
            'Coordinates must be [longitude, latitude]',
        },
      },

      address: {
        type: String,
        trim: true,
        default: '',
      },
    },

    // =====================================================
    // ALERT STATUS
    // =====================================================

    status: {
      type: String,

      enum: [
        'pending',
        'active',
        'resolved',
        'cancelled',
        'expired',
      ],

      default: 'pending',
    },

    // =====================================================
    // NOTIFIED VOLUNTEERS
    // =====================================================

    notifiedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // =====================================================
    // DECLINED VOLUNTEERS
    // =====================================================

    declinedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // =====================================================
    // TIMESTAMPS
    // =====================================================

    acceptedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // DISTANCE INFO
    // =====================================================

    distanceToVolunteer: {
      type: Number,
      default: 0,
    },

    // =====================================================
    // REVIEW STATUS
    // =====================================================

    hasReview: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // LIVE LOCATION TRACKING
    // =====================================================

    volunteerLocationHistory: [
      {
        coordinates: {
          type: [Number], // [lng, lat]
          default: [],
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =====================================================
    // CHAT / RESPONSE HISTORY
    // =====================================================

    responseHistory: [
      {
        sender: {
          type: String,
          enum: ['woman', 'volunteer'],
        },

        message: {
          type: String,
          trim: true,
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =====================================================
    // META
    // =====================================================

    priority: {
      type: String,
      enum: ['normal', 'high', 'critical'],
      default: 'high',
    },

    emergencyType: {
      type: String,
      default: 'general',
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// =====================================================
// INDEXES
// =====================================================

// Geospatial search
alertSchema.index({
  location: '2dsphere',
});

// Fast status lookup
alertSchema.index({
  status: 1,
  createdAt: -1,
});

// Woman alert history
alertSchema.index({
  woman: 1,
  status: 1,
});

// Volunteer alert history
alertSchema.index({
  volunteer: 1,
  status: 1,
});

// =====================================================
// AUTO EXPIRE PENDING ALERTS
// =====================================================

alertSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 600,

    partialFilterExpression: {
      status: 'pending',
    },
  }
);

// =====================================================
// VIRTUALS
// =====================================================

// Help duration in minutes

alertSchema.virtual('helpDuration').get(function () {

  if (
    this.acceptedAt &&
    this.resolvedAt
  ) {

    return Math.round(
      (this.resolvedAt - this.acceptedAt) /
      60000
    );
  }

  return null;
});

// Whether volunteer assigned

alertSchema.virtual('isAssigned').get(function () {

  return !!this.volunteer;
});

// =====================================================
// MIDDLEWARE
// =====================================================

// Auto-set resolvedAt

alertSchema.pre('save', function (next) {

  if (
    this.isModified('status') &&
    this.status === 'resolved' &&
    !this.resolvedAt
  ) {

    this.resolvedAt = new Date();
  }

  next();
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model(
  'Alert',
  alertSchema
);
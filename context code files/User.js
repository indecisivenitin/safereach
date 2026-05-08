// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'Name is required'],
//       trim: true,
//       maxlength: [50, 'Name cannot exceed 50 characters'],
//     },
//     email: {
//       type: String,
//       required: [true, 'Email is required'],
//       unique: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
//     },
//     phone: {
//       type: String,
//       required: [true, 'Phone number is required'],
//       match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
//     },
//     password: {
//       type: String,
//       required: [true, 'Password is required'],
//       minlength: [8, 'Password must be at least 8 characters'],
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ['woman', 'volunteer'],
//       required: [true, 'Role is required'],
//     },
//     avatar: {
//       type: String,
//       default: '',
//     },
//     // GeoJSON Point for volunteer location (required for volunteers)
//     location: {
//       type: {
//         type: String,
//         enum: ['Point'],
//         default: 'Point',
//       },
//       coordinates: {
//         type: [Number], // [longitude, latitude]
//         default: [0, 0],
//       },
//       address: {
//         type: String,
//         default: '',
//       },
//       updatedAt: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//     // Only for volunteers
//     isActive: {
//       type: Boolean,
//       default: false,
//     },
//     fcmToken: {
//       type: String,
//       default: '',
//       select: false,
//     },
//     emergencyContacts: [
//       {
//         name: String,
//         phone: String,
//         relation: String,
//       },
//     ],
//     totalAlertsHelped: {
//       type: Number,
//       default: 0,
//     },
//     averageRating: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5,
//     },
//     totalReviews: {
//       type: Number,
//       default: 0,
//     },
//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//     lastSeen: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// // 2dsphere index for geospatial queries
// userSchema.index({ location: '2dsphere' });
// userSchema.index({ role: 1, isActive: 1 });

// // Hash password before save
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare passwords
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // Update lastSeen
// userSchema.methods.updateLastSeen = function () {
//   this.lastSeen = new Date();
//   return this.save({ validateBeforeSave: false });
// };

// module.exports = mongoose.model('User', userSchema);









const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    role: {
      type: String,
      enum: ['woman', 'volunteer'],
      required: [true, 'Role is required'],
    },

    avatar: {
      type: String,
      default: '',
    },

    // =========================
    // Nyckel AI Verification
    // =========================
    isWomanVerified: {
      type: Boolean,
      default: false,
    },

    verificationConfidence: {
      type: Number,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'not_required'],
      default: 'pending',
    },

    // GeoJSON Point for volunteer location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },

      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },

      address: {
        type: String,
        default: '',
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Only for volunteers
    isActive: {
      type: Boolean,
      default: false,
    },

    fcmToken: {
      type: String,
      default: '',
      select: false,
    },

    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],

    totalAlertsHelped: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

userSchema.index({ role: 1, isActive: 1 });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update lastSeen
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();

  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
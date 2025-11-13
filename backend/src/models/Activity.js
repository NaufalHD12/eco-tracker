import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Transportation', 'Food', 'Energy', 'Shopping'],
    index: true,
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  emission: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  inputData: {
    transportData: {
      distance: Number,
      vehicleType: String,
    },
    foodData: {
      weight: Number,
      foodType: String,
    },
    energyData: {
      energyConsumption: Number,
      energyType: String,
    },
    shoppingData: {
      quantity: Number,
      itemType: String,
    },
  },
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

// Indexes for better query performance
activitySchema.index({user: 1, date: -1});
activitySchema.index({user: 1, category: 1, date: -1});

// Virtual for formatted date
activitySchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Static method to get user's total emission
activitySchema.statics.getUserTotalEmission = async function(userId, startDate, endDate) {
  const match = {user: userId};
  if (startDate && endDate) {
    match.date = {$gte: startDate, $lte: endDate};
  }

  const result = await this.aggregate([
    {$match: match},
    {$group: {_id: null, totalEmission: {$sum: '$emission'}}},
  ]);

  return result.length > 0 ? result[0].totalEmission : 0;
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;

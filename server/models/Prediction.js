import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  history: [
    {
      date: {
        type: Date,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  forecast: [
    {
      date: {
        type: Date,
        required: true,
      },
      predicted: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  predictedTotalNext30: {
    type: Number,
    required: true,
    min: 0,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  recommendedReorder: {
    type: Number,
    required: true,
    min: 0,
  },
  method: {
    type: String,
    default: "moving-average-trend",
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
predictionSchema.index({ productId: 1 });
predictionSchema.index({ generatedAt: -1 });

const Prediction = mongoose.model("Prediction", predictionSchema);

export default Prediction;

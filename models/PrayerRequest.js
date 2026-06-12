import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const prayerRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    userName: {
      type: String,
      default: "Anónimo",
    },
    category: {
      type: String,
      enum: ["Salud", "Paz", "Gratitud", "Familia", "Otros"],
      default: "Otros",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    prayersCount: {
      type: Number,
      default: 0,
    },
    candlesCount: {
      type: Number,
      default: 0,
    },
    candlesExpiry: [
      {
        type: Date,
      },
    ],
    thanksText: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
prayerRequestSchema.plugin(toJSON);

export default mongoose.models.PrayerRequest || mongoose.model("PrayerRequest", prayerRequestSchema);

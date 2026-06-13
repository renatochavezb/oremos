import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const dailyStatsSchema = mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

dailyStatsSchema.plugin(toJSON);

export default mongoose.models.DailyStats ||
  mongoose.model("DailyStats", dailyStatsSchema);

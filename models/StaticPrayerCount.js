import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const staticPrayerCountSchema = mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

staticPrayerCountSchema.plugin(toJSON);

export default mongoose.models.StaticPrayerCount ||
  mongoose.model("StaticPrayerCount", staticPrayerCountSchema);

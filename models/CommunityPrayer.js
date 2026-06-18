import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const communityPrayerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "comunidad",
    },
    userName: {
      type: String,
      default: "Anónimo",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    prayersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Add plugin that converts mongoose to json
communityPrayerSchema.plugin(toJSON);

export default mongoose.models.CommunityPrayer || mongoose.model("CommunityPrayer", communityPrayerSchema);

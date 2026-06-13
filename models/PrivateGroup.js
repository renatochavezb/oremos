import mongoose from "mongoose";
import crypto from "crypto";
import toJSON from "./plugins/toJSON";

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

const privateGroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
      default: generateInviteCode,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
        },
        role: {
          type: String,
          enum: ["owner", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pendingInvites: [
      {
        email: {
          type: String,
          trim: true,
          lowercase: true,
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

privateGroupSchema.plugin(toJSON);

export default mongoose.models.PrivateGroup ||
  mongoose.model("PrivateGroup", privateGroupSchema);

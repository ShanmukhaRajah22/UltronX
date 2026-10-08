import mongoose from "mongoose";

/** Connects Mongoose to the configured MongoDB instance. */
export const connectToDb = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
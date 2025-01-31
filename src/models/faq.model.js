import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: { 
        type: String, 
        required: true 
    },
    translations: {
        type: Map,
        of: String, // Stores translations (e.g., { "hi": "हैलो", "bn": "হ্যালো" })
    }
}, {timestamps: true});

export default mongoose.model("FAQ", faqSchema);
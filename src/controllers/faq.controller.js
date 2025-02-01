import FAQ from "../models/faq.model.js";
import redisClient from "../config/redis.js";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const translateClient = new TranslateClient({ region: "ap-south-1" }); // Change region if needed
const Languages = ["hi", "bn", "fr", "es"];

const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const translations = {};

    const translationPromises = Languages.map(async (lang) => {
      const params = {
        Text: question,
        SourceLanguageCode: "en",
        TargetLanguageCode: lang,
      };

      const command = new TranslateTextCommand(params);
      const response = await translateClient.send(command);
      translations[lang] = response.TranslatedText;
    });

    await Promise.all(translationPromises);

    console.log("Languages Translated");

    const faq = new FAQ({ question, answer, translations });
    await faq.save();

    return res.status(201).json(faq);
  } catch (error) {
    console.error("Error in createFAQ:", error);
    return res.status(500).json({ message: "Unable to create FAQ", error: error.toString() });
  }
};

const getFAQs = async (req, res) => {
  try {
    const { lang } = req.query;
    const cacheKey = `faqs_${lang || "en"}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    let faqs = await FAQ.find();
    if (lang && Languages.includes(lang)) {
      faqs = faqs.map((faq) => ({
        question: faq.translations[lang] || faq.question,
        answer: faq.answer,
      }));
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(faqs));
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { 
  createFAQ, 
  getFAQs 
};

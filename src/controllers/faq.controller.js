import FAQ from "../models/faq.model.js";
import redisClient from "../config/redis.js";
import translate from "google-translate-api";

const Languages = ["hi", "bn", "fr", "es"];

const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const translations = {};

    for (const lang of Languages) {
      const translated = await translate(question, { to: lang });
      translations[lang] = translated.text;
    }

    const faq = new FAQ({ question, answer, translations });
    await faq.save();

    return res.status(201).json(faq);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
}

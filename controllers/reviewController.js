const Review = require('../models/Review');
const Groq = require('groq-sdk');

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL REVIEWS FOR A PRODUCT
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE A REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

exports.getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Fetch reviews
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res.json({ success: true, summary: "No reviews to summarize yet." });
    }

    // 2. Prepare text
    const reviewText = reviews.map((r) => r.comment).join("\n- ");

    // 3. Call Groq (Llama 3 Model - Free)
    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "system",
          "content": "Summarize the reviews in one very short sentence." 
        },
        {
          "role": "user",
          "content": reviewText
        }
      ],
      "model": "llama-3.1-8b-instant", // This is a free, fast model
      "temperature": 0.5,
      "max_tokens": 50,
    });

    const summary = chatCompletion.choices[0]?.message?.content || "No summary generated.";

    res.json({
      success: true,
      summary: summary
    });

  } catch (err) {
    console.error("Groq AI Error:", err);
    res.status(500).json({ error: "AI Service Failed", details: err.message });
  }
};
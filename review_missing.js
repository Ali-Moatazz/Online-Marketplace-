const Review = require('../models/Review');

// ... existing createReview, etc ...

exports.getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Fetch reviews
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return res.json({ summary: "No reviews to summarize." });
    }

    // 2. Combine all comments into one big paragraph
    const reviewText = reviews
      .map((r) => r.comment)
      .filter((c) => c && c.trim() !== "") // Remove empty comments
      .join(" "); // Join with spaces

    

    // 3. Call Hugging Face API (Free)
    // We use a model specifically made for summarization (BART-large-CNN)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: reviewText.substring(0, 1000), // Limit text length to avoid errors on free tier
          parameters: {
            max_length: 60, // Keep summary short
            min_length: 20,
          }
        }),
      }
    );

    const result = await response.json();

    // 4. Handle Response
    if (result.error) {
       // Fallback if API is busy (common on free tier)
       console.log("AI Busy, using fallback");
       return res.json({ 
         success: true, 
         summary: "Buyers generally have mixed feelings. (AI is currently overloading, please try again later)." 
       });
    }

    // Hugging Face returns an array: [{ summary_text: "..." }]
    const summary = result[0]?.summary_text || "Could not generate summary.";

    res.json({
      success: true,
      summary: summary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
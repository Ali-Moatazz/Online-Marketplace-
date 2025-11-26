const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name storeName');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    
    // 1. Build the database query object dynamically
    let query = {};

    // If a keyword exists, search the 'title' field (case-insensitive)
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    // If a category exists, match it exactly
    if (category) {
      query.category = category;
    }

    // 2. Find products matching the query
    const products = await Product.find(query);

    // 3. Return results
    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
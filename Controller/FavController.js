const Product = require('../Models/Product');

const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        const { email } = req.body; // Get user email from request body

        if (!email) {
            return res.status(400).json({ message: "User email is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.toggleFavorite(email);

        res.status(200).json({ message: "Favorite status updated", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { toggleFavorite };

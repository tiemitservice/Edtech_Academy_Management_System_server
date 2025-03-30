const Cart = require('../Models/Carts');
const Product = require('../Models/Product');

// Add more of an existing product to the cart or add new item
const addToCart = async (req, res) => {
    try {
        const { userId, userName, email, productId, quantity } = req.body;

        // Validate input
        if (!userId || !userName || !email || !productId || !quantity) {
            return res.status(400).json({ error: "userId, userName, email, productId, and quantity are required" });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                userName, // Ensure this is set
                email, // Ensure this is set
                items: [],
                totalPrice: 0,
            });
        }

        // Add product to cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name,
                image: product.image,
                discount: product.discount,
            });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            const discountMultiplier = 1 - (item.discount / 100 || 0); // Ensure discount is a percentage
            const itemTotal = item.price * item.quantity * discountMultiplier;
            console.log(`Item: ${item.name}, Price: ${item.price}, Quantity: ${item.quantity}, Discount: ${item.discount}, Item Total: ${itemTotal}`);
            return total + Math.max(itemTotal, 0);
        }, 0);

        // Save the updated cart
        await cart.save();

        res.status(201).json(cart);
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Error adding to cart", details: err.message });
    }
};
// Remove item or decrement quantity
const updateCartItem = async (req, res) => {
    try {
        const { userId, productId, action } = req.body;

        if (!userId || !productId || !action) {
            return res.status(400).json({ error: "userId, productId, and action are required" });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Product not found in cart" });

        // Update quantity based on action
        if (action === "increment") {
            cart.items[itemIndex].quantity += 1;
        } else if (action === "decrement" && cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        } else if (action === "remove") {
            cart.items.splice(itemIndex, 1);
        } else {
            return res.status(400).json({ error: "Invalid action or quantity too low" });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            const discountMultiplier = 1 - (item.discount / 100 || 0); // Ensure discount is applied correctly as a percentage
            return total + (item.price * item.quantity * discountMultiplier);
        }, 0);

        // // Check if all items have quantity 0, if so, delete the cart
        // const allItemsZero = cart.items.every(item => item.quantity === 0);

        // if (allItemsZero) {
        //     await Cart.deleteOne({ user: userId });
        //     return res.status(200).json({ message: "Cart is empty and has been deleted" });
        // }

        // Save the updated cart
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: "Error updating cart item", details: err.message });
    }
};



module.exports = { addToCart, updateCartItem };

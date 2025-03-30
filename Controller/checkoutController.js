const CheckOut = require('../Models/CheckOut');
const checkout = async (req, res) => {
    try {
        const { userId, cart, delivery, delivery_address, delivery_price, payment_type, userName, email } = req.body;

        if (!userId || !cart || !cart.items || cart.items.length === 0 || !delivery || !delivery_address || !delivery_price || !payment_type) {
            return res.status(400).json({ error: "All fields are required, and cart must contain items." });
        }

        // Validate cart items
        for (const item of cart.items) {
            if (!item.product || !item.price || !item.image) {
                return res.status(400).json({ error: "Each cart item must include product, price, and image." });
            }
        }


        const checkout = new CheckOut({
            user: userId,
            userName,
            email,
            cart,
            delivery,
            delivery_address,
            delivery_price,
            payment_type,
            status: false,
            date: new Date(),
        });

        const savedCheckout = await checkout.save();

        res.status(201).json({
            message: "Checkout successful",
            checkout: savedCheckout,
            finalTotal: cart.totalPrice + delivery_price,
        });
    } catch (err) {
        console.error("Error during checkout:", err);
        res.status(500).json({ error: "Error during checkout", details: err.message });
    }
};


module.exports = { checkout };

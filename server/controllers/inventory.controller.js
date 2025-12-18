const { Product, Category } = require('../models');

// --- PRODUCTS ---
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, attributes: ['name'] }],
            order: [['id', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const [updated] = await Product.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedProduct = await Product.findByPk(req.params.id);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) res.status(204).send();
        else res.status(404).json({ error: 'Product not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- CATEGORIES ---
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.destroy({
            where: { id: req.params.id }
        });
        if (deleted) res.status(204).send();
        else res.status(404).json({ error: 'Category not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

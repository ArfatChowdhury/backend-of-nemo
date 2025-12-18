const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();
  const db = client.db('nemo-ecommerce-db');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// ===========================
//        GET ALL PRODUCTS
// ===========================
app.get('/products', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    const products = await productsCollection.find().toArray();
    res.send(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Failed to fetch products' });
  }
});

// ===========================
//      GET PRODUCT BY ID
// ===========================
app.get('/products/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const id = req.params.id;

    const product = await db.collection('products').findOne({
      _id: new ObjectId(id)
    });

    res.send(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).send({ error: 'Failed to fetch product' });
  }
});

// ===========================
//        UPDATE PRODUCT
// ===========================
app.put('/products/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    const id = req.params.id;
    const updatedProduct = req.body;

    const updateDoc = {
      $set: {
        productName: updatedProduct.productName,
        price: updatedProduct.price,
        description: updatedProduct.description,
        brandName: updatedProduct.brandName,
        stock: updatedProduct.stock,
        colors: updatedProduct.colors,
        category: updatedProduct.category,
        images: updatedProduct.images,
      }
    };

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    res.send(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ error: 'Failed to update product' });
  }
});

// ===========================
//        DELETE PRODUCT
// ===========================
app.delete('/products/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();

    const id = req.params.id;

    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', result });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ===========================
//      CREATE PRODUCT
// ===========================
app.post('/products', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    const newProduct = req.body;

    const result = await productsCollection.insertOne(newProduct);
    res.send(result);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ error: 'Failed to create product' });
  }
});


// ===========================
//          ROOT
// ===========================
app.get('/', (req, res) => {
  res.send('Nemo E-commerce Server is running');
});

// Export for Vercel
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

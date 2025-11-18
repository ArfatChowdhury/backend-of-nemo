const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


const uri = process.env.MONGODB_URI;

// Connection caching for serverless
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

// Routes
app.get('/products', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productsCollection = db.collection('products');

    const cursor = productsCollection.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Failed to fetch products' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id)}
    const result = await db.collection('products').findOne(query);
    res.send(result);
  }catch (error) { 
    console.error('Error fetching product by ID:', error);
  }
})

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

app.get('/', (req, res) => {
  res.send('Nemo E-commerce Server is running');
});


if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}
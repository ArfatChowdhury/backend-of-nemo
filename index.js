const express = require('express');
const cors = require('cors');   
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient , ServerApiVersion, ObjectId} = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

    const usersCollection = client.db('nemo-ecommerce-db').collection('products');


    app.get('/products', async(req, res) =>{
        const cursor = usersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/products', async(req, res) =>{
        const newProduct = req.body;
        const result = await usersCollection.insertOne(newProduct);
        res.send(result);
    })




    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req, res) =>{
    res.send('hello')
})

app.listen(port, ()=>{
    console.log(`app running on ${port}`);
    
})
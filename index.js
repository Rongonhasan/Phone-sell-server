const express =require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');




const app = express();

// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://Phone-sell:y1NGXePuOSHrasbR@cluster0.xng2az1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(uri);
// varifytokenjtw
function verifyJWT(req, res, next) {
    console.log('token', req.headers.authorization)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')

    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}




async function run() {
    try{
        const categoryCollection = client.db('phoneCollections').collection('category')
        const usersCollection = client.db('phoneCollections').collection('users')
        const productsCollection = client.db('phoneCollections').collection('allProducts')


        
        // const verifyAdmin = async (req, res, next) => {
        //     const decodedEmail = req.decoded.email;
        //     const filter = { email: decodedEmail };
        //     const user = await usersCollection.findOne(filter);
        //     if (user?.role !== 'Admin') {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }

        //     next()
        // } 
    


        app.get('/category',async(req, res)=>{
            const query={};
            const result=await categoryCollection.find(query).toArray()
            console.log(result)
            res.send(result)
        });
        

        app.get('/category/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)};
            const result=await categoryCollection.findOne(query)
            res.send(result)
        });
        app.post('/users', async(req,res)=>{
            const user=req.body;
            const result=await usersCollection.insertOne(user);
            res.send(result)
        });
        app.post('/products',async(req,res)=>{
        
            const products=req.body;
            const result =await productsCollection.insertOne(products);
            res.send(result)
        });
       
        app.get('/products',async(req,res)=>{
            let query={};
            if(req.query.id){
                query = { categoryId: req.query?.id }
            }
            const result =await productsCollection.find(query).toArray()
            res.send(result)
        });

        app.get('/users',async(req,res)=>{
            let query={};
           
            const result =await usersCollection.find(query).toArray()
            res.send(result)
        });

        
        app.get('/jwt', verifyJWT,  async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '2h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        });
       

    }

    finally{

    }
}
run().catch(error=>console.log(error))

app.get('/', (req, res) => {
    res.send('Mobile seller is running')
})

app.listen(port, () => console.log(`Mobile sell  :${port}`))
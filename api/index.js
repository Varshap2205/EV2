const express = require('express');
const cors = require('cors');
const app = express();
const mongoose =require('mongoose')
const User=require('./models/User')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const multer=require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs=require('fs');
const Post=require('./models/Post')

const salt=bcrypt.genSaltSync(10);
const secret='abcd1234hbfvieurygwu'

// Middleware to parse JSON request body
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json()); // This will allow Express to parse JSON bodies
app.use(cookieParser())
app.use('/uploads',express.static(__dirname+'/uploads'));

mongoose.connect('mongodb+srv://varshap2205:qeVreyNdqUlcsVhu@cluster0.bktea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
// Route handling
app.post('/register', async(req, res) => {
    const { username, password } = req.body;  // Extract the username and password from the request body
    try{
        const userDoc=await User.create(
            {
                username,
                password:bcrypt.hashSync(password,salt)
            }
        )
        // console.log("Received:", username, password);  // Log the data to the server console
        res.json(userDoc);
    }
    catch(e){
        res.status(400).json(e);
    }
});

app.post("/login",async(req,res)=>{
    const{username,password}=req.body;
    const userDoc=await User.findOne({username});
    const passOk=bcrypt.compareSync(password,userDoc.password)
    if(passOk){
        //logged in
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username,
            });
        })
    }
    else{
        res.status(400).json({message:"Invalid username or password"})
    }


})

app.get('/profile',(req,res)=>{
    const {token}=req.cookies;
    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw err;
        // console.log(info);
        res.json(info)
    })

})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    
    fs.renameSync(path, newPath);
    
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id,
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error handling /post route:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/post',async(req,res)=>{
    const posts=await Post.find().populate('author',['username'])
    .sort({createdAt:-1}).limit(20);
    res.json(posts);
    
})

// app.get('/post/:id',async(req,res)=>{
//         const {id}=req.params;
//         const postDoc=await Post.findById(id).populate('author',['username']);
//         res.json(postDoc)
// })
// Check if the passed ID is a valid ObjectId
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const post = await Post.findById(id).populate('author',['username']);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/post', uploadMiddleware.single('file'),async (req,res)=>{
    let newPath=null;
    if(req.file){
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
    }

    const {token}=req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        const {id,title, summary, content } = req.body;
        const postDoc=await Post.findById(id)
        // const postDoc = await Post.create({
        //   title,
        //   summary,
        //   content,
        //   cover: newPath,
        //   author: info.id,
        // });
        res.json(postDoc);
      });
})
// Start the server
app.listen(4000, () => {
    console.log('Server running on port 4000');
})

//password:qeVreyNdqUlcsVhu
//mongodb+srv://varshap2205:qeVreyNdqUlcsVhu@cluster0.bktea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
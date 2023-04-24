const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require("ejs");
const _ = require("lodash");
const { sign } = require('crypto')

const app = express();
mongoose.connect('mongodb+srv://jonalsuthar347:Jonal1234@anymusicdb.445iitv.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.render('pages/index')
})

app.get('/signup',function(req,res){
    res.render('pages/signup')
})

app.get('/login',function(req,res){
    res.render('pages/login')
})

app.get('/library',function(req,res){
  res.render('pages/library');
})

app.get('/song',function(req,res){
  res.render('pages/song')
})

app.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({ fullname, email, password });
    await newUser.save();

    res.render('pages/login');
  } catch (err) {
    console.error('Failed to create user:', err);
    return res.status(500).json({ message: 'Failed to create user' });
  }
});

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
      
    }

    res.render('pages/index');
  } catch (err) {
    console.error('Failed to authenticate user:', err);
    return res.status(500).json({ message: 'Failed to authenticate user' });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));

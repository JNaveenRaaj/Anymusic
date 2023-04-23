const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const _ = require("lodash");
const { sign } = require('crypto')
const fs = require("fs");

const app = express();

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

app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "bigbuck.mp4";
  const videoSize = fs.statSync("bigbuck.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

const port = 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));

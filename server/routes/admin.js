const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


/*
   Check Login
*/

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if(!token) {
    res.status(401).json({ message: 'Unauthorized' });
  } else {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}


/*
 GET
 Post: Id
*/

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin Panel",
      description: "Simple blog created with NodeJS, Express and MongoDB",
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/*
 POST
 Admin: Check Login
*/

router.post("/admin", async (req, res) => {
  try {

    const {username, password} = req.body;
    
    const user = await User.findOne( {username} );

    if(!user) {
      return res.status(401).json( {message: 'Invalid credentials'} );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( {message: 'Invalid credentials'} );
    }

    const token = jwt.sign({userId: user._id}, jwtSecret);
    res.cookie('token', token, {httpOnly: true});
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});

/*
 GET
 Admin: Dashboard
*/

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: "Simple blog created with NodeJS, Express and MongoDB"
    }

    const data = await Post.find();
    res.render('admin/dashboard', {locals, data, layout: adminLayout});
  } catch(error) {
    console.log(error);
  }
});

/*
 GET
 Admin: Create new post
*/

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: "Simple blog created with NodeJS, Express and MongoDB"
    }

    res.render('admin/add-post', {locals, layout: adminLayout});
  } catch(error) {
    console.log(error);
  }
});

/*
 POST
 Admin: Create new post
*/

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const {title, body} = req.body;
    await Post.create({ title, body });
    res.redirect('/dashboard');
  } catch(error) {
    console.log(error);
  }
});

/*
 GET
 Admin: Edit post
*/

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: "Simple blog created with NodeJS, Express and MongoDB"
    }

    const data = await Post.findOne({_id: req.params.id});
    res.render('admin/edit-post', {locals, data, layout: adminLayout});
  } catch(error) {
    console.log(error);
  }
});

/*
 PUT
 Admin: Edit post
*/

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    })

    // res.redirect(`/edit-post/${req.params.id}`);
    res.redirect(`/dashboard`);
  } catch(error) {
    console.log(error);
  }
});

/*
 DELETE
 Admin: Delete Post
*/

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch(error) {
    console.log(error);
  }
});

/*
 GET
 Admin: Logout
*/

router.get("/logout", authMiddleware, async (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
})

// router.post("/admin", async (req, res) => {
//   try {

//     const {username, password} = req.body;
    
//     if(req.body.username === "admin" && req.body.password === "password") {
//       res.send("Logged in");
//     } else {
//       res.send("Wrong credentials");
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });

/*
 POST
 Admin: Register
*/

router.post("/register", async (req, res) => {
  try {

    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({username, password: hashedPassword});
      res.status(201).json({message: 'User created', user});
    } catch(error) {
      if(error.code === 11000) {
        res.status(409).json({message: 'User already in use'});
      }
      res.status(500).json({message: 'Error creating user'});
    }
    

  } catch (error) {
    console.log(error);
  }
});


module.exports = router;

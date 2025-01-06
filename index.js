const express = require('express');
const app = express();

//JWT
const jwt = require('jsonwebtoken');

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "superS#cr3t1";


// Admin routes
const generateJwt = (user) => {
  const payload = {username: user.username};
  return jwt.sign(payload, secretKey, {expire: '1h'});
}
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(a => a.username===admin.username);
  if(existingAdmin){
    res.status(403).json({message: "Admin already exists"});
  }
  else{
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.status(200).json({message: "Admin created successfully"});
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const {username, password} = req.headers;
  const admin = ADMINS.find(a => a.username===username && a.password===password);

  if(admin){
   const token = generateJwt(admin);
   res.json(200).json({message: "Admin Login successful"}); 
  }
  else{
    res.status(403).json({message: "Not found"})
  }
});

//Middleware to authenticate the admin
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if(authHeader){
    const token = authHeader.split('')[1];

    jwt.verify(token, secretKey, (err, user) => {
      if(err) throw err;
      req.user = user;
      next();
    })
  }
}

app.post('/admin/courses', authenticateJwt, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id=COURSES.length+1;
  COURSES.push(course);
  res.json({message: "course created successfully"});
});

app.put('/admin/courses/:courseId', authenticateJwt, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);

  const courseIdx = COURSES.find(a => a.id===courseId);

  if(courseIdx>-1){
    const updateCourse = {...COURSES[courseId], ...req.body};
    COURSES[courseIdx] = updateCourse;
    res.json({Message: "Course updated successfully"});
  }
});

app.get('/admin/courses', authenticateJwt, (req, res) => {
  // logic to get all courses
  res.json({courses: COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = req.body;
  const existingUser = USERS.find(a => a.username===user.username);
  if(existingUser){
    res.status(403).json({message: "user already exists"});
  }
  else{
    USERS.push(user);
    const token = generateJwt(user);
    res.status(200).json({message: "User created successfully"});
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const {username, password} = req.headers;
  const user = USERS.find(a => a.username===username && a.password===password);

  if(user){
   const token = generateJwt(user);
   res.json(200).json({message: "User Login successful"}); 
  }
  else{
    res.status(403).json({message: "Not found"})
  }
});

app.get('/users/courses', authenticateJwt, (req, res) => {
  // logic to list all courses
 res.json({courses: COURSES});
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(a => a.id===courseId);

  if(course){
    const user = USERS.find(a=> a.username===req.user.username);
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({message: "course purchased successfully"});
    }
  }
});

app.get('/users/purchasedCourses', authenticateJwt,  (req, res) => {
  // logic to view purchased courses
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

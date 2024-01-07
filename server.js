const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// MongoDB setup (replace 'your_database_url' with your MongoDB connection string)
mongoose.connect('mongodb+srv://bharani7:9790221708@cluster0.xcw7y7f.mongodb.net/store', { useNewUrlParser: true, useUnifiedTopology: true });

// Express setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'ABC123', resave: true, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport setup (replace 'User' with your user model)
const User = require('./Models/user'); // You need to define the User model

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routing for login and register pages
app.get('/', (req, res) => {
    
      res.sendFile(__dirname + '/public/login.html');
    
  });

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/index', // Redirect to the chat page (index.html) on successful login
    failureRedirect: '/login',
    failureFlash: true
}));


app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const newUser = new User({ username });
    User.register(newUser, password, (err, user) => {
        if (err) {
            console.error(err);
            req.flash('error', 'Registration failed.'); // Set flash message on registration failure
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Registration successful. You can now log in.'); // Set flash message on successful registration
            res.redirect('/login');
        });
    });
});

// Serve the index.html page as the chat page
app.get('/index', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.redirect('/login');
    }
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('typing', () => {
        io.emit('typing', { username: socket.username });
    });

    socket.on('stopTyping', () => {
        io.emit('stopTyping', { username: socket.username });
    });

    // Handle chat messages here
    socket.on('message', (message) => {
        io.emit('message', { username: socket.username, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Handle user disconnection here
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

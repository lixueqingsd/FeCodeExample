const express = require('express')

// creating an express instance
const app = express()

const bodyParser = require('body-parser')
const passport = require('passport')

// getting the local authentication type
const LocalStrategy = require('passport-local').Strategy

const publicRoot = 'D:\\vscode\\FeCodeExample\\vue-sample\\dist'
app.use(express.static(publicRoot))

app.use(bodyParser.json())

// cookei session
const cookieSession = require('cookie-session')
app.use(cookieSession({
    name: 'mysession',
    keys: ['vueauthrandomkey'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours 
  }))

// use redis session
const redis = require('redis')
const session = require('express-session')
 
let RedisStore = require('connect-redis')(session)
let client = redis.createClient()
 
app.use(
  session({
    store: new RedisStore({ client }),
    secret: 'Redis Secret Here',
    resave: false,
  })
)

app.use(passport.initialize());
app.use(passport.session());

let users = [
    {
        id: 1,
        name: "Jude",
        email: "user@email.com",
        password: "password"
    },
    {
        id: 2,
        name: "Emma",
        email: "emma@email.com",
        password: "password2"
    },
]

app.get("/", (req, res, next) => {
  res.sendFile("index.html", { root: publicRoot })
})

app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        
        if (!user) {
            return res.status(400).send([user, "Cannot log in", info])
        }

        req.login(user, (err) => {
            res.send("Logged in")
        })
    })(req, res, next)
})

app.get('/api/logout', function(req, res){
    req.logout();
    console.log("logged out")
    return res.send();
});

const authMiddleware = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.status(401).send('You are not authenticated')
    } else {
        return next()
    }
}

app.get("/api/user", authMiddleware, (req, res) => {
    let user = users.find((user) => {
        return user.id === req.session.passport.user
    })
    console.log([user, req.session])
    res.send({user: user})
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, 
  (username, password, done) => {
      let user = users.find((user) => {
          return user.email === username && user.password === password
      })
      
      if (user) {
          done(null, user)
      } else {
          done(null, false, {message: 'Incorrect username or password'})
      }
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  let user = users.find((user) => {
      return user.id === id
  })

  done(null, user)
})

app.listen(3000, () => {
  console.log("Example app listening on port 3000")
})

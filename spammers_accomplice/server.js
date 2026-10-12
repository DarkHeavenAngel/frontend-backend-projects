const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'twig');
app.set('views', '.');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    lastName: String,
    firstName: String,
    patronymic: String,
    email: String
}, {versionKey: false});
const User = mongoose.model('User', userSchema);

const dbUrl = 'mongodb://localhost:27017/spammerdb';
mongoose.connect(dbUrl) 
.then(() => {
    app.listen(8000, function() {
        console.log('Server is running on port 8000');
    });
})
.catch(err => console.log(err));

app.get('/', async function(req, res) {
    console.log("Request received for main page");
    try {
        const items = await User.find({}).sort({ lastName: 1 });
        res.render('index.twig', { users: items });
    } catch (err) {
        console.log(err);
    }
});

app.post('/add', async function(req, res) {
    console.log("Request received for adding user");
    
    const user = new User({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        patronymic: req.body.patronymic,
        email: req.body.email
    });

    try {
        await user.save();
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
});

app.post('/delete/:id', async function(req, res) {
    console.log("Request received for deleting user with ID:", req.params.id);
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
});

app.post('/send', async function(req, res) {
    console.log("Request received for sending email");

    let messageText = "";
    if (req.body.template === "promo") {
        messageText = "Повідомляємо вам про знижки!";
    } else if (req.body.template === "news") {
        messageText = "Спеціальні пропозиції для вас!";
    } else {
        messageText = req.body.customText;
    }

    try {
        const users = await User.find({});
        if (users.length === 0) {
            return res.send("There are no users to send emails to.");
        }

        const emails = users.map(user => user.email).join(", ");

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "your_email@gmail.com",
                pass: "your_app_password"
            }
        });

        let result = await transporter.sendMail({
            from: '"Name" <your_email@example.com>',
            to: emails,
            subject: "Important Message",
            text: messageText
        });

        console.log("Email has been sent:", result.messageId);
        res.redirect('/');
    } catch (err) {
        console.log("Error sending email:", err);
        res.send("Error appeared while sending email.");
    }
});


const express = require('express');
const bcrypt = require('bcryptjs');
var cors = require('cors');
const { createJWT, authenticate } = require('./auth')
const mongodb = require('mongodb');
const nodemailer = require('nodemailer');
const mongoClient = mongodb.MongoClient;
const dbURL = 'mongodb+srv://pavankumarkrn:kris770297@cluster0.l3mwo.mongodb.net/HallBooking?retryWrites=true&w=majority'

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

app.get('/pizzas', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('pizzadeliveryapp');
        let pizzas = await db.collection('pizzas').find().toArray();
        let veggies = await db.collection('veggies').find().toArray();
        let sauce = await db.collection('sauce').find().toArray();
        let meat = await db.collection('meat').find().toArray();
        let base = await db.collection('base').find().toArray();
        let cheese = await db.collection('cheese').find().toArray();
        res.json({
            pizzas,
            veggies,
            sauce,
            meat,
            base,
            cheese
        });
    } catch (error) {
        console.log(error);
        res.end(error);
    }
});

app.post('/adminlogin', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('pizzadeliveryapp');
        const admin = req.body;
        const customerEmail = admin.email;
        console.log(customerEmail + "dsadsad")
        let customer = await db.collection('admin').findOne({ email: customerEmail }, {});
        console.log(customer + 'yes')
        if (customer !== null) {
            if ((admin.email === customer.email) && (admin.password === customer.password)) {
                console.log('successful')
                res.json({
                    message: 'success',
                    code: 2,
                    user: customer
                })
            }
        } else {
            res.json({
                message: 'admin not found',
                code: 0
            })
        }

    } catch (error) {
        res.json({
            message: 'Login Failed',
            code: 0
        })

    }
});

app.post('/adminsignup', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('pizzadeliveryapp');
        const admin = req.body;
        const customerEmail = admin.email;
        console.log(customerEmail + "dsadsad")
        let customer = await db.collection('admin').findOne({ email: customerEmail }, {});
        console.log(customer + 'yes')
        if (customer !== null) {
            res.json({
                message: 'email already exists',
                code: 0
            })
        } else {
            db.collection('admin').insertOne(req.body);
            res.json({
                message: 'success',
                code: 2
            })
        }

    } catch (error) {
        res.json({
            message: 'SignUp Failed',
            code: 0
        })

    }
})

app.get("/rooms", async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('HallBooking');
        let rooms = await db.collection('Rooms').find().toArray();
        res.json(rooms);
    } catch (error) {
        res.end(error);
    }
});

app.post('/signUp', async (req, res) => {
    let user = { ...req.body };
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('PasswordCheckingApp');
        let exUser = await db.collection('users').findOne({ email: user.email }, {});
        console.log(exUser);
        if (exUser === null) {
            let salt = await bcrypt.genSalt(10);
            console.log(user.password)
            let hash = await bcrypt.hash(user.password, salt);
            user.password = hash;
            console.log(user)
            await db.collection('users').insertOne(user);
            res.json({
                message: 'SignUp successful'
            })

        } else {
            res.json({
                message: 'Email Id already exists'
            })
        }
    } catch (error) {
        console.log(error)
        res.json({
            message: 'SignUp failed'
        })
    }
});

app.post('/login', async (req, res) => {
    let user = { ...req.body };
    console.log(user)
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('PasswordCheckingApp');
        let usr = await db.collection('users').findOne({ email: user.email }, {});
        console.log(usr);
        if (usr) {
            let result = await bcrypt.compare(user.password, usr.password);
            if (result) {
                const token = await createJWT({ id: usr._id });
                console.log(token)
                res.json({
                    message: 'Login Successful',
                    code: 'green',
                    token,
                    user: usr
                })
            } else {
                res.json({
                    message: 'Wrong Password',
                    code: "red"
                })
            }
        } else {
            res.json({
                message: 'Invalid Credentials',
                code: 'red'
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            message: 'Login Failed'
        })

    }
});

app.get('/users', authenticate, async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('PasswordCheckingApp');
        let users = await db.collection('users').find().toArray();
        res.json({
            message: 'users fetched',
            code: 'green',
            users
        })
    } catch (error) {
        res.json({
            message: 'Fetching users failed',
            code: 'red'
        })

    }
});

app.post('/forgotPassword', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('PasswordCheckingApp');
        let usr = await db.collection('users').findOne({ email: req.body.email }, {});
        console.log(usr)
        if (usr !== null) {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            usr.password = hash;
            await db.collection('users').update({ _id: usr._id }, usr);
            res.json({
                message: 'Password updated successfully',
                code: 'green'
            })

        } else {
            res.json({
                message: 'User not found',
                code: 'red'
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            message: 'Process Failed',
            code: 'red'
        })

    }
});

app.post('/checkEmail', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('PasswordCheckingApp');
        let usr = await db.collection('users').findOne({ email: req.body.email }, {});
        if (usr === null) {
            res.json({
                message: 'No user found',
                code: 'red'
            })
        } else {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'krishna49m@gmail.com',
                    pass: '949362974996'
                }
            })
            const otp = Math.floor(100000 + Math.random() * 900000)
            let mailOptions = {
                from: 'krishna49m@gmail.com',
                to: usr.email,
                subject: 'OTP',
                text: '' + otp
            }

            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    console.log(err);
                    res.json({
                        message: 'Process Failed',
                        code: 'red'
                    })
                } else {
                    res.json({
                        message: 'OTP sent successfully',
                        code: 'green',
                        otp,
                        email: usr.email
                    })
                }
            })
        }
    } catch (error) {
        console.log(error);
        res.json({
            message: 'Process Failed',
            code: 'red'
        })
    }
})

app.post('/rooms/:roomId/:date/:slot', async (req, res) => {
    try {
        const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        let db = client.db('HallBooking');
        let d = +req.params.date;
        let s = +req.params.slot;
        const ct = req.body
        const customerEmail = ct.email;
        console.log(customerEmail + "dsadsad")
        let customer = await db.collection('Customers').findOne({ email: customerEmail }, {});
        console.log(customer);
        if (customer !== null && customer.email !== '') {
            res.json({
                message: 'EmailId already exists',
                code: 2
            })
        } else {
            let room = await db.collection('Rooms').findOne({ room: +req.params.roomId }, {});
            if (room.status !== 'Booked') {
                if (room.dates[d].status !== 'Booked') {
                    if (room.dates[d].slots[s].status !== 'Booked') {
                        room.dates[d].slots[s].status = 'Booked';
                        const sl = room.dates[d].slots
                        const slotCount = sl.reduce((a, b) => {
                            return ((b.status === 'Booked') ? a + 1 : a + 0)
                        }, 0);
                        if (slotCount === 3) { room.dates[d].status = 'Booked'; }
                    }
                    const dt = room.dates
                    const dateCount = dt.reduce((a, b) => {
                        return ((b.status === 'Booked') ? a + 1 : a + 0)
                    }, 0);
                    if (dateCount === 3) room.status = 'Booked'
                }
                await db.collection('Customers').insertOne(req.body);
                room.customers.push(req.body);
                await db.collection('Rooms').update({ room: +req.params.roomId }, room);
                res.json({
                    message: 'Booking successful',
                    code: 1
                })
            } else {
                res.json({
                    message: 'Booking failed',
                    code: 3
                })
            }

        }


    } catch (error) {
        res.json({
            message: 'booking failed'
        })
    }
})

app.get("/", (req, res) => {
    res.end('hi')
});

app.listen(port, () => {
    console.log(`port open ${port}`)
})

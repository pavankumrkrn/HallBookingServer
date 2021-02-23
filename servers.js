
const express = require('express');
var cors = require('cors')
const mongodb = require('mongodb');
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
    user['emailVerified'] = false
    user['address'] = '';
    user['orders'] = [];
    console.log(user)
    try {
        // const client = await mongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
        // let db = client.db('pizzadeliveryapp');

    } catch (error) {

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

const Pusher = require('pusher')
const credentials = require('./cred')
const africastalking = require('africastalking')(credentials.AT)
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const pusher = new Pusher(credentials.pusher)
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

// Serve home page and static files
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"))
})
app.use(express.static(__dirname + '/'))

//configure AT
let webURL = 'http://meltwatercanteen.com/menu'
let welcomeMsg = `CON Hello and welcome to the Meltwater Canteen.
Have your food delivered to you fast and hot!
Please find our menu ${webURL}
Enter your name to continue`

let orderDetails = {
  name: "",
  description: "",
  address: "",
  telephone: "",
  open: true
}
let lastData = "";

app.post('/order', function (req, res) {
  console.log(req.body);
  let message = 'Hello'

  let sessionId = req.body.sessionId
  let serviceCode = req.body.serviceCode
  let phoneNumber = req.body.phoneNumber
  let text = req.body.text
  let textValue = text.split('*').length

  if (text === '') {
    message = welcomeMsg
  } else if (textValue === 1) {
    message = "CON What do you want to eat?"
    orderDetails.name = text;
  } else if (textValue === 2) {
    message = "CON Where do we deliver it?"
    orderDetails.description = text.split('*')[1];
  } else if (textValue === 3) {
    message = "CON What's your telephone number?"
    orderDetails.address = text.split('*')[2];
  } else if (textValue === 4) {
    message = `CON Would you like to place this order?
        1. Yes
        2. No`
    lastData = text.split('*')[3];
  } else {
    message = `END Thanks for your order
        Enjoy your meal in advance`
    orderDetails.telephone = lastData
  }

  res.contentType('text/plain');
  res.send(message, 200);

  console.log(orderDetails)
  if (orderDetails.name != "" && orderDetails.address != '' && orderDetails.description != '' && orderDetails.telephone != '') {
    pusher.trigger('orders', 'customerOrder', orderDetails)
  }
  if (orderDetails.telephone != '') {
    //reset data
    orderDetails.name = ""
    orderDetails.description = ""
    orderDetails.address = ""
    orderDetails.telephone = ""
  }

})
//listen on port
app.listen(port, function (err, res) {
  if (err) throw err
  console.log("Kaboom..Order you food Now " + port)
})
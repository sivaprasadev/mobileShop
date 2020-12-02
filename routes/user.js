var express = require('express');
const { response, render } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const commaNumber = require('comma-number');
const { route } = require('./admin');
const { body, validationResult } = require('express-validator');
const { reject } = require('bcrypt/promises');
//Verify middleware
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', verifyLogin, async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount })
  })

});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    //console.log(response);
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid user credentials, Try again !"
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {

  let emptyCart

  cartCount = await userHelpers.getCartCount(req.session.user._id)

  if (cartCount == 0) {
    emptyCart = true
  }
  let Msg = "Your cart is empty "

  let products = await userHelpers.getCartProducts(req.session.user._id)

  let total = 0
  if (products.length > 0) {
    total = commaNumber(await userHelpers.getTotalAmount(req.session.user._id))
  }
  res.render('user/cart', { products, user: req.session.user, total, emptyCart, Msg })
})
router.get('/add-to-cart/:id', (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {

  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    commaNumber(await userHelpers.getTotalAmount(req.body.user).then((total) => {
      response.total = total
      res.json(response)
    }))
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = commaNumber(await userHelpers.getTotalAmount(req.session.user._id))
  res.render('user/place-order', { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }
  })
})

router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})

router.get('/orders', async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})

router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  //console.log(products);
  res.render('user/view-order-products', { user: req.session.user, products })
})

router.post('/verify-payment', (req, res) => {
  //console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})

router.get('/lpage', (req, res) => {
  res.render('user/sampleLandingPage', { layout: 'landing.hbs' })
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  //console.log("productId"+proId)
  userHelpers.deleteCartProduct(proId).then((response) => {
    res.redirect('/cart')
  })
})

router.get('/test', (req, res) => {
  res.render('user/test')
})

router.post('/test',

  [
    //pincode must be 5 digits long
    body('pincode').isLength({ min: 5 }),
    //mobile number should be in 10 digits
    body('mobile').isLength({ min: 10 })
  ],

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation error");
      //return res.status(400).json({ errors: errors.array() });
      res.render('user/test', { errors: errors.array() })
    } else {
      console.log("Validation successfull");
    }
  })

module.exports = router;

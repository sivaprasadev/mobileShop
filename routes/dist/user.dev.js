"use strict";

var express = require('express');

var _require = require('../app'),
    response = _require.response;

var router = express.Router();

var productHelpers = require('../helpers/product-helpers');

var userHelpers = require('../helpers/user-helpers');

var commaNumber = require('comma-number'); //Here we using middile to verify login


var verifyLogin = function verifyLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
};
/* GET home page. */


router.get('/', function _callee(req, res, next) {
  var user, cartCount;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          user = req.session.user; //console.log(user);

          cartCount = null;

          if (!req.session.user) {
            _context.next = 6;
            break;
          }

          _context.next = 5;
          return regeneratorRuntime.awrap(userHelpers.getCartCount(req.session.user._id));

        case 5:
          cartCount = _context.sent;

        case 6:
          productHelpers.getAllProducts().then(function (products) {
            res.render('user/view-products', {
              products: products,
              user: user,
              cartCount: cartCount
            });
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.get('/login', function (req, res) {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/login', {
      "loginErr": req.session.loginErr
    });
    req.session.loginErr = false;
  }
});
router.get('/signup', function (req, res) {
  res.render('user/signup');
});
router.post('/signup', function (req, res) {
  userHelpers.doSignup(req.body).then(function (response) {
    //console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/');
  });
});
router.post('/login', function (req, res) {
  userHelpers.doLogin(req.body).then(function (response) {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginErr = "Invalid user credentials";
      res.redirect('/login');
    }
  });
});
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});
router.get('/cart', verifyLogin, function _callee2(req, res) {
  var products, total;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(userHelpers.getCartProducts(req.session.user._id));

        case 2:
          products = _context2.sent;
          _context2.t0 = commaNumber;
          _context2.next = 6;
          return regeneratorRuntime.awrap(userHelpers.getTotalAmount(req.session.user._id));

        case 6:
          _context2.t1 = _context2.sent;
          total = (0, _context2.t0)(_context2.t1);
          //console.log(products)
          res.render('user/cart', {
            products: products,
            user: req.session.user,
            total: total
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});
router.get('/add-to-cart/:id', function (req, res) {
  //console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(function () {
    //res.redirect('/')
    res.json({
      status: true
    });
  });
});
router.post('/change-product-quantity', function (req, res, next) {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(function (response) {
    res.json(response);
  });
});
router.get('/place-order', verifyLogin, function _callee3(req, res) {
  var total;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.t0 = commaNumber;
          _context3.next = 3;
          return regeneratorRuntime.awrap(userHelpers.getTotalAmount(req.session.user._id));

        case 3:
          _context3.t1 = _context3.sent;
          total = (0, _context3.t0)(_context3.t1);
          res.render('user/place-order', {
            total: total
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});
module.exports = router;
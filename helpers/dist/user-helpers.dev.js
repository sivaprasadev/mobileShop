"use strict";

var db = require('../config/connection');

var collection = require('../config/collections');

var bcrypt = require('bcrypt');

var _require = require('bcrypt/promises'),
    promise = _require.promise;

var _require2 = require('../app'),
    response = _require2.response;

var objectId = require('mongodb').ObjectID;

module.exports = {
  doSignup: function doSignup(userData) {
    return new Promise(function _callee(resolve, reject) {
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(bcrypt.hash(userData.Password, 10));

            case 2:
              userData.Password = _context.sent;
              db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(function (data) {
                //console.log(data)
                resolve(data.ops[0]);
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      });
    });
  },
  doLogin: function doLogin(userData) {
    return new Promise(function _callee2(resolve, reject) {
      var loginStatus, response, user;
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              loginStatus = false;
              response = {};
              _context2.next = 4;
              return regeneratorRuntime.awrap(db.get().collection(collection.USER_COLLECTION).findOne({
                Email: userData.Email
              }));

            case 4:
              user = _context2.sent;

              if (user) {
                bcrypt.compare(userData.Password, user.Password).then(function (status) {
                  if (status) {
                    console.log("login success");
                    response.user = user;
                    response.status = true;
                    resolve(response);
                  } else {
                    console.log("login failed");
                    resolve({
                      status: false
                    });
                  }
                });
              } else {
                console.log("login failed");
                resolve({
                  status: false
                });
              }

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      });
    });
  },
  addToCart: function addToCart(proId, userId) {
    proObj = {
      item: objectId(proId),
      quantity: 1
    };
    return new Promise(function _callee3(resolve, reject) {
      var userCart, proExist, cartObj;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(db.get().collection(collection.CART_COLLECTION).findOne({
                user: objectId(userId)
              }));

            case 2:
              userCart = _context3.sent;

              if (userCart) {
                proExist = userCart.products.findIndex(function (product) {
                  return product.item == proId;
                });
                console.log(proExist);

                if (proExist != -1) {
                  db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: objectId(userId),
                    'products.item': objectId(proId)
                  }, {
                    $inc: {
                      'products.$.quantity': 1
                    }
                  }).then(function () {
                    resolve();
                  });
                } else {
                  db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: objectId(userId)
                  }, {
                    $push: {
                      products: proObj
                    }
                  }).then(function (response) {
                    resolve();
                  });
                }
              } else {
                cartObj = {
                  user: objectId(userId),
                  products: [proObj]
                };
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(function (response) {
                  resolve();
                });
              }

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
  },
  getCartProducts: function getCartProducts(userId) {
    return new Promise(function _callee4(resolve, reject) {
      var cartItems;
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match: {
                  user: objectId(userId)
                }
              }, {
                $unwind: '$products'
              }, {
                $project: {
                  item: '$products.item',
                  quantity: '$products.quantity'
                }
              }, {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
                }
              }, {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $arrayElemAt: ['$product', 0]
                  }
                }
              }
              /*{
                  $lookup: {
                      from: collection.PRODUCT_COLLECTION,
                      let: { prodList: '$products' },
                      pipeline: [
                          {
                              $match: {
                                  $expr: {
                                      $in: ['$_id', "$$prodList"]
                                  }
                              }
                          }
                      ],
                      as: 'cartItems'
                  }
              }*/
              ]).toArray());

            case 2:
              cartItems = _context4.sent;
              //console.log(cartItems[0].products);
              resolve(cartItems); //console.log(cartItems);

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      });
    });
  },
  getCartCount: function getCartCount(userId) {
    return new Promise(function _callee5(resolve, reject) {
      var count, cart;
      return regeneratorRuntime.async(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              count = 0;
              _context5.next = 3;
              return regeneratorRuntime.awrap(db.get().collection(collection.CART_COLLECTION).findOne({
                user: objectId(userId)
              }));

            case 3:
              cart = _context5.sent;

              if (cart) {
                count = cart.products.length;
              }

              resolve(count);

            case 6:
            case "end":
              return _context5.stop();
          }
        }
      });
    });
  },
  changeProductQuantity: function changeProductQuantity(details) {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);
    return new Promise(function (resolve, reject) {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION).updateOne({
          _id: objectId(details.cart)
        }, {
          $pull: {
            products: {
              item: objectId(details.product)
            }
          }
        }).then(function (response) {
          resolve({
            removeProduct: true
          });
        });
      } else {
        db.get().collection(collection.CART_COLLECTION).updateOne({
          _id: objectId(details.cart),
          'products.item': objectId(details.product)
        }, {
          $inc: {
            'products.$.quantity': details.count
          }
        }).then(function (response) {
          resolve(true);
        });
      }
    });
  },
  getTotalAmount: function getTotalAmount(userId) {
    return new Promise(function _callee6(resolve, reject) {
      var total;
      return regeneratorRuntime.async(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match: {
                  user: objectId(userId)
                }
              }, {
                $unwind: '$products'
              }, {
                $project: {
                  item: '$products.item',
                  quantity: '$products.quantity'
                }
              }, {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
                }
              }, {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $arrayElemAt: ['$product', 0]
                  }
                }
              }, {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ['$quantity', {
                        $toInt: '$product.Price'
                      }]
                    }
                  }
                }
              }]).toArray());

            case 2:
              total = _context6.sent;
              console.log(total[0].total);
              resolve(total[0].total);

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      });
    });
  }
};
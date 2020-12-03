const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const { route } = require('./user');
var router = express.Router();
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}
router.get('/', verifyLogin, function (req, res, next) {
  let ad = req.session.ad
  productHelpers.getAllProducts().then((products) => {
    //console.log(products);
    res.render('admin/view-products', { admin: true, products, ad })
  })
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { admin: true, "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }

})

router.post('/login', (req, res) => {
  userHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.ad = response.admin
      res.redirect('/admin')
    } else {
      req.session.loginErr = "Invalid credentials"
      res.redirect('/admin/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login')
})

router.get('/add-product', verifyLogin, function (req, res) {
  let ad = req.session.ad
  res.render('admin/add-product', { admin: true, ad })
})

router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image
    console.log(id)
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        let ad = req.session.ad
        res.render("admin/add-product",{admin:true,ad})
      } else {
        console.log(err);
      }
    })
  })
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let ad = req.session.ad
  let product = await productHelpers.getAllProductDetails(req.params.id)
  res.render('admin/edit-product', { product, admin: true, ad })

})

router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {

      let image = req.files.Image

      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})


module.exports = router;

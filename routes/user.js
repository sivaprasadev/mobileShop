var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let products = [
    {
      name : "iphone 12",
      category : "Mobile",
      description :"Newly Lauched",
      image :"data:image/jpeg;base64,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" 
    },
    {
      name : "OnePlus 7T",
      category : "Mobile",
      description :"Newly Lauched",
      image :"data:image/jpeg;base64,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" 
    },
    {
      name : "Samsung a50",
      category : "Mobile",
      description :"Newly Lauched",
      image :"data:image/jpeg;base64,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" 
    },
    {
      name : "LG wing",
      category : "Mobile",
      description :"Newly Lauched",
      image :"data:image/jpeg;base64,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" 
    }
  ]

  res.render('index', {products,admin:false});
});

module.exports = router;

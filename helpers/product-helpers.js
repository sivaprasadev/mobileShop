var db=require('../config/connection')
var collection = require('../config/collections')
const { reject } = require('bcrypt/promises')
const { ObjectID } = require('mongodb')
const { response } = require('../app')
var objectId=require('mongodb').ObjectID
module.exports={
    addProduct:(product,callback)=>{
        console.log(product)
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })

        /*addProduct is used for admin to add new products*/
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().
            toArray()
            //console.log(products);
            resolve(products)
        })

        /*getAllProducts used to display all products added by admin*/
    },

    

    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        }) 
    },

    getAllProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },

    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).
            updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Category:proDetails.Category,
                    Price:proDetails.Price
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    }
}
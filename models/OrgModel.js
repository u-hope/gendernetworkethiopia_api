// Importing necessary modules
const mongoose = require('mongoose');
var crypto = require("crypto");
const {v4: uuidv4} =  require('uuid');

//Defining the User Schema
const orgSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 30,
            minLength: 2,
        },
        email: {
            type: String,
            trim: true, 
            required: true,
            unique: true
        },
        contact: {
            type: Number,
            trim: true,
            required: true,
            unique: false
        },
        vision: {
            type: String,
            trim: true,
            required: false,
            unique: false
        },
        mission: {
            type: String,
            trim: true,
            required: false,
            unique: false
        },
        region: {
            type: String,
            trim: true,
            required: true,
            unique: false
        },
        orgtype: {
            type: String,
            trim: true,
            required: true,
            unique: false
        },
        intervention: {
            type: String,
            trim: true,
            required: false,
            unique: false
        },

        encrypted_password: {
            type: String,
            required: true
        },
        salt: String,
    },
    {timestamps: true}
);

//Creating a "virtua" field that will take in password and encrypt it
orgSchema.virtual("password")
    .set(function(password){
        this._password = password;
        this.salt = uuidv4();
        this.encrypted_password = this.securedPassword(password);
    })
    .get(function(){
        return this._password
    })
//Defining some methods associated with user schema
orgSchema.method({
  
  //To check if the password is correct 
    authenticate: function(plainpassword){
        return this.securedPassword(plainpassword) === this.encrypted_password
    },
  
  //To encrpty the password 
    securedPassword: function(plainpassword){
        if(!plainpassword) return "";
        try{
            return crypto.createHmac('sha256', this.salt)
                    .update(plainpassword)
                    .digest('hex')
        }
        catch(err){
            return "Error in hashing the password";
        }
    },
})
//Export the userSchema as Org
module.exports = mongoose.model("Org", orgSchema);
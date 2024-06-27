// Importing necessary modules and models
const express = require("express");
var router = express.Router();
const Org = require("../models/OrgModel.js");
const { check } = require('express-validator');
const { signin, signup, signout, isSignedIn, updateProfile } = require("../controllers/authControls");

// POST request for user signup
router.post(
    "/signup",
    [
        // Validation for name, email,vision,mission,region and password
        check("name", "Name must be 3+ chars long").isLength({ min: 3 }),
        check("email", "Email is required not").isEmail(),
        check("password", "Password must contain 8+ chars").isLength({ min: 8 }),
        check("vision", "vision must be 15+ chars long").isLength({ min: 5 }),
        check("mission", "mission must be 15+ chars long").isLength({ min: 5 }),
        check("region", "Region must contain 3+ chars").isLength({ min: 3 })
    ],
    signup // Call the signup function from the authController
);

// POST request for user signin
router.post(
    "/signin",
    [
        // Validation for email and password
        check("email", "Email is required").isEmail(),
        check("password", "Password is required").isLength({ min: 1 })
    ],
    signin // Call the signin function from the authController
);
router.get('/orglist',async (req,res)=>{
  try{
    const search = req.query.search || "";
    let sort = req.query.sort || "orgtype";
    let region = req.query.region ||"All";

    const regionOptions = [
      "Addis Ababa",
      "Afar",
      "Amhara",
      "Benishangul-Gumuz",
      "Central Ethiopia",
      "Dire Dawa",
      "Gambela",
      "Harari",
      "Oromia",
      "Sidama",
      "Somali",
      "South Ethiopia",
      "South West Ethiopia Peoples",
      "Tigray",
    ];
    region === "All" 
          ? (region = [...regionOptions]) 
          : (region = req.query.region.split(","));
    req.query.sort ? (sort = req.query.sort.split(",")):(sort=[sort]);

    let sortBy = {};
    if(sort[1]){
      sortBy[sort[0]] = sort[1];
    }else{
      sortBy[sort[0]]="asc";
    }

    const orglist = await Org.find({name:{$regex:search, $options:"i"}})
          .where("region")
          .in([...region])
          .sort(sortBy);
    
    const total = await Org.countDocuments({
      region: {$in:[...region]},
      name: {$regex: search, $options: 'i'}
    })
    const response = {
      error:false,
      total,
      regions:regionOptions,
      orglist,
    };
    res.status(200).json(response);
  } catch(err){
    console.log(err);
    res.status(500).json({error:true, message:"Internal Server Error"});
  }

});
const orgController = require('../controllers/authControls.js');
router.get('/profile/:id', orgController.getOrg);

router.put('/profile/:id', orgController.updateProfile);

// Route to get all data
router.get('/data', async (req, res) => {
  try {
    const data = await Org.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET request for user signout
router.get("/signout", signout);
// Protected Route for testing
router.get("/testroute", isSignedIn, (req, res) => {
    res.send("A protected route");  
});
module.exports = router; // Export the router module
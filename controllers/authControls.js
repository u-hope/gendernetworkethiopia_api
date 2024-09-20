// Importing necessary modules and models
const Org = require("../models/OrgModel.js");
const { check, validationResult } = require("express-validator");
const jwtToken = require('jsonwebtoken');
const { expressjwt: jwt } = require("express-jwt");

// SIGNUP: Registering a new organization
exports.signup = (req, res) => {
    // Validate user input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }
    // Creating a new org instance and saving it to the database
    const org = new Org(req.body);
    org.save()
        .then(org => {
            res.json({
                id: org._id,
                name: org.name,
                email: org.email,
                vision: org.vision,
                mission:org.intervention,
                contact: org.contact,
                region: org.region,
                orgtype: org.orgtype
            });
        })
        .catch(err => {
            let errorMessage = 'Something went wrong.';
            if (err.code === 11000) {
                errorMessage = 'Organization already exists, please signin'; 
            }
            return res.status(500).json({ error: errorMessage });
        });
};

// SIGNIN: Authenticating existing user
exports.signin = async (req, res) => {
    // Validate user input using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
        });
    }
    // Checking user credentials and generating JWT token for authentication
    const { email, password } = req.body;
    await Org.findOne({ email: `${email}` })
        .then(org => {
            if (!org) {
                return res.status(400).json({
                    error: "Organization data not found"
                });
            }
            if (!org.authenticate(password)) {
                return res.status(401).json({
                    error: "Email or Password does not exist"
                });
            }
            // Setting JWT token as a cookie in the browser
            const token = jwtToken.sign({ _id: org._id }, 'shhhhh');
            res.cookie("token", token, { expire: new Date() + 9999 });
            const { _id, name, email } = org;
            return res.json({ token, org: { _id, name, email } });
        });
};

// GET ALL Organizations: Retrieving all organizations from the database
exports.getAllOrgs = async (req, res) => {
  try {
    const orgs = await Org.find({}); // Find all organizations

    if (!orgs) {
      return res.status(404).json({ error: "No organizations found" });
    }

    res.json(orgs); // Return all organizations
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};
// SIGNOUT: Clearing user token
exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User has signed out"
    });
};
// Protected Routes
exports.isSignedIn = jwt({
    secret: 'shhhhh',
    userProperty: "auth",
    algorithms: ['HS256']
});
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED"
        });
    }
    next();
};
//getone
exports.getOrg = async (req, res) => {
    try {
      const singleOrg = await Org.findById(req.params.id);
  
      if (!singleOrg) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.json(singleOrg);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

//   exports.updateProfile = async(req,res)=>{
//     try{
//         const singleOrg = await Org.findById(req.params._id);

//         if(singleOrg){
//             singleOrg.name= req.body.name || singleOrg.name,
//             singleOrg.email= req.body.email || singleOrg.email,
//             singleOrg.vision= req.body.vision || singleOrg.vision,
//             singleOrg.mission=req.body.mission || singleOrg.mission,
//             singleOrg.contact= req.body.contact || singleOrg.contact,
//             singleOrg.region= req.body.region || singleOrg.region,
//             singleOrg.orgtype= req.body.orgtype || singleOrg.orgtype
            
//             if (req.body.password){
//             singleOrg.password = req.body.password;
//              }
            
//             const updateProfile = await singleOrg.save();

//             res.json(
//                 {
//                     _id:updateProfile._id,
//                     name:updateProfile.name,
//                     email:updateProfile.email,
//                     vision:updateProfile.vision,
//                     mission:updateProfile.mission,
//                     contact:updateProfile.contact,
//                     region:updateProfile.region,
//                     orgtype:updateProfile.orgtype,
                    
//                 }
//             )
//         }else{
//             res.status(404);
//             throw new Error("Account not found!!");
//         }
//     } catch(err){
//         res.status(500).json({message:err.message})
//     }
//   }

// UPDATE Organization Profile
exports.updateProfile = async (req, res) => {
    try {
        const updatedOrg = await Org.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedOrg) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json(updatedOrg);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

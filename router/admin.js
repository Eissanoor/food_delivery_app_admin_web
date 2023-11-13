const express = require("express");
const router = new express.Router();
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const validator = require("validator");
const cron = require("node-cron");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const multer = require("multer");
const auth = require("../middleware/auth");
const providerRegister = require("../model/providerregister");
const emailvarify = require("../model/emailotp");
const { profile } = require("console");
const cloudinary = require("cloudinary").v2;
var dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
require("../database/db");
router.use(cookieparser());
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(bodyparser.json());
router.use(express.json());
const email_OTP_pass = process.env.Email_otp_pass;
const C_cloud_name = process.env.C_cloud_name;
const C_api_key = process.env.C_api_key;
const C_api_secret = process.env.C_api_secret;
cloudinary.config({
  cloud_name: "dygnjwisi",
  api_key: "949226119586957",
  api_secret: "L-f1vqYq2Wd5fEiFp8T_Nx_pV1Y",
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use("/ProfileImage", express.static("public/upload"));
router.post("/signUp", async (req, res) => {
  let qdate = new Date();
  let date = qdate.toDateString();
  let Id = Math.floor(Math.random() * 10000000) + 1;
  let email = req.body.email;
  const mail = await providerRegister.findOne({ email: email });
  if (mail) {
    res
      .status(404)
      .json({ status: 404, message: "email already present", data: null });
  }
  try {
    const registerEmp = new providerRegister({
      Id: Id,
      password: req.body.password,
      email: req.body.email,
      date: date,
      ProfileImage: null,
      address: null,
      Phone: null,
      isVarified: false,
    });
    const random = Math.floor(Math.random() * 10000) + 1;
    console.log(random);
    const otpData = new emailvarify({
      email: req.body.email,
      code: random,
      expireIn: new Date().getTime() + 60 * 10000,
    });
    var transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "eissaanoor@gmail.com",
        pass: email_OTP_pass,
      },
    });
    var mailoption = {
      from: "eissaanoor@gmail.com",
      to: email,
      subject: "sending email using nodejs",
      text: `Varify Email OTP ${random}`,
    };
    transpoter.sendMail(mailoption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email send " + info.response);
      }
    });
    const varifyemail = await otpData.save();
    const registered = await registerEmp.save();
    const data = await providerRegister
      .findOne({ email: email })
      .select({ _id: 1, email: 1 });
    res.status(201).json({
      status: 201,
      message: "User has been Created",
      data: data,
    });
  } catch (e) {
    res.status(400).json({ status: 400, message: "not found", data: null });
  }
});
router.post("/emailVrifyOtp", async (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  const mail = await emailvarify.findOne({ code: code, email: email });
  if (mail) {
    const currentTime = new Date().getTime();
    const Diff = mail.expireIn - currentTime;
    if (Diff < 0) {
      res.status(401).json({
        status: 401,
        message: "otp expire with in 5 mints",
        data: null,
      });
    } else {
      const getmens = await providerRegister.findOneAndUpdate(
        { email: email },
        { $set: { isVarified: true } },
        { new: true }
      );

      res.status(200).json({
        status: 200,
        message: "email varification successful",
        data: getmens,
      });
    }
  } else {
    res.status(400).json({ status: 400, message: "Invalid Otp", data: null });
  }
});
router.post("/Login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const useremail = await providerRegister.findOne({ email: email });
    const token = await useremail.generateAuthToken();
    const ismatch = await bcrypt.compare(password, useremail.password);
    res.cookie("jwt", token, { httpOnly: true });
    if (!useremail || !password) {
      res.status(400).json({
        status: 400,
        message: "Enter Correct email or password",
        data: null,
      });
    } else if (ismatch) {
      res
        .status(200)
        .json({ status: 200, message: "Login Successfully", data: useremail });
    } else {
      res
        .status(404)
        .json({ status: 400, message: "Invalid Password", data: null });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, message: "invalid email", data: null });
  }
});
router.post("/resend-otp", async (req, res) => {
  try {
    let email = req.body.email;
    const mail = await providerRegister.findOne({ email: email });
    if (!mail) {
      res
        .status(404)
        .json({ status: 400, message: "This email not exist", data: null });
    } else {
      const random = Math.floor(Math.random() * 10000) + 1;
      console.log(random);
      const otpData = new emailvarify({
        email: req.body.email,
        code: random,
        expireIn: new Date().getTime() + 60 * 10000,
      });
      var transpoter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "eissaanoor@gmail.com",
          pass: email_OTP_pass,
        },
      });
      var mailoption = {
        from: "eissaanoor@gmail.com",
        to: email,
        subject: "sending email using nodejs",
        text: `Varify Email OTP ${random}`,
      };
      transpoter.sendMail(mailoption, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("email send " + info.response);
        }
      });
      const varifyemail = await otpData.save();
      res.status(201).json({
        status: 201,
        message: "Resend otp successfully",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "internel Server error",
      data: null,
    });
  }
});
router.post("/changePassword", async (req, res) => {
  const email = req.body.email;
  const code = req.body.code;
  const mail = await emailvarify.findOne({ code: code, email: email });
  if (mail) {
    const currentTime = new Date().getTime();
    const Diff = mail.expireIn - currentTime;
    console.log(Diff);
    if (Diff < 0) {
      res.status(401).json({
        status: 401,
        message: "otp expire with in 5 mints",
        data: null,
      });
    } else {
      const mailVarify = await providerRegister.findOne({ email: email });
      const password = req.body.password;
      const ismatch = await bcrypt.compare(password, mailVarify.password);
      console.log(ismatch);
      mailVarify.password = password;
      const registered = await mailVarify.save();
      res.status(201).json({
        status: 201,
        message: "password change successful",
        data: mailVarify,
      });
    }
  } else {
    res.status(400).json({ status: 400, message: "Invalid Otp", data: null });
  }
});
router.get("/", (req, res) => {
  res.json({ status: 200, message: "THIS IS HOME PAGE", data: null });
});
router.delete("/delete-email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await providerRegister.deleteOne({ email: email });
    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ status: 200, message: "User delete Successfully", data: null });
    } else {
      res
        .status(404)
        .json({ status: 404, message: "email is not found", data: null });
    }
  } catch (error) {
    res.json({ status: 500, message: "internel server error", data: null });
  }
});
router.delete("/email-or-password-otp-delete", async (req, res) => {
  try {
    const result = await emailvarify.deleteMany({});
    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ status: 200, message: "Collection Cleared", data: null });
    } else {
      res.status(200).json({
        status: 200,
        message: "Collection is already empty",
        data: null,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
});
router.get("/get-alluser-detail", auth, async (req, res) => {
  try {
    const data = await providerRegister
      .find({})
      .select({ _id: 1, email: 1, Phone: 1, address: 1, ProfileImage: 1 });
    res.status(200).json({
      status: 200,
      message: "User details",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
router.put(
  "/update-user/:email",
  auth,
  upload.single("ProfileImage"),
  async (req, res) => {
    try {
      const email = req.params.email;
      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid email format",
          data: null,
        });
      }
      const user = await providerRegister.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          data: null,
        });
      }
      const file = req.file;
      let profileImageURL = user.ProfileImage;

      if (file) {
        profileImageURL = `data:image/png;base64,${file.buffer.toString(
          "base64"
        )}`;

        const result = await cloudinary.uploader.upload(profileImageURL);
        profileImageURL = result.url;
      }

      const updatedUser = await providerRegister.findOneAndUpdate(
        { email: email },
        { ...req.body, ProfileImage: profileImageURL },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          data: null,
        });
      }

      res.status(200).json({
        status: 200,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        data: null,
      });
    }
  }
);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Schedule the function to run every 20 seconds
// //upload.array("profile", 12),
// //upload.single("profile"),
// const cpUpload = upload.fields([
//   { name: "profile", maxCount: 1 },
//   { name: "resume", maxCount: 1 },
// ]);
// router.post("/CreateProfile", cpUpload, async (req, res) => {
//   try {
//     let Id = Math.floor(Math.random() * 100000) + 1;
//     const {
//       firstname,
//       lastname,
//       category,
//       gender,
//       Location,
//       hourlypricestart,
//       hourlypriceend,
//       experience,
//       aboutme,
//       qalification,
//       certification,
//       speciality,
//       fburl,
//       instaurl,
//       linkedinurl,
//       twitterurl,
//     } = req.body;

//     const registerEmp = new CreateProfile({
//       Id: Id,

//       profile: `https://humstaffing.herokuapp.com/profile/${req.files.profile[0].filename}`,
//       resume: `https://humstaffing.herokuapp.com/profile/${req.files.resume[0].filename}`,
//       firstname: firstname,
//       lastname: lastname,
//       category: category,
//       gender: gender,
//       experience: experience,
//       aboutme: aboutme,
//       Location: Location,
//       hourlypricestart: hourlypricestart,
//       hourlypriceend: hourlypriceend,
//       qalification: qalification,
//       certification: certification,
//       speciality: speciality,
//       fburl: fburl,
//       instaurl: instaurl,
//       linkedinurl: linkedinurl,
//       twitterurl: twitterurl,
//     });
//     var a = req.files;
//     console.log(a.profile[0].filename);
//     const registered = await registerEmp.save();
//     console.log(registered);
//     res.status(201).json(registerEmp);
//   } catch (err) {
//     console.log(err);
//   }
// });
// router.get("/CreateProfile", async (req, res) => {
//   const getorder = await CreateProfile.find({});
//   res.status(201).send(getorder);
// });
// router.patch("/BasicInfo/:id", async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const getmens = await CreateProfile.findByIdAndUpdate(_id, req.body, {
//       new: true,
//     });
//     console.log("khansaab");
//     res.status(201).send(getmens);
//     console.log(getmens);
//   } catch (error) {
//     res.status(400).send(error);
//     console.log(error);
//   }
// });

// router.post("/addJob", async (req, res) => {
//   try {
//     let qdate = new Date();
//     let date =
//       qdate.getDay() + "/" + qdate.getMonth() + "/" + qdate.getFullYear();
//     const {
//       positionTitle,
//       hospital_Faculty,
//       speciality,
//       jod_duration,
//       hourlyRate,
//       shift,
//       from,
//       to,
//       startDate,
//       endDate,
//       description,
//     } = req.body;
//     const totalhours = to - from;

//     const addjob = new addJob({
//       Date: date,
//       positionTitle: positionTitle,
//       hospital_Faculty: hospital_Faculty,
//       speciality: speciality,
//       jod_duration: jod_duration,
//       hourlyRate: hourlyRate,
//       shift: shift,
//       from: from,
//       to: to,
//       totalhours: totalhours,
//       startDate: startDate,
//       endDate: endDate,
//       description: description,
//     });
//     const registered = await addjob.save();
//     res.status(201).send(registered);
//   } catch (err) {
//     console.log("error");

//     console.log(err);
//   }
// });

//
// router.get("/secret", auth, (req, res) => {
//   res.send("secret da der");
// });
// router.get("/logout", auth, async (req, res) => {
//   try {
//     console.log(req.user);
//     /////////////////////////////////
//     ///////////logout cookies
//     res.clearCookie("jwt");

//     console.log("logout");
//     await req.user.save();
//     console.log("sai shoo");
//     res.send("Logout user will be done");

//     /////////
//   } catch (error) {
//     res.status(500).send("the error part");
//     console.log("the error part");
//     res.status(500).send(error);
//   }
// });
module.exports = router;

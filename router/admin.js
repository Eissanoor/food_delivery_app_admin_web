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
const MenuItem = require("../model/menuitem");
const cors = require("cors");
const Catagres = require("../model/addcatagres");
const Counting = require("../model/counting");
var dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
require("../database/db");
router.use(cors());
router.use(cookieparser());
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(bodyparser.json());
router.use(express.json());
const mailgun = require("mailgun-js");
const mailGun = process.env.mailGun;
const DOMAIN = mailGun;
const Email_otp_pass = process.env.Email_otp_pass;
const C_cloud_name = process.env.C_cloud_name;
const C_api_key = process.env.C_api_key;
const C_api_secret = process.env.C_api_secret;
const MailGun_api_key = process.env.MailGun_api_key;
cloudinary.config({
  cloud_name: C_cloud_name,
  api_key: C_api_key,
  api_secret: C_api_secret,
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.use("/ProfileImage", express.static("public/upload"));
router.use("/image", express.static("public/upload"));
router.use("/categoryThumbnail", express.static("public/upload"));
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
      isNewUser: false,
    });
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
    console.log(e);
    res.status(400).json({ status: 400, message: "not found", data: null });
  }
});
router.post("/emailVrifyOtp", async (req, res) => {
  try {
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
          data: null,
        });
      }
    } else {
      res.status(400).json({ status: 400, message: "Invalid Otp", data: null });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 400, message: "Invalid Otp", data: null });
  }
});
router.post("/Login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
    const expirationTime = new Date().getTime() + oneMonthInMillis;
    const useremail = await providerRegister.findOne({ email: email });
    const ismatch = await bcrypt.compare(password, useremail.password);

    if (!useremail || !password) {
      res.status(400).json({
        status: 400,
        message: "Enter Correct email or password",
        data: null,
      });
    } else if (ismatch) {
      const getmens = await providerRegister.findOneAndUpdate(
        { email: email },
        { $set: { expireIn: expirationTime } },
        { new: true }
      );
      const token = await useremail.generateAuthToken();
      res.cookie("jwt", token, { httpOnly: true });
      res.status(200).json({
        status: 200,
        message: "Login Successfully",
        data: {
          _id: useremail._id,
          isVerified: useremail.isVarified,
          isNewUser: useremail.isNewUser,
          accessToken: token,
        },
      });
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
          user: "wasimxaman13@gmail.com",
          pass: Email_otp_pass,
        },
      });
      var mailoption = {
        from: "wasimxaman13@gmail.com",
        to: email,
        subject: "sending email using nodejs",
        text: `Varify Email OTP ${random}`,
      };
      transpoter.sendMail(mailoption, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).json({
            status: 500,
            message: "Failed to send OTP email",
            data: null,
          });
        } else {
          console.log("Email sent: " + info.response);
          res.status(201).json({
            status: 201,
            message: "Send OTP successfully",
            data: { Otp: random },
          });
        }
      });
      const varifyemail = await otpData.save();
      res.status(201).json({
        status: 201,
        message: "Send otp successfully",
        data: { Otp: random },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel Server error",
      data: null,
    });
  }
});
router.post("/refresh-token", auth, async (req, res) => {
  try {
    let userId = req.body._id;
    const mail = await providerRegister.findOne({ _id: userId });
    console.log(mail);
    if (!mail) {
      res
        .status(404)
        .json({ status: 400, message: "This User not exist", data: null });
    } else {
      const currentTime = new Date().getTime();
      const Diff = mail.expireIn - currentTime;
      if (Diff < 0) {
        res.status(401).json({
          status: 401,
          message: "your token expired with in one month",
          data: null,
        });
      } else {
        const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
        const expirationTime = new Date().getTime() + oneMonthInMillis;
        const getmens = await providerRegister.findOneAndUpdate(
          { _id: userId },
          { $set: { expireIn: expirationTime } },
          { new: true }
        );

        res.status(200).json({
          status: 200,
          message: "Successfully refreshed token",
          data: { isAuthorized: true },
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel Server error",
      data: null,
    });
  }
});
router.post("/changePassword", async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
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
    console.log(error);
    res.json({ status: 500, message: "internel server error", data: null });
  }
});
router.get("/get-alluser-detail", async (req, res) => {
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
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
router.put(
  "/update-user/:_id",
  auth,
  upload.single("ProfileImage"),
  async (req, res) => {
    try {
      const id = req.params._id;

      const user = await providerRegister.findOne({ _id: id });

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
        { _id: id },
        { ...req.body, ProfileImage: profileImageURL, isNewUser: true },
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
        data: null,
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
router.get("/get-user-detail/:id", auth, async (req, res) => {
  try {
    const id = req.params._id;
    const data = await providerRegister.findOne({ id: id }).select({
      _id: 1,
      email: 1,
      Phone: 1,
      address: 1,
      fullname: 1,
      ProfileImage: 1,
    });
    res.status(200).json({
      status: 200,
      message: "User details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
const clearCollection = async () => {
  try {
    const result = await emailvarify.deleteMany({});
    return result.deletedCount;
  } catch (error) {
    console.error("Error clearing collection:", error);
    throw error;
  }
};
router.delete("/email-or-password-otp-delete", async (req, res) => {
  try {
    const deletedCount = await clearCollection();

    if (deletedCount > 0) {
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
cron.schedule("59 23 * * *", async () => {
  try {
    const deletedCount = await clearCollection();
    console.log(`Deleted ${deletedCount} documents.`);
  } catch (error) {
    console.error("Error running cron job:", error);
  }
});
router.post("/add-items", upload.single("image"), async (req, res) => {
  try {
    const foodName = req.body.foodName;
    const itemNameexist = await MenuItem.findOne({ foodName: foodName });
    if (!itemNameexist) {
      const file = req.file;
      let ManuImage = null;

      if (file) {
        ManuImage = `data:image/png;base64,${file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(ManuImage);
        ManuImage = result.url;
      }

      const MenuEmp = new MenuItem({
        foodName: req.body.foodName,
        price: req.body.price,
        description: req.body.description,
        categoryId: req.body.categoryId,
        image: ManuImage,
      });
      const menu = await MenuEmp.save();
      res.status(201).json({
        status: 201,
        message: "Food has been Added",
        data: MenuEmp,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "itemName already present",
        data: null,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: 400,
      message: "Required parameter is missing",
      data: null,
    });
  }
});
router.put("/update-items/:_id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params._id;

    const user = await MenuItem.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "Item not found",
        data: null,
      });
    }
    const file = req.file;
    let profileImageURL = user.image;

    if (file) {
      profileImageURL = `data:image/png;base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(profileImageURL);
      profileImageURL = result.url;
    }
    const updatedUser = await MenuItem.findOneAndUpdate(
      { _id: id },
      { ...req.body, image: profileImageURL },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: "Item not found",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Item updated successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});
router.post(
  "/add-catogray",
  upload.single("categoryThumbnail"),
  async (req, res) => {
    try {
      const category = req.body.category;
      let Id = Math.floor(Math.random() * 10000000) + 1;
      const mail = await Catagres.findOne({ category: category });
      if (!mail) {
        const file = req.file;
        let ManuImage = null;

        if (file) {
          ManuImage = `data:image/png;base64,${file.buffer.toString("base64")}`;

          const result = await cloudinary.uploader.upload(ManuImage);
          ManuImage = result.url;
        }
        const count = await Counting.find({}, { _id: 0 });

        const addidtioncount = count[0].categoryId + 1;
        const updatedCount = await Counting.findOneAndUpdate(
          {},
          { $inc: { categoryId: 1 } }, // Use $inc to increment the categoryId field
          { new: true }
        );
        const CatagresEmp = new Catagres({
          category: req.body.category,
          categoryThumbnail: ManuImage,
          categoryId: addidtioncount,
        });
        const addCatagres = await CatagresEmp.save();
        res.status(201).json({
          status: 201,
          message: "category has been Added",
          data: addCatagres,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "category already present",
          data: null,
        });
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({
        status: 400,
        message: "Required parameter is missing",
        data: null,
      });
    }
  }
);
router.delete("/delete-catogray/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const mail = await Catagres.deleteOne({ category: category });
    if (mail.deletedCount === 1) {
      res.status(200).json({
        status: 200,
        message: "category delete Successfully",
        data: null,
      });
    } else {
      res
        .status(404)
        .json({ status: 404, message: "category is not found", data: null });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: 500, message: "internel server error", data: null });
  }
});
router.get("/get-allcatogray", async (req, res) => {
  try {
    const data = await Catagres.find(
      {},
      { category: 1, categoryId: 1, _id: 0 }
    );
    res.status(200).json({
      status: 200,
      message: "category details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
router.get("/get-allitem", async (req, res) => {
  try {
    const data = await MenuItem.find({});
    res.status(200).json({
      status: 200,
      message: "Item details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
router.delete("/delete-items/:itemName", async (req, res) => {
  try {
    const itemName = req.params.itemName;
    const result = await MenuItem.deleteOne({ itemName: itemName });
    if (result.deletedCount === 1) {
      res
        .status(200)
        .json({ status: 200, message: "item delete Successfully", data: null });
    } else {
      res
        .status(404)
        .json({ status: 404, message: "item is not found", data: null });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: 500, message: "internel server error", data: null });
  }
});
router.get("/get-item-byid/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await MenuItem.findOne({ _id: id });
    res.status(200).json({
      status: 200,
      message: "item details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internal server error",
      data: null,
    });
  }
});
router.get("/get-catogray", async (req, res) => {
  try {
    const data = await Catagres.find({});
    res.status(200).json({
      status: 200,
      message: "All category details",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "internel server error",
      data: null,
    });
  }
});
module.exports = router;

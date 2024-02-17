var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../config/dbConfig");
const { UserModel } = require("../schema/usersschema.js");
const {StudentModel}=require("../schema/studentschema.js")
const {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  roleSalesRep,roleAdmin, roleStudent
} = require("../config/auth");
const jwt = require("jsonwebtoken");
const { CourseModel } = require('../schema/courseschema.js');
const { TrainingModel } = require('../schema/trainingschema.js');

mongoose.set("strictQuery", true);
mongoose.connect(dbUrl);

router.post("/signup", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      req.body.password = await hashPassword(req.body.password);
      req.body.cpassword = await hashPassword(req.body.cpassword);
      let doc = new UserModel(req.body);
      console.log(doc)
      await doc.save();
      res.status(201).send({
        message: "User Created successfully",
      });
    } else {
      res.status(400).send({ message: "User already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      if (await hashCompare(req.body.password, user.password)) {
        let token = createToken({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        });
        console.log(token);

        res
          .status(200)
          .send({ meassage: "Login Successful", token, role: user.role ,user});
        // res.status(200).send({firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role,tokens:token})
        // user.save()
      } else {
        res.status(400).send({ message: "Invalid credentials" });
      }
    } else {
      res.send({ message: "Email doesnot exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/student-registration", validate,roleSalesRep,async (req, res) => {
  try {
    let user = await StudentModel.findOne({ email: req.body.email });
    if (!user) {
      let doc = new StudentModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "student Created successfully",
      });
    }else{
      res.send({
        message:"user already exist"
      })
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/course-registration", validate,roleStudent,async (req, res) => {
  try {
    let course = await CourseModel.findOne({ email: req.body.email });
    if(!student){
      let doc = new CourseModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "Course Created successfully",
  course
      });
    }else{
      res.status(400).send({ message: "Course already Created" });
    }

    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/training-registration", validate,roleAdmin,async (req, res) => {
  try {
    // let training = await TrainingModel.findOne({ Name: req.body.Name });
    // if(!training){
      let doc = new TrainingModel(req.body);
      await doc.save();
      res.status(201).send({
        message: "Training Created successfully",
        training
      });
    // }else{
      res.status(400).send({ message: "training already scheduled" });
    // }

    
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.get("/student-dashboard", validate, roleStudent, async (req, res) => {
  try {
    let data = await CourseModel.aggregate([
      {
        $group: { _id: "$course", count: { $sum: 1 } },
      },
    ]);
    console.log(data)
    res.status(201).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

// router.get("/training-dashboard", validate, roleAdmin, async (req, res) => {
//   try {
//     let data = await TrainingModel.aggregate([
//       {
//         $group: { _id: "$course", count: { $sum: 1 } },
//       },
//     ]);
//     console.log(data)
//     res.status(201).send({
//       students: data,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: "Internal Server Error ",
//       error,
//     });
//   }
// });

router.get("/dashboard", validate, roleAdmin, async (req, res) => {
  try {
    let data = await StudentModel.aggregate([
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    res.status(201).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.get(
  "/dashboard-list-items/:status",
  validate,
  roleAdmin,
  async (req, res) => {
    console.log(req.params.status)
    try {
      let data = await StudentModel.find({ status: req.params.status });
      console.log(data)
      res.status(201).send({
        students: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error ",
        error,
      });
    }
  }
);

router.get(
  "/dashboard-list-items/:course",
  validate,
  // roleStudent,
  async (req, res) => {
    console.log(req.params.course)
    try {
      let data = await CourseModel.find({ course: req.params.course });
      console.log(data)
      res.status(201).send({
        students: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Internal Server Error ",
        error,
      });
    }
  }
);

router.get("/display-student", async (req, res) => {
  try {
    let data = await StudentModel.find();
    res.status(200).send({
      students: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.get("/display-course", async (req, res) => {
  try {
    let data = await CourseModel.find();
    console.log(data)
    res.status(200).send({
      courses: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.get("/display-timing", validate,async (req, res) => {
  try {
    let data = await TrainingModel.find();
    console.log(data)
    res.status(200).send({
      timing: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await StudentModel.findByIdAndDelete({ _id: id });
    console.log(data);
    res.status(200).send({
      message: "student deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.delete("/delete-course/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await CourseModel.findByIdAndDelete({ _id: id });
    console.log(data);
    res.status(200).send({
      message: "course deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.delete("/delete-timing/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let data = await TrainingModel.findByIdAndDelete({ _id: id });
    console.log(data);
    res.status(200).send({
      message: "training deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.put("/manage-student/:id", async (req, res) => {
  try {
    let data = await StudentModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).send({
      message: "Student updated successfully",
      student: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.put("/manage-course/:id", async (req, res) => {
  try {
    let data = await CourseModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).send({
      message: "Course updated successfully",
      course: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.put("/manage-timing/:id", async (req, res) => {
  try {
    let data = await TrainingModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).send({
      message: "Timing updated successfully",
      course: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server error",
      error,
    });
  }
});

router.get("/manage-student/:id", async (req, res) => {
  try {
    let data = await StudentModel.findOne({ _id: req.params.id });
    console.log(data);
    res.status(200).send({
      student: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.get("/manage-course/:id", async (req, res) => {
  try {
    let data = await CourseModel.findOne({ _id: req.params.id });
    console.log(data);
    res.status(200).send({
      course: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

router.get("/manage-timing/:id", async (req, res) => {
  try {
    let data = await TrainingModel.findOne({ _id: req.params.id });
    console.log(data);
    res.status(200).send({
      timing: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error ",
      error,
    });
  }
});

module.exports = router;

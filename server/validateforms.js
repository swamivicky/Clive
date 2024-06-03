const Yup = require("yup");
const Logvalidate = (req, res) => {
  const formData = req.body;
 Yup.object({
  PhoneNumber: Yup.string()
  .required("Phone number required")
  .matches(/^[0-9]+$/, "Invalid phone number")
  .min(10, "Phone number too short")
  .max(10, "Phone number too long"),
PassWord: Yup.string()
  .required("Password required")
  .min(6, "Password too short")
  .max(28, "Password too long"),
})
    .validate(formData)
    .catch((err) => {
      res.status(422).send();
      console.log(err.errors); //hello world
    })
    .then((valid) => {
      if (valid) {
        console.log("form is good");
      }
    });
};
const Signvalidate = (req, res) => {
  const formData = req.body;
 Yup.object({
  PhoneNumber: Yup.string()
  .required("Phone number required")
  .matches(/^[0-9]+$/, "Invalid phone number")
  .min(10, "Phone number too short")
  .max(10, "Phone number too long"),
PassWord: Yup.string()
  .required("Password required")
  .min(6, "Password too short")
  .max(28, "Password too long"),
  UserName: Yup.string()
  .required("UserName required")
  .min(6, "Username too short")
  .max(28, "Username too long"),

})
    .validate(formData)
    .catch((err) => {
      res.status(422).send();
      console.log(err.errors); //hello world
    })
    .then((valid) => {
      if (valid) {
        console.log("form is good");
      }
    });
};
module.exports = {Signvalidate,Logvalidate};
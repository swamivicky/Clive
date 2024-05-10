const Yup = require("yup");
const validateForm = (req, res) => {
  const formData = req.body;
 Yup.object({
      UserName: Yup.string()
        .required("UserName required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
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
module.exports = validateForm;

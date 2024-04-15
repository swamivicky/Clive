const Yup = require("yup");
const formSchema = Yup.object({
  UserName: Yup.string()
    .required("UserName required")
    .min(6, "Username too short")
    .max(28, "Username too logn!"),
  PassWord: Yup.string()
    .required("Password required")
    .min(6, "Password too short")
    .max(28, "Password too logn!"),
});
// common/index.js
export { formSchema } from "./formSchema";

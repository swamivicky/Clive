import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [response, setResponse] = useState("PhoneNumber exist Plz LogIn");

  const formik = useFormik({
    initialValues: { UserName: "", PassWord: "", PhoneNumber: "" },
    validationSchema: Yup.object({
      UserName: Yup.string()
        .required("UserName required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
      PassWord: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(/^[0-9]+$/, "Invalid phone number")
        .min(10, "Phone number too short")
        .max(10, "Phone number too long"),
    }),
    onSubmit: (values, actions) => {
      const vals = { ...values };
      actions.resetForm();
      console.log(vals);

      fetch("http://localhost:5001/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
      })
        .then((res) => {
          if (!res || !res.ok || res.status >= 400) {
            throw new Error("Failed to log in");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
         setResponse(data)
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  return (
    <div className="App">
      <div className="joinChatContainer">
        <form onSubmit={formik.handleSubmit}>
          <div>
            {response === 1 && (
              <p className="displyResG">{"Account Created LogIn Now"}</p>
            )}
            {response ===2  && (
              <p className="displyResR">{"This Phone Number Is In Use"}</p>
            )}
          </div>

          <h1 id="headingLog">SignUp</h1>
          <input
            className="PhoneNumber"
            name="PhoneNumber"
            type="tel"
            placeholder="Phone Number..."
            {...formik.getFieldProps("PhoneNumber")}
          />
          {formik.touched.PhoneNumber && formik.errors.PhoneNumber && (
            <p className="error">{formik.errors.PhoneNumber}</p>
          )}


          <input
            className="Username"
            name="UserName"
            type="text"
            placeholder="Enter User Name ..."
            {...formik.getFieldProps("UserName")}
          />
          {formik.touched.UserName && formik.errors.UserName && (
            <p className="error">{formik.errors.UserName}</p>
          )}

          <input
            className="PassWord"
            name="PassWord"
            type="password"
            placeholder="Set Password..."
            {...formik.getFieldProps("PassWord")}
          />
          {formik.touched.PassWord && formik.errors.PassWord && (
            <p className="error">{formik.errors.PassWord}</p>
          )}

          <div className="LogButtonDiv">
            <button className="LPageButton" type="submit">
              Create Account
            </button>
            <button className="LPageButton" onClick={() => navigate("/login")}>
              LogIn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

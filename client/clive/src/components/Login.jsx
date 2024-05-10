import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function Login() {
  const navigate = useNavigate();
  const formik = useFormik({
<<<<<<< HEAD
    initialValues: { PhoneNumber: "", PassWord: "" },
    validationSchema: Yup.object({
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(/^[0-9]+$/, "Invalid phone number")
        .min(10, "Phone number too short")
        .max(10, "Phone number too long"),
=======
    initialValues: { UserName: "", PassWord: "" },
    validationSchema:Yup.object({
      UserName: Yup.string()
        .required("UserName required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
>>>>>>> e32786ce1c550b9e9651b39d9e259b5f66afcf6a
      PassWord: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
<<<<<<< HEAD
    }),
=======
    })
    ,
>>>>>>> e32786ce1c550b9e9651b39d9e259b5f66afcf6a
    onSubmit: (values) => {
      const vals = { ...values };
      formik.handleReset();
      console.log(vals);
      // Adjust the URL to the correct endpoint for user login
      fetch("http://localhost:5001/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
<<<<<<< HEAD
      })
        .then((res) => {
          console.log(res.json);
          return res.json();
        })
        .then((data) => {
          console.log(data);
          navigate("/login");
        })
        .catch((err) => {
          console.error(err);
        });
=======
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error("Failed to log in. HTTP status: " + res.status);
        }
        return res.json(); // Parse response body as JSON
    })
    .then((data) => {
        console.log(data); // Log the parsed JSON response
       
    })
    .catch((err) => {
        console.error(err);
    });
    
>>>>>>> e32786ce1c550b9e9651b39d9e259b5f66afcf6a
    },
  });

  return (
    <>
      <div className="App">
        <div className="joinChatContainer">
          <form onSubmit={formik.handleSubmit}>
            <h1 id="headingLog">Log In</h1>

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
              className="PassWord"
              name="PassWord"
              type="password"
              placeholder="Password..."
              {...formik.getFieldProps("PassWord")}
            />
            {formik.touched.PassWord && formik.errors.PassWord ? (
              <p className="error">{formik.errors.PassWord}</p>
            ) : null}

            <div className="LogButtonDiv">
              <button className="LPageButton" type="submit">
                LogIn
              </button>
              <button
                className="LPageButton"
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Login;

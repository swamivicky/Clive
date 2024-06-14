import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function Login() {
  const navigate = useNavigate();
  const [response, setResponse] = useState();
  const formik = useFormik({
    initialValues: { PhoneNumber: "", PassWord: "", UserName: "" }, // Added UserName
    validationSchema: Yup.object({
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(/^[0-9]+$/, "Invalid phone number")
        .min(10, "Phone number too short")
        .max(10, "Phone number too long"),
      PassWord: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
    }),
    onSubmit: (values) => {
      const vals = { ...values };
      formik.handleReset();
      console.log(vals);
      // Adjust the URL to the correct endpoint for user login
      fetch("http://localhost:5001/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          if (data.loged === 1) {
            localStorage.setItem("Token", data.UToken);
            navigate("/clive");
          } else {
            setResponse(data);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });
  return (
    <>
      <div className="App">
        <div className="joinChatContainer">
          <form onSubmit={formik.handleSubmit}>
            <div>
              {response === 2 && (
                <p className="displyRes">Incorrect password</p>
              )}
              {response === 3 && <p className="displyRes">User Not found</p>}
            </div>
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

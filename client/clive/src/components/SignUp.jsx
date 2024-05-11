import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [response, setResponse] = useState("PhoneNumber exist Plz LogIn");

  const formik = useFormik({
    initialValues: { UserName: "", PassWord: "" },
    validationSchema: Yup.object({
      UserName: Yup.string()
        .required("UserName required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
      PassWord: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
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
          navigate("/login");
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
            {response === "PhoneNumber exist Plz LogIn" && (
              <p className="displyRes">{response}</p>
            )}
            {response !== "PhoneNumber exist Plz LogIn" && (
              <p className="displySRes">{response}</p>
            )}
          </div>

          <h1 id="headingLog">SignUp</h1>

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
            placeholder="Password..."
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

import React from "react";
import { formSchema } from "@whatsapp-clone/common";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: { UserName: "", PassWord: "" },
    validationSchema: formSchema,
    onSubmit: (values, actions) => {
      const vals = { ...values };
      actions.resetForm();

      // Adjust the URL to the correct endpoint for user login
      fetch("http://localhost:5000/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
      })
        .then((res) => {
          console.log(res);
          if (!res || !res.ok || res.status >= 400) {
            throw new Error("Failed to log in");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
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
            <h1 id="headingLog">SignUp</h1>

            <input
              className="Username"
              name="UserName"
              type="text"
              placeholder="Enter User Name ..."
              {...formik.getFieldProps("UserName")}
            />
            {formik.touched.UserName && formik.errors.UserName ? (
              <p className="error">{formik.errors.UserName}</p>
            ) : null}

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
                Create Account
              </button>
              <button className="LPageButton" onClick={() => navigate("*")}>
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUp;

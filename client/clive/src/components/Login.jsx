import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function Login() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: { UserName: "", PassWord: "" },
    validationSchema:Yup.object({
      UserName: Yup.string()
        .required("UserName required")
        .min(6, "Username too short")
        .max(28, "Username too long"),
      PassWord: Yup.string()
        .required("Password required")
        .min(6, "Password too short")
        .max(28, "Password too long"),
    })
    ,
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
    
    },
  });

  /*const styles = {
    backgroundColor: mode === "dark" ? "white" : "black",
    color: mode === "dark" ? "black" : "white",
  };  */

  /*const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(false);
    }
  };*/

  /*const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };*/

  return (
    <>
      <div className="App">
        <div className="joinChatContainer">
          <form onSubmit={formik.handleSubmit}>
            <h1 id="headingLog">Log In</h1>

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
/*<button className="SwitchB" style={styles} onClick={toggleMode}>
   {mode === "dark" ? "white" : "dark"}
 </button>;*/ // App class name    `${mode === "dark" ? "dark-mode" : ""}`
export default Login;

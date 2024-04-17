import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { formSchema } from "@whatsapp-clone/common";
function Login() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: { UserName: "", PassWord: "" },
    validationSchema: formSchema,
    onSubmit: (values) => {
      const vals = { ...values };
      formik.handleReset();
console.log(vals);
      // Adjust the URL to the correct endpoint for user login
      fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
      })
        .then((res) => {
          if (!res || !res.ok || res.status >= 400) {
            throw new Error("Failed to log in"); // Throwing an error for better error handling
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
      console.log("vicky");
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

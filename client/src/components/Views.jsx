import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";

const Views = () => {
  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};
export default Views;

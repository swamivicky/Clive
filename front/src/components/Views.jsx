import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Chat from "./Chatpage/Chat";
const Views = () => {
  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="*" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/clive" element={<Chat />} />
    </Routes>
  );
};
export default Views;

import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useFormik } from "formik";
import * as Yup from "yup";
import sendImage from "./send.jfif";
const socket = io.connect("http://localhost:5001");

function Chat() {
  const [messageList, setMessageList] = useState([]);
  const [popup, setPopup] = useState(false);
  const [cresData, setCresData] = useState();
  const [selectedContact, setSelectedContact] = useState(null);
  const [msgD, setMsgD] = useState(null);
  const [list, setList] = useState([]);

  const vicky = useFormik({
    initialValues: { message: "" },
    validationSchema: Yup.object({
      message: Yup.string().required("Required"),
    }),
    onSubmit: async (values, actions) => {
      const vals = values.message;
      console.log(vals);
      console.log(selectedContact);
      if (vals !== "" && selectedContact) {
        const messageData = {
          room: selectedContact.roomid,
          author: cresData.phone_N,
          Number: selectedContact.c_phonenum,
          message: vals,
          time: new Date().toLocaleTimeString(),
        };
        setMsgD(messageData);
        await socket.emit("send_message", messageData);
        actions.resetForm();
        setMessageList((list) => [...list, messageData]);
      }
    },
  });

  const formik = useFormik({
    initialValues: { PhoneNumber: "" },
    validationSchema: Yup.object({
      PhoneNumber: Yup.string()
        .required("Phone number required")
        .matches(/^[0-9]+$/, "Invalid phone number")
        .min(10, "Phone number too short")
        .max(10, "Phone number too long"),
    }),
    onSubmit: (values, actions) => {
      const vals = { ...values };
      actions.resetForm();

      fetch("http://localhost:5001/auth/Create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vals),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setList((list) => [...list, data]);
          }
          formik.resetForm();
          togglePopup();
        })
        .catch((err) => {
          console.error(err);
        });
    },
  });

  useEffect(() => {
    fetch("http://localhost:5001/auth/Clive", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCresData(data.v);
        setList(data.list);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);
  const togglePopup = () => {
    setPopup(!popup);
  };
  return (
    <div className="chatPage">
      <div className="container">
        <button className="Create" onClick={togglePopup}>
          Create New Contact
        </button>
        {popup && (
          <div className="contactCreateDiv">
            <div className="content_createContact">
              <h2>Enter Phone Number</h2>
              <input
                placeholder="PhoneNumber ..."
                type="tel"
                name="PhoneNumber"
                {...formik.getFieldProps("PhoneNumber")}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault(); // Prevent default form submission on Enter
                    formik.handleSubmit();
                  }
                }}
              />
              <button type="submit" onClick={formik.handleSubmit}>
                Create
              </button>
            </div>
          </div>
        )}
        <div className="contacts" onClick={popup ? togglePopup : undefined}>
          {list.map((data, index) => (
            <div
              key={index}
              className="contact"
              onClick={() => setSelectedContact(data)}
            >
              <p>{data.c_name}</p>
              <p>{data.c_phonenum}</p>
              <p>{data.roomid}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="chatdiv">
        <div className="chat-header">
          {selectedContact ? (
            <p>{`Live Chat --- ${selectedContact.c_name}`}</p>
          ) : (
            <p>*****LIVE CHAT*****</p>
          )}
        </div>
        <div className="chat-body">
          {messageList.map((messageContent, index) => (
            <div
              key={index}
              className="message"
              id={
                selectedContact && cresData.phone_N === msgD.author
                  ? "you"
                  : "other"
              }
            >
              <div
                className="msgdiv"
                id={
                  selectedContact && cresData.phone_N === msgD.author
                    ? "you"
                    : "other"
                }
              >
                <div
                  className="msg"
                  id={
                    selectedContact && cresData.phone_N === msgD.author
                      ? "you"
                      : "other"
                  }
                >
                  <div className="message-content">
                    <div>{msgD.message}</div>
                  </div>
                  <div className="message-meta">
                    <div>{msgD.time}</div>
                    <div>{cresData.owner}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <form onSubmit={vicky.handleSubmit}>
            <input
              className="Minput"
              name="message"
              placeholder="Type a message..."
              type="text"
              {...vicky.getFieldProps("message")}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault(); // Prevent default form submission on Enter
                  vicky.handleSubmit();
                }
              }}
            />
            <div className="SimgDiv">
              <img
                className="Simg"
                type="submit"
                src={sendImage}
                alt="Send"
                onClick={vicky.handleSubmit}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;

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
  const [contactList, setContactList] = useState([]);
  const [index, setIndex] = useState(null);

  const moveToStart = () => {
    if (index !== null) {
      const [v] = contactList.splice(index, 1);
      setContactList((prevList) => [v, ...prevList]);
    }
  };

  const join = (data) => {
    socket.emit("join_room", data);
    setMessageList([]);
    setSelectedContact(data);
    if (data) {
      fetch("http://localhost:5001/auth/Chats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          data: JSON.stringify(data),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setMessageList(data);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log("vickyerror");
    }
  };

  const vicky = useFormik({
    initialValues: { message: "" },
    validationSchema: Yup.object({
      message: Yup.string().required("Required"),
    }),
    onSubmit: async (values, actions) => {
      const vals = values.message;
      if (vals !== "" && selectedContact) {
        const messageData = {
          room: selectedContact.roomid,
          author_n: cresData.phone_N,
          authname: cresData.owner,
          sentt_num: selectedContact.c_phonenum,
          message: vals,
          key: "vicky",
          time: new Date().toLocaleTimeString(),
        };
        await socket.emit("send_message", messageData);
        actions.resetForm();
        setMessageList((list) => [...list, messageData]);
        moveToStart();
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
            setContactList((prevList) => [data, ...prevList]);
            setIndex(0);
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
        setContactList(data.list);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
      moveToStart();
    };

    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  const togglePopup = () => {
    setPopup(!popup);
  };

  return (
    <div className="chatPage">
      <div className="container">
        <button className="Create" onClick={togglePopup}>
          CREATE
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
          {contactList.map((contact, index) => (
            <div
              key={index}
              className="contact"
              onClick={() => {
                setIndex(index);
                setSelectedContact(contact);
                join(contact);
              }}
            >
              <p>{contact.c_name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="chatdiv">
        <div className="chat-header">
          <h1 className="H1">CLive</h1>
        </div>
        {messageList.length !== 0 && (
          <div className="chat-body">
            {messageList.map((messageContent, index) => (
              <div
                key={index}
                className="message"
                id={
                  selectedContact &&
                  cresData.phone_N === messageContent.author_n
                    ? "you"
                    : "other"
                }
              >
                <div
                  className="msgdiv"
                  id={
                    selectedContact &&
                    cresData.phone_N === messageContent.author_n
                      ? "you"
                      : "other"
                  }
                >
                  <div
                    className="msg"
                    id={
                      selectedContact &&
                      cresData.phone_N === messageContent.author_n
                        ? "you"
                        : "other"
                    }
                  >
                    <div className="message-content">
                      <div>{messageContent.message}</div>
                    </div>
                    <div className="message-meta">
                      <div>{messageContent.time}</div>
                      <div>{messageContent.authname}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedContact && (
          <div
            className="chat-footer"
            onClick={popup ? togglePopup : undefined}
          >
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
        )}
      </div>
    </div>
  );
}

export default Chat;

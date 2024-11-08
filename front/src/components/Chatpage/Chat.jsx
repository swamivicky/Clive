import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useFormik } from "formik";
import * as Yup from "yup";
import sendImage from "./send.jfif";
let socket;
function Chat() {
  const [messageList, setMessageList] = useState([]);
  const [popup, setPopup] = useState(false);
  const [cresData, setCresData] = useState();
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactList, setContactList] = useState([]);
  const [index, setIndex] = useState(null);
  const token = localStorage.getItem("Token");
  const [currentTime, setCurrentTime] = useState({
    date: "",
    time: "",
  });
  const updateDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Add 1 to get 1-12 range
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    setCurrentTime({
      date: formattedDate,
      time: formattedTime,
    });
  };

  useEffect(() => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("Token");

    // Initialize socket with extra headers
    socket = io("http://localhost:5001", {
      extraHeaders: {
        token: token,
      },
    });
    setContactList([]);
    // Handle connection event
    socket.on("connect", () => {
      console.log("Connected to server");
      // You can also send an authentication message if needed
      if (token) {
        socket.emit("authenticate", { token });
      }
    });

    // Handle disconnection event
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket.emit("custom-disconnect", { token });
    });

    // Handle beforeunload event to notify server before tab is closed
    const handleBeforeUnload = (event) => {
      if (token) {
        socket.emit("custom-disconnect", { token });
      }
      // Add an optional message if you want to prompt the user
      // event.returnValue = 'Are you sure you want to leave?';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const receiveMessageHandler = (data) => {
      console.log(data);
      console.log(selectedContact);

      // Make a copy of contactList using spread operator
      const updatedContacts = [...contactList];

      // Check if selectedContact is null or data.sentt_num is not equal to selectedContact.c_phonenum
      if (
        selectedContact === null ||
        data.sentt_num !== selectedContact.c_phonenum
      ) {
        // Iterate through the copied contactList
        for (let i = 0; i < updatedContacts.length; i++) {
          console.log(updatedContacts[i].notifications);
          if (updatedContacts[i].c_phonenum === data.sentt_num) {
            // Update notifications count using ++notifications
            updatedContacts[i] = {
              notifications: updatedContacts[i].notifications + 1, // Increment notifications
            };
            console.log(updatedContacts[i].notifications); // Log updated notifications count
            break; // Exit loop since we found the contact
          }
          console.log(updatedContacts[i]);
        }
        // Update state with the modified contact list
        setContactList(updatedContacts);
      } else {
        // If selectedContact is not null and data.sentt_num matches selectedContact.c_phonenum
        setMessageList((list) => [...list, data]); // Add new message to message list
        moveToStart(); // Move selected contact to start (assuming this is a function you have)
      }
    };

    const receiveStatus = (data) => {
      console.log(`receive: ${data}`);
      const contact = [...contactList];
      console.log(contact); // Create a copy of the contact list
      for (let i = 0; i < contact.length; i++) {
        if (contact[i].c_phonenum === data) {
          contact[i] = { ...contact[i], status: "1" }; // Update the status
        }
      }
      setContactList(contact); // Update the state with the modified list
    };
    const receiveOffstatus = (data) => {
      console.log(`receive: ${data}`);
      const contact = [...contactList];
      console.log(contact); // Create a copy of the contact list
      for (let i = 0; i < contact.length; i++) {
        if (contact[i].c_phonenum === data) {
          contact[i] = { ...contact[i], status: "0" }; // Update the status
        }
      }
      setContactList(contact); // Update the state with the modified list
    };

    socket.on("onStatus", receiveStatus);
    socket.on("offStatus", receiveOffstatus);
    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("onStatus", receiveStatus);
      socket.off("offStatus", receiveOffstatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, contactList, selectedContact]); // Added contactList and selectedContact as dependencies

  useEffect(() => {
    fetch("http://localhost:5001/Clive", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then(async (data) => {
        await setCresData(data.v);
        setContactList(data.list);
      })
      .catch((err) => {
        console.error(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToStart = () => {
    if (index !== null) {
      const [v] = contactList.splice(index, 1);
      setContactList((prevList) => [v, ...prevList]);
    }
  };
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

      fetch("http://localhost:5001/Create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(vals),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            console.log(data);
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

  const join = (data) => {
    setMessageList([]);
    setSelectedContact(data);
    if (data) {
      fetch("http://localhost:5001/Chats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
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
    console.log(selectedContact);
  };

  const vicky = useFormik({
    initialValues: { message: "" },
    validationSchema: Yup.object({
      message: Yup.string().required("Required"),
    }),
    onSubmit: async (values, actions) => {
      updateDateTime();
      const vals = values.message;
      if (
        vals !== "" &&
        selectedContact &&
        currentTime.date &&
        currentTime.time
      ) {
        const messageData = {
          author_n: cresData.phone_N,
          authname: cresData.owner,
          sentt_num: selectedContact.c_phonenum,
          message: vals,
          key: "vicky",
          date: currentTime.date,
          time: currentTime.time,
        };

        await socket.emit("send_message", messageData);
        actions.resetForm();
        setMessageList((list) => [...list, messageData]);
        moveToStart();
      }
    },
  });

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
        {console.log(contactList)}
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
              <p>{contact.status}</p>
              <p>{contact.notifications}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="chatdiv">
        <div className="chat-header">
          <h1 className="H1">CLive</h1>
        </div>
        {console.log(messageList)}
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
                      <div>{messageContent.date}</div>
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

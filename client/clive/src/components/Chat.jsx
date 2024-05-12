import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import sendImage from './send.jfif';
const socket = io.connect("http://localhost:5001");

function Chat() {
  const [messageList, setMessageList] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [resData, setResData] = useState("");
  const [popup, setPopup] = useState(false);
  const [pn,setPn]=useState()

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: resData.phonenumber,
        author: resData.username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
      setMessageList((list) => [...list, messageData]);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5001/auth/Clive", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

      })
        .then((res) => {
          console.log(res.json);
          return res.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
    
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    // Cleanup the event listener when the component is unmounted
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  const togglePopup = () => {
    setPopup(!popup);
  };
const Create = ()=>{
  fetch("http://localhost:5001/auth/Create", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ PhoneNumber: pn }),
       
      })
        .then((res) => {
      
          if (!res || !res.ok || res.status >= 400) {
            throw new Error("Failed to log in");
          }
          return res.json();
        })
        .then((data) => {
          console.log(data);
          setPn("");
        })
        .catch((err) => {
          console.error(err);
        });
    
}
  return (
    <div className="chatPage">
      <div className="container">
        <button className="Create" onClick={togglePopup}>
          Create New Contact
        </button>
        {popup && (
          <div className="contactCreateDiv">
            <div
              className="content_createContact"
            >
              <h2>Enter Phone Number</h2>
             <input
            placeholder="PhoneNumber ..."
            value={pn}
            onChange={(event) => setPn(event.target.value)}
            onKeyPress={(event) => {
              event.key === "Enter" && Create();
            }}
          />
              <button onClick={Create}>Create</button>
            </div>
          </div>
        )}

        <div className="contacts" onClick={popup ? togglePopup : undefined}>
          hello
        </div>
      </div>
      <div className="chatdiv" onClick={popup ? togglePopup : undefined}>
        <div className="chat-header">
          <p>{`Live Chat --- ${resData.username}`}</p>
        </div>
        <div className="chat-body">
          {messageList.map((messageContent, index) => (
            <div
              key={index}
              className="message"
              id={resData.username === messageContent.author ? "you" : "other"}
            >
              <div
                className="msgdiv"
                id={
                  resData.username === messageContent.author ? "you" : "other"
                }
              >
                <div
                  className="msg"
                  id={
                    resData.username === messageContent.author ? "you" : "other"
                  }
                >
                  <div className="message-content">
                    <div>{messageContent.message}</div>
                  </div>
                  <div className="message-meta">
                    <div>{messageContent.time}</div>
                    <div>{messageContent.author}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input
            className="Minput"
            placeholder="Type a message..."
            value={currentMessage}
            onChange={(event) => setCurrentMessage(event.target.value)}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <div className="SimgDiv">
            <img className="Simg" src={sendImage} alt="Send" onClick={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
const socket = io.connect("http://localhost:5001");

function Chat() {
  const [messageList, setMessageList] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [resData, setResData] = useState("");
  const [popup, setPopup] = useState(false);
  const contentCreateContactRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contentCreateContactRef.current &&
        !contentCreateContactRef.current.contains(event.target)
      ) {
        setPopup(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="chatPage">
      <div className="contacts">
        <button className="close" onClick={togglePopup}>
          Create New Contact
        </button>
        {popup && (
          <div className="contactCreateDiv">
            <div
              ref={contentCreateContactRef}
              className="content_createContact"
            >
              <h2>Enter Phone Number</h2>
              <input />
              <button>Create</button>
            </div>
          </div>
        )}
      </div>
      <div className="chatdiv">
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
            placeholder="Type a message..."
            value={currentMessage}
            onChange={(event) => setCurrentMessage(event.target.value)}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;

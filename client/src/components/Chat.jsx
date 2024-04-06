import React, { useEffect, useState } from "react";

//import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [messageList, setMessageList] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
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
      console.log(data);
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    // Cleanup the event listener when the component is unmounted
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  return (
    <>
      <div className="wholechat">
        <div className="chat-header">
          <p>{`Live Chat --- ${username}`}</p>
        </div>
        <div className="chat-body">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div
                  className="msgdiv"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div
                    className="msg"
                    id={username === messageContent.author ? "you" : "other"}
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
            );
          })}
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
    </>
  );
}

export default Chat;

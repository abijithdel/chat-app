const StatusId = document.getElementById("statusid");
const updateid = StatusId.value;

const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const chatbox = document.getElementById("chat-box");
const username = document.getElementById("chat-username");
var fromid;
var toid;

$(document).ready(function () {
  $(".users").click(function () {
    $(".none").show();
    $(".none-mes").hide();
    $(".chat-now").hide();
    toid = $(this).find("#toid").text();
    fromid = $("#fromid").text();

    if (window.innerWidth <= 1050) {
      $(".user-div").hide();
      $(".chat-div").show();
    }

    $.ajax({
      url: `/user`,
      type: "GET",
      data: { userId: toid },
      success: function (response) {
        username.innerHTML = response;
      },
      error: function (error) {
        console.error("Error retrieving user data:", error);
      },
    });

    $.ajax({
      url: `/get-chat/${fromid}/${toid}`,
      type: "GET",
      success: function (response) {
        if (response.success) {
          
          chatbox.innerHTML = "";

          if (response.room) {
            const roomChat = response.RoomHistory;

            for (var x in roomChat) {
              const chat = document.createElement("p");
              chat.innerHTML = `${roomChat[x].username}: ${roomChat[x].message}`;
              chatbox.appendChild(chat);
            }
          } else {
            const chatHistory = response.chatHistory;
            for (var x in chatHistory) {
              const text = document.createElement("p");
              text.innerText = `${chatHistory[x].fromUname}: ${chatHistory[x].message}`;
              chatbox.appendChild(text);
            }
          }
        }
      },
      error: function (error) {
        console.error("Error retrieving user data:", error);
      },
    });

    socket.emit("JoinRoom", fromid, toid);

    chatbox.innerHTML = "";
  });

  socket.emit("login", updateid);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("PMessage", input.value, fromid, toid);
      input.value = "";
    }
  });

  socket.on("PMChat", function (msg, email) {
    console.log(msg);
    const item = document.createElement("p");
    item.textContent = `${email}: ${msg}`;
    chatbox.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  $(".dmenu").click(function () {
    if ($(".dropdown-menu").css("display") === "none") {
      $(".dropdown-menu").show();
    } else if ($(".dropdown-menu").css("display") === "block") {
      $(".dropdown-menu").hide();
    }
  });

  $("#create-room").click(function () {
    $(".group-popup").show();
  });

  $("#close-popup").click(function () {
    $(".group-popup").hide();
  });
});

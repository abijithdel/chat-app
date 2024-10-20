const StatusId = document.getElementById('statusid'); 
const updateid = StatusId.value; 

const socket = io()
const form = document.getElementById("form");
const input = document.getElementById("input");
const chatbox = document.getElementById("chat-box");
const username = document.getElementById('chat-username')
var fromid;
var toid;

$(document).ready(function () {
  $(".users").click(function () {
    $(".none").show();
    toid = $(this).find("#toid").text();
    fromid = $("#fromid").text();

    $.ajax({
      url: `/user`, 
      type: "GET",
      data: { userId: toid }, 
      success: function (response) {
        username.innerHTML = response
      },
      error: function (error) {
        console.error("Error retrieving user data:", error);
      },
    });

    socket.emit("JoinRoom", fromid, toid);

    chatbox.innerHTML = "";
  });

  socket.emit('login', updateid)


  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit("PMessage", input.value, fromid, toid);
      input.value = "";
    }
  });

  socket.on("PMChat", function (msg, email) {
    console.log(msg)
    const item = document.createElement("p");
    item.textContent = `${email}: ${msg}`;
    chatbox.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
});

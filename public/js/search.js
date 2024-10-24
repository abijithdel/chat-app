$(document).ready(function () {
  $(".users").click(function () {
    var id = $(this).find("#uid").text();
    console.log(id);

    $.ajax({
      url: `/add-contact/${id}`,
      type: "GET",
      success: function (response) {
        console.log(response)
        window.location.href = "/";
      },
      error: function (error) {
        console.error("Error retrieving user data:", error);
      },
    });
  });
});

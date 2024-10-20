const mongoos = require("mongoose");

const UserSchema = new mongoos.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Boolean, default: false },
});

module.exports = mongoos.model("user", UserSchema);

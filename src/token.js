const Storage = require("node-storage");
const Terminal = require("./terminal.js");

var store = new Storage("secrets.json");

function getToken() {
  return store.get("token");
}

function setToken(token) {
  store.put("token", token);
}

async function checkToken() {
  let token = getToken();
  if (!token) {
    token = await Terminal.startToken();
    setToken(token);
    console.log("Token set correctly");
  }
  return token;
}

async function resetToken() {
  const token = await Terminal.resetToken();
  setToken(token);
  console.log("Token set correctly");
  return token;
}

module.exports = {
  getToken,
  setToken,
  resetToken,
  checkToken,
};

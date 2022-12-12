(async () => {
  await require("./startup/db")();
  await require("./startup/bot")();
})();

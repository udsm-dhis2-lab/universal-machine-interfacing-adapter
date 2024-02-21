const run = async () => {
  try {
    console.log("CONSOLE.LOGGING!!!!!!!!!!");
  } catch (e) {
    console.log(
      "🚫 ERROR WHILE UPDATING SYNC STATUS ",
      e.message.toUpperCase(),
      " 🚫"
    );
  }
};
run();

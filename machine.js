const { createMachine, assign } = require("xstate");
const User = require("./models/user");

const checkPassword = (event, ctx) => {
  return new Promise(async (resolve, rejected) => {
    if (event.data.password === ctx.PASSWORD) {
      //creating new user and saved to database
      const user = new User({
        email: ctx.EMAIL,
      });
      user
        .save()
        .then(() => {
          event.data.ctx.reply("Thanks for using the bot");
          resolve("Successfully Saved");
        })
        .catch((err) => {
          event.data.ctx.reply("Something Went Wrong!");
          rejected("Something Went Wrong!");
        });
    } else {
      event.data.ctx.reply("Wrong Password");
      rejected("Wrong Password");
    }
  });
};

//Creting a machine
const machine = createMachine({
  id: "mybotmachine",
  initial: "idle",
  predictableActionArguments: true,
  context: {
    PASSWORD: "Manas@123",
    EMAIL: "",
    isAuthenticated: false,
    isEmailValidate: false,
  },
  states: {
    idle: {
      on: {
        START: "emailValidate",
      },
    },
    emailValidate: {
      on: {
        EMAILVALIDATE: {
          target: "passwordValidate",
          cond: (context, event) => {
            if (
              /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                event.data.email
              )
            ) {
              return true;
            } else {
              event.data.ctx.reply("enter a valid email address");
              return false;
            }
          },
          actions: assign((ctx, event) => {
            event.data.ctx.reply("enter password");
            return { isEmailValidate: true, EMAIL: event.data.email };
          }),
        },
      },
    },
    passwordValidate: {
      on: {
        PASSWORDVALIDATE: "loading",
      },
    },
    loading: {
      invoke: {
        id: "checkPassword",
        src: (ctx, event) => checkPassword(event, ctx),
        onDone: {
          target: "success",
          actions: assign({ isAuthenticated: true }),
        },
        onError: {
          target: "error",
        },
      },
    },
    error: {
      on: {
        PASSWORDVALIDATE: "loading",
      },
    },
    success: {
      type: "final",
    },
  },
});

module.exports = machine;

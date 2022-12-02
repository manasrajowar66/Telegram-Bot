require("dotenv").config();
const { createMachine, assign } = require("xstate");
const User = require("./models/User");

//Creting a machine
const machine = createMachine(
  {
    id: "mybotmachine",
    initial: "idle",
    predictableActionArguments: true,
    context: {
      PASSWORD: process.env.FIXED_USER_PASSWORD,
      EMAIL: "",
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
            cond: "checkEmail",
            actions: assign((ctx, event) => {
              event.data.ctx.reply("enter password");
              return { EMAIL: event.data.email };
            }),
          },
        },
      },
      passwordValidate: {
        on: {
          PASSWORDVALIDATE: {
            target: "success",
            cond: "checkPassword",
            actions: (ctx, event) => {
              //creating new user and saved to database
              const user = new User({
                email: ctx.EMAIL,
              });
              user
                .save()
                .then(() => {
                  event.data.ctx.reply("Thanks for using the bot");
                })
                .catch((err) => {
                  event.data.ctx.reply("Something Went Wrong!");
                });
            },
          },
        },
      },
      success: {
        type: "final",
      },
    },
  },
  {
    actions: {},
    guards: {
      checkPassword: (ctx, event) => {
        if (event.data.password === ctx.PASSWORD) {
          return true;
        } else {
          event.data.ctx.reply("Wrong Password");
          return false;
        }
      },
      checkEmail: (ctx, event) => {
        if (
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(event.data.email)
        ) {
          return true;
        } else {
          event.data.ctx.reply("enter a valid email address");
          return false;
        }
      },
    },
  }
);

module.exports = machine;

const telegraf = require('telegraf')
const axios = require('axios');
const { createMachine, interpret, assign } = require('xstate')

let isAuthenticated, isEmailValidate

const checkPassword = (event, ctx) => {
    return new Promise(async (resolve, rejected) => {
        if (event.data.password === ctx.PASSWORD) {
            event.data.ctx.reply('Thanks for using the bot')
            await axios({
                method: 'post',
                url: "https://react-http-632e6-default-rtdb.firebaseio.com/telegram.json",
                data: JSON.stringify({
                    email: ctx.EMAIL
                })
            });
            resolve('success')
        } else {
            event.data.ctx.reply('Wrong Password')
            rejected('Wrong Password')
        }
    })
}

//Creting a machine
const machine = createMachine({
    id: 'mybotmachine',
    initial: 'idle',
    predictableActionArguments: true,
    context: {
        PASSWORD: 'Manas@123',
        EMAIL: '',
        isAuthenticated: false,
        isEmailValidate: false,
    },
    states: {
        idle: {
            on: {
                START: 'emailValidate',
            },
        },
        emailValidate: {
            on: {
                EMAILVALIDATE: {
                    target: 'passwordValidate',
                    cond: (context, event) => {
                        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                            event.data.email,
                        )) {
                            return true;
                        } else {
                            event.data.ctx.reply('enter a valid email address')
                            return false;
                        }
                    },
                    actions: assign((ctx, event) => {
                        event.data.ctx.reply('enter password')
                        return { isEmailValidate: true, EMAIL: event.data.email }
                    }),
                },
            },
        },
        passwordValidate: {
            on: {
                PASSWORDVALIDATE: 'loading',
            },
        },
        loading: {
            invoke: {
                id: 'checkPassword',
                src: (ctx, event) => checkPassword(event, ctx),
                onDone: {
                    target: 'success',
                    actions: assign({ isAuthenticated: true }),
                },
                onError: {
                    target: 'error',
                },
            },
        },
        error: {
            on: {
                PASSWORDVALIDATE: 'loading',
            },
        },
        success: {
            type: 'final',
        },
    },
})

const service = interpret(machine).onTransition((state) => {
    console.log(state.value, state.context)
    isAuthenticated = state.context.isAuthenticated
    isEmailValidate = state.context.isEmailValidate
})

service.start()

//Telegraf Bot create
const bot = new telegraf('5710712849:AAG2PnYjwpgc6zZhOicY2lDglCFEy28607A')

bot.start((ctx) => {
    ctx.reply('Enter Your Email')
    service.send('START')
})

bot.help((ctx) => {
    ctx.reply('You enter the help command!')
})

bot.settings((ctx) => {
    ctx.reply('You enter the settings command!')
})

bot.on('text', (ctx) => {
    if (!isAuthenticated) {
        if (!isEmailValidate) {
            let email = ctx.message.text
            service.send({ type: 'EMAILVALIDATE', data: { email, ctx } })
        } else {
            let password = ctx.message.text
            service.send({ type: 'PASSWORDVALIDATE', data: { password, ctx } })
        }
    }
})

bot.launch()

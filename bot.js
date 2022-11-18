const telegraf = require('telegraf')
const { createMachine, interpret } = require('xstate')

let isEmailValidate = false,
    isPasswordValidate
const PASSWORD = 'Manas@123'
const checkPassword = (event) => {
    return new Promise((resolve, rejected) => {
        if (event.data.password === PASSWORD) {
            isPasswordValidate = true
            event.data.ctx.reply('Thanks for using the bot')
            resolve('success')
        } else {
            event.data.ctx.reply('Wrong Password')
            rejected('Wrong Password')
        }
    })
}
const machine = createMachine({
    id: 'mybotmachine',
    initial: 'idle',
    predictableActionArguments: true,
    context: {},
    states: {
        idle: {
            on: { SUBMIT: 'loading' },
        },
        loading: {
            invoke: {
                id: 'checkPassword',
                src: (ctx, event) => checkPassword(event),
                onDone: {
                    target: 'success',
                },
                onError: {
                    target: 'error',
                },
            },
        },
        error: {
            on: {
                SUBMIT: 'loading',
            },
        },
        success: {
            type: 'final',
        },
    },
})

const service = interpret(machine).onTransition((state) => {
    console.log(state.value)
    isPasswordValidate = state.context.isPasswordValidate
})

service.start()

const bot = new telegraf('5710712849:AAG2PnYjwpgc6zZhOicY2lDglCFEy28607A')

bot.start((ctx) => {
    ctx.reply('Enter Your Email')
})

bot.help((ctx) => {
    ctx.reply('You enter the help command!')
})

bot.settings((ctx) => {
    ctx.reply('You enter the settings command!')
})

bot.on('text', (ctx) => {
    if (!isEmailValidate || !isPasswordValidate) {
        if (!isEmailValidate) {
            let email = ctx.message.text
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                ctx.reply('enter password')
                isEmailValidate = true
            } else {
                ctx.reply('enter a valid email!')
            }
        } else {
            let password = ctx.message.text
            service.send({ type: 'SUBMIT', data: { password, ctx } })
        }
    }
})

bot.launch()

// 收到消息
import {getChatGPTReply} from "./chatgpt";

// 定义机器人的名称
let botName = "@lzys522";

/**
 * 消息发送
 * @param msg
 * @param isSharding
 * @returns {Promise<void>}
 */
export async function onMessage(msg, isSharding) {
    if (isSharding) {
        await defaultMessage(msg)
    } else {
        await shardingMessage(msg)
    }
}

/**
 * 默认消息发送
 * @param msg
 * @returns {Promise<void>}
 */
async function defaultMessage(msg) {
    const contact = msg.talker(); // 发消息人
    const receiver = msg.to(); // 消息接收人
    const content = msg.text(); // 消息内容
    const room = msg.room(); // 是否是群消息
    const alias = (await contact.alias()) || (await contact.name()); // 发消息人昵称
    const isText = msg.type() === bot.Message.Type.Text; // 消息类型是否为文本
    // TODO 你们可以根据自己的需求修改这里的逻辑，测试记得加限制，我这边消息太多了，这里只处理指定的人的消息
    if (isText) {
        // console.log("🚀🚀🚀 / msg", msg);
        // console.log("🚀🚀🚀 / contact", contact);
        // console.log("🚀🚀🚀 / receiver", receiver);
        // console.log("🚀🚀🚀 / room", room);
        // console.log("🚀🚀🚀 / alias", alias);
        // console.log("🚀🚀🚀 / isText", isText);
        console.log("🚀🚀🚀 / content", content);
        const reply = await getChatGPTReply(content);
        console.log("🚀🚀🚀 / reply", reply);
        try {
            // 如果是群聊   @lzys522 为你群聊当中的名称
            if (room) {
                // 群聊必须为@xx才能发送否则消息太多
                if (content.indexOf(`${botName}`) === -1) {
                    return
                }
                await room.say(reply);
            } else {
                // 表示私人聊天
                await contact.say(reply);
            }
        } catch (e) {
            console.error(e);
        }
    }
}

/**
 * 分片消息发送
 * @param message
 * @returns {Promise<void>}
 */
async function shardingMessage(message) {
    const talker = message.talker();
    const isText = message.type() === bot.Message.Type.Text; // 消息类型是否为文本
    if (talker.self() || message.type() > 10 || talker.name() === "微信团队" && isText) {
        return;
    }
    const text = message.text();
    const room = message.room();
    if (!room) {
        console.log(`Chat GPT Enabled User: ${talker.name()}`);
        const response = await getChatGPTReply(text)
        await trySay(talker, response);
        return;
    }
    let realText = cleanMessage(text);
    // 如果不是指定艾特人那么就不进行发送消息
    if (text.indexOf(`${botName}`) === -1) {
        return;
    }
    realText = text.replace(`${botName}`, "");
    const topic = await room.topic();
    const response = await getChatGPTReply(realText)
    const result = `${realText}\n ----------------\n 个人网站；https://yby6.com \n ---------------------\n ${response}`;
    await trySay(room, result);
}

// 分片长度
const SINGLE_MESSAGE_MAX_SIZE = 500;

/**
 * 发送
 * @param talker 发送哪个  room为群聊类 text为单人
 * @param msg
 * @returns {Promise<void>}
 */
async function trySay(talker, msg) {
    const messages = [];
    let message = msg;
    while (message.length > SINGLE_MESSAGE_MAX_SIZE) {
        messages.push(message.slice(0, SINGLE_MESSAGE_MAX_SIZE));
        message = message.slice(SINGLE_MESSAGE_MAX_SIZE);
    }
    messages.push(message);
    for (const msg of messages) {
        await talker.say(msg);
    }
}

async function cleanMessage(text){
    let realText = text;
    const item = text.split("- - - - - - - - - - - - - - -");
    if (item.length > 1) {
        realText = item[item.length - 1];
    }
    return realText;
}

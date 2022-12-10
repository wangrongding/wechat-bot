import {getChatGPTReply} from "./chatgpt.js";

// 定义机器人的名称
let botName = "@lzys522";

/**
 * 默认消息发送
 * @param msg
 * @param bot
 * @returns {Promise<void>}
 */
export async function defaultMessage(msg, bot) {
    const contact = msg.talker(); // 发消息人
    const receiver = msg.to(); // 消息接收人
    const content = msg.text(); // 消息内容
    const room = msg.room(); // 是否是群消息
    let roomName = (await room.topic()) || "不是群聊消息." // 群名称
    const alias = (await contact.alias()) || (await contact.name()); // 发消息人昵称
    const isText = msg.type() === bot.Message.Type.Text; // 消息类型是否为文本
    // TODO 你们可以根据自己的需求修改这里的逻辑，测试记得加限制，我这边消息太多了，这里只处理指定的人的消息
    const isRoom = ["测试ai机器人", "这里填写更加多的群聊名称"].includes(roomName)
    const isAlias = ["杨不易呀", "这里填写更加多的私聊人名称(如果设置了备注那么就填写备注)"].includes(alias)
    if ((isAlias || isRoom) && isText) {
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
            // 如果是群聊  @lzys522 为你群聊当中的名称
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
 * @param bot
 * @returns {Promise<void>}
 */
export async function shardingMessage(message, bot) {
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
    let realText = splitMessage(text);
    // 如果是群聊但不是指定艾特人那么就不进行发送消息
    if (text.indexOf(`${botName}`) === -1) {
        return;
    }
    realText = text.replace(`${botName}`, "");
    const topic = await room.topic();
    const response = await getChatGPTReply(realText)
    const result = `${realText}\n ---------------- \n ${response}`;
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

/**
 * 分组消息
 * @param text
 * @returns {Promise<*>}
 */
async function splitMessage(text) {
    let realText = text;
    const item = text.split("- - - - - - - - - - - - - - -");
    if (item.length > 1) {
        realText = item[item.length - 1];
    }
    return realText;
}

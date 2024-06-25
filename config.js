import dotenv from 'dotenv'
// 加载环境变量
dotenv.config()
const env = dotenv.config().parsed // 环境参数

// 定义机器人的名称，这里是为了防止群聊消息太多，所以只有艾特机器人才会回复，
// 这里不要把@去掉，在@后面加上你启动机器人账号的微信名称
// 从环境变量中导入机器人的名称
const botName = env.BOT_NAME;

// 从环境变量中导入联系人白名单
const aliasWhiteList = env.ALIAS_WHITELIST ? env.ALIAS_WHITELIST.split(',') : [];

// 从环境变量中导入群聊白名单
const roomWhiteList = env.ROOM_WHITELIST ? env.ROOM_WHITELIST.split(',') : [];

// 导出机器人的名称、群聊白名单和联系人白名单
export { botName, roomWhiteList, aliasWhiteList };
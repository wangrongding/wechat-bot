// 定义机器人的名称，这里是为了防止群聊消息太多，所以只有艾特机器人才会回复，
// 这里不要把@去掉，在@后面加上你启动机器人账号的微信名称
export const botName = '@可乐'

// 群聊白名单，白名单内的群聊才会自动回复
export const roomWhiteList = ['群名称', '测试群', '测试群2']

// 联系人白名单，白名单内的联系人才会自动回复
export const aliasWhiteList = process.env.ALIAS_WHITELIST ? process.env.ALIAS_WHITELIST.split(',') : [];

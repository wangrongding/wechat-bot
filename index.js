const qrTerm = require("qrcode-terminal");
const Wechaty = require("wechaty");

const { ScanStatus, WechatyBuilder, log } = Wechaty;

function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerm.generate(qrcode, { small: true }); // show qrcode on console

    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");

    log.info(
      "StarterBot",
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );
  } else {
    log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
  }
}

// get a Wechaty instance
const bot = WechatyBuilder.build({
  name: "wechat-bot",
  puppet: "wechaty-puppet-wechat",
});

// emit when the bot needs to show you a QR Code for scanning
bot
  .on("scan", onScan)
  .on("login", (user) => {
    onLogin(user);
  })
  .on("logout", (user) => console.log(`User ${user} logout`))
  .on("message", (message, a, b) => {
    console.log(`Message: ${message}`);
    console.log("🚀", message, a, b);
  });

// start the bot
bot
  .start()
  .then(() => log.info("StarterBot", "Starter Bot Started."))
  .catch((e) => log.error("StarterBot", e));

function onLogin(user) {
  console.log(`User ${user} logined`);
  // setTimeout(() => {
  //   getContact();
  // }, 10000);
}
function onMessage(message) {
  console.log(`Message: ${message}`);
}

async function getContact() {
  const contact = await bot.Contact.find({ name: "曹淑杭" }); //微信名称
  console.log(contact, "contact===========");
  // contact && contact.say(`hello world`);
  bot.say("hello!");
  // find a room
  const room = await bot.Room.find({ topic: "掘金️中秋创意投稿大赛1" });
  console.log(room, "room===========");
}

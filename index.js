const { Client, ActivityType, GatewayIntentBits, REST, Routes, EmbedBuilder, AttachmentBuilder,} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const config = require('./config.json');
const setTitle = require("node-bash-title");
const date = require('date-and-time');

//if found err node will kill you bot so you should use try catch for get error but node can't kill your bot 

setTitle("Developing") // set commandprompt to Developing

client.on('ready', async () => {

  console.clear()
  console.log((`Logged in as ${client.user.username}!`));
  await client.user.setPresence({ //bot status
    activities: [{
      name: 'name', 
      type: ActivityType.Streaming, //what is bot doing : streaming, watching, playing and listening
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' //only streaming if you use other you should delete this line
    }],
    status: 'online'
  });
  await registercommand(config["TOKEN"], client.user.id);
});

client.on ('messageCreate', (message) => {
  const content = message.content.toLowerCase(); //for change english capital letters to lowercase
  if(['hello','ohiyo'].includes(content)) { // same if(content === 'hello' || coontent === 'hi')
    message.channel.send('hi');
  }
  if(content === 'name') {
    message.channel.send(client.user.username);
  }
});

function sleep(ms) { // sleep function for delay 
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  let txt = ""
  const member = interaction.options.getMember('member'); //get membername from option
  const role = interaction.options.getRole('role'); //get rolename from option
  const nickname = interaction.options.getString('nickname'); //get nickname from option
  if (interaction.commandName === 'hello') {
    await interaction.reply('Hi');
  }
  if (interaction.commandName === 'daytime') {
    await interaction.reply("กำลังดึงข้อมูลจากเซิฟเวอร์")
    try {
      const now = new Date(); //data from server running Node.js
      txt += `Date : ${date.format(now, 'YYYY/MM/DD')}`
      txt += `\nTime : ${date.format(now, 'hh:mm A')}`
      txt += `\nTimezone : ${date.format(now, 'ZZ')}` 
      let embed = new EmbedBuilder()
        .setDescription(txt)
      await interaction.editReply({
        content: "",
        embeds: [embed]
      });
    }
    catch (error) {
      console.log(error);
    }
  }
  if (interaction.commandName === 'kick') {
    if (!member) { //when member is null
      await interaction.reply('not found member!');
      return;
    }
    try {
      await member.kick(); // kick member
      txt += `${member.user.username} were kicked off the server by ${interaction.member.displayName} because : ${interaction.options.getString('reason')}` 
      let embed = new EmbedBuilder()
        .setDescription(txt)
      await interaction.editReply({
        content: "",
        embeds: [embed]
      });
    } 
    catch (error) {
        console.log(error);
        await interaction.reply('เกิดข้อผิดพลาดในการเตะสมาชิกที่คุณเลือก');
    }
  }
  if (interaction.commandName === 'ban') { 
    if (!member) { //when member is null
      await interaction.reply('not found member!');
      return;
    }
    try {
      await interaction.guild.members.ban(member, { reason: interaction.options.getString('reason') }); //ban command must have alway reason
      txt += `${member.user.username} were ban off the server by ${interaction.member.displayName} because : ${interaction.options.getString('reason')}`
      let embed = new EmbedBuilder()
        .setDescription(txt)
      await interaction.editReply({
        content: "",
        embeds: [embed]
      });
    } 
    catch (error) {
      console.log(error);
      await interaction.editReply('เกิดข้อผิดพลาดในการแบนสมาชิกที่คุณเลือก');
    }
  }
  if (interaction.commandName === 'ping') {
    await interaction.reply("checking ping... 0/10")
    try {
      let sum = 0;
      for (let i = 1; i <= 10; i++) { //loop
        const start = Date.now(); //time before send message
        await interaction.editReply(`checking ping... ${i}/10`);
        const end = Date.now(); //time after send message
        const delay = end-start;
        sum += delay; //keep all delay by +
      }
      const latency =  Math.floor(sum/10); //average ping 
      await interaction.editReply('กรุณารอสักครู่');
      txt += "**Latency Bot**"
      txt += `\nBot : ${client.user.username}`
      txt += `\nLatency : ${latency}ms`
      let embed = new EmbedBuilder()
        .setDescription(txt)
      await interaction.editReply({
        content: "",
        embeds: [embed]
      });
    }
    catch (error) {
      console.log(error);
    }
  }
  if (interaction.commandName === 'picture') {
    await interaction.reply({ content: '', ephemeral: true }); //ephemeral for only you can see it
    try {
      const attachment = new AttachmentBuilder('./picture/example.jpg'); //AttachmentBuilder is attachmentmessage v.14
      const embed = {
        title: 'Donate',
        description: 'คุณสามารถสนับสนุนเราโดยการสแกน QR Code ด้านล่าง',
        image: { url: 'attachment://donate.jpg' } //location attachment
      };
      await interaction.editReply({ content: '', embeds: [embed], files: [attachment] });
    } 
    catch (error) {
      console.log(error);
    }
  }
  if (interaction.commandName === 'nickname-new'){
    try {
      member.setNickname(nickname); //setnickname from option
    }
    catch(error) {
      console.log(error);
    }
  }
  if (interaction.commandName === 'nickname-remove') {
    if (member.nickname === null) {
      return;
    }
    try {
      
      member.setNickname(null) //setnickname to null for remove nickname
    }
    catch (error) {
      console.log(error);
      await interaction.editReply(`เกิดข้อผิดพลาดในการลบชื่อเล่นของ${member.user.username}`);
    }
  }
});

async function registercommand(token, clienid) {
  const roles = []; //set role = 0 in []
  const roleChoices = roles.map(role => ({ //
    name: role.name,
    value: role.id
  }));
  const members = []; //set member = 0 in []
  const memberschoices = members.map(member => ({
    name: member.displayName,
    value: member.id
  }))

  const commands = [
    {
      name: "hello",
      description: "test command"
    },
    {
      name: "daytime",
      description : "check date and time"
    },
    {
      options: [
        {
          type: 6, //type 6 is member
          name: "member",
          description: "member name for kick of",
          required: true, 
          choice: memberschoices
        },
        {
          type: 3, // type 3 is string
          name: "reason",
          description: "reason for kick off",
          required: true
        }
      ],
      name: "kick",
      description : "kick off member"
    },
    {
      options: [
        {
          type: 6, //type 6 is member
          name: "member",
          description: "ชื่อสมาชิกที่ต้องการแบน",
          required: true,
          choice: memberschoices
        },
        {
          type: 3, // type 3 is string
          name: "reason",
          description: "เหตุผลที่แบน",
          required: true
        }
      ],
      name: "ban",
      description : "แบนสมาชิก"
    },
    {
      name: "ping",
      description: "check ping bot"
    },
    {
      name: "picture",
      description: "test picture"
    },
    {
      options: [
        {
          type: 3, //type 3 is string
          name: "nickname",
          description: "nickname",
          required: true
        },
        {
          type: 6, //type 6 is member
          name: "member",
          description: "member",
          required: true
        }
      ],
      name: "nickname-new",
      description: "nickname create"
    },
    {
      options: [
        {
          type: 6, //type 6 is member
          name: "member",
          description: "member",
          required: true
        }
      ],
      name: "nickname-remove",
      description: "nickname remove"
    },
  ];

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`\nStarted refreshing application commands.`);
    await rest.put(Routes.applicationCommands(clienid), { body: commands });
    console.log(`Successfully reloaded application commands.`);

    client.guilds.cache.forEach(guild => { //fetch id server
      if (!guild) {
        console.log('\nGuild not found!');
        return;
      }
    });

  } catch (error) {
    console.log(error);
  }
}

client.login(config["TOKEN"]);
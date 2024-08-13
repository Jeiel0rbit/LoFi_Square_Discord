const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const TOKEN = 'token'; // Substitua pelo seu token

const stations = [
    { name: '1/2', url: 'url' },
    { name: '2/2', url: 'url' },
];

let currentStationIndex = 0;

client.once('ready', () => {
    console.log(`Bot está online como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.content === '!join') {
        if (message.member.voice.channel) {
            const channel = message.member.voice.channel;

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(stations[currentStationIndex].url);
            player.play(resource);

            player.on(AudioPlayerStatus.Playing, () => {
                console.log(`Reproduzindo música: ${stations[currentStationIndex].name}`);
            });

            connection.subscribe(player);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('changeStation')
                        .setLabel('Mudar Estação')
                        .setStyle(ButtonStyle.Primary) // Use ButtonStyle.Primary para estilo primário
                );

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('LoFi Square')
                .setDescription(`Tocando agora: ${stations[currentStationIndex].name}`);

            await message.channel.send({ embeds: [embed], components: [row] });

        } else {
            message.reply('Você precisa estar em um canal de voz para eu me juntar!');
        }
    }

    if (message.content === '!leave') {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            message.reply('Desconectado do canal de voz!');
        } else {
            message.reply('Não estou em um canal de voz!');
        }
    }

    if (message.content === '!Shelp') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Comandos do LoFi Square')
            .setDescription('Aqui estão os comandos que você pode usar:')
            .addFields(
                { name: '!join', value: 'Entra no canal de voz e começa a tocar a estação atual.' },
                { name: '!leave', value: 'Sai do canal de voz.' },
                { name: '!Shelp', value: 'Exibe esta mensagem de ajuda.' }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Visite o Web Player')
                    .setStyle(ButtonStyle.Link) // Use ButtonStyle.Link para estilo de link
                    .setURL('https://lofi-square.vercel.app')
            );

        await message.channel.send({ embeds: [helpEmbed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'changeStation') {
        currentStationIndex = (currentStationIndex + 1) % stations.length;

        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            const player = createAudioPlayer();
            const resource = createAudioResource(stations[currentStationIndex].url);
            player.play(resource);
            connection.subscribe(player);

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('LoFi Square')
                .setDescription(`Tocando agora: ${stations[currentStationIndex].name}`);

            await interaction.update({ embeds: [embed] });
        }
    }
});

client.login(TOKEN);

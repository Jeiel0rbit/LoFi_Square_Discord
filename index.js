const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, NoSubscriberBehavior } = require('@discordjs/voice');

// Inicializa o cliente do Discord com as permissões (intents) necessárias.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// ATENÇÃO: Substitua pelo seu token de verdade!
const TOKEN = 'TOKEN';

// Lista de estações de rádio.
const stations = [
    { name: 'LoFi Girl', url: 'https://radio.stereoscenic.com/ama-h'},
    { name: 'Chillhop', url: 'https://radio.stereoscenic.com/asp-h3'},
];

// Usamos um Map para guardar o estado do player para cada servidor (guild).
// Isso permite que o bot funcione em vários servidores ao mesmo tempo sem conflitos.
const guildStates = new Map();

// Evento que é disparado quando o bot fica online.
client.once('ready', () => {
    console.log(`Bot está online como ${client.user.tag}`);
});

// Evento que é disparado a cada nova mensagem criada.
client.on('messageCreate', async message => {
    // Ignora mensagens de outros bots e mensagens diretas (DMs).
    if (message.author.bot || !message.guild) return;

    // Comando para entrar no canal de voz e tocar.
    if (message.content === '!join') {
        const voiceChannel = message.member?.voice?.channel;
        if (voiceChannel) {
            // Pega ou cria o estado para este servidor.
            let state = guildStates.get(message.guild.id);
            if (!state) {
                const player = createAudioPlayer({
                    // Comportamento para evitar que o player pare se ficar sem assinante por um momento.
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

                // Monitora erros no player.
                player.on('error', error => {
                    console.error(`Erro no player do servidor ${message.guild.id}:`, error);
                    // Tenta tocar a próxima música em caso de erro.
                    const currentState = guildStates.get(message.guild.id);
                    if (currentState) {
                        playStation(message.guild.id);
                    }
                });

                state = {
                    player: player,
                    connection: null,
                    currentStationIndex: 0,
                    messageChannel: message.channel,
                };
                guildStates.set(message.guild.id, state);
            }

            // Cria a conexão com o canal de voz.
            state.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            
            // Assina a conexão ao player.
            state.connection.subscribe(state.player);

            // Toca a estação atual.
            playStation(message.guild.id);

            // Cria o embed e o botão de controle.
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('changeStation')
                        .setLabel('Mudar Estação')
                        .setStyle(ButtonStyle.Primary)
                );

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('LoFi Square')
                .setDescription(`Tocando agora: ${stations[state.currentStationIndex].name}`)
                .setFooter({ text: 'Relaxe e aproveite a música!'});

            await message.channel.send({ embeds: [embed], components: [row] });

        } else {
            message.reply('Você precisa estar em um canal de voz para eu me juntar!');
        }
    }

    // Comando para sair do canal de voz.
    if (message.content === '!leave') {
        const state = guildStates.get(message.guild.id);
        if (state?.connection) {
            state.connection.destroy();
            guildStates.delete(message.guild.id); // Remove o estado do servidor do Map.
            message.reply('Desconectado do canal de voz!');
        } else {
            message.reply('Não estou em um canal de voz!');
        }
    }

    // Comando de ajuda.
    if (message.content === '!Shelp') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Comandos do LoFi Square')
            .setDescription('Aqui estão os comandos que você pode usar:')
            .addFields(
                { name: '!join', value: 'Entra no canal de voz e começa a tocar.' },
                { name: '!leave', value: 'Sai do canal de voz.' },
                { name: '!Shelp', value: 'Exibe esta mensagem de ajuda.' }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Visite o Web Player')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://lofi-square.vercel.app')
            );

        await message.channel.send({ embeds: [helpEmbed], components: [row] });
    }
});

// Evento para interações (como cliques em botões).
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'changeStation') {
        const state = guildStates.get(interaction.guild.id);
        if (state?.connection) {
            // Avança para a próxima estação na lista.
            state.currentStationIndex = (state.currentStationIndex + 1) % stations.length;
            playStation(interaction.guild.id);

            // Atualiza o embed com a nova estação.
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('LoFi Square')
                .setDescription(`Tocando agora: ${stations[state.currentStationIndex].name}`)
                .setFooter({ text: 'Relaxe e aproveite a música!'});

            await interaction.update({ embeds: [embed] });
        } else {
            // Se o bot não estiver mais conectado, avisa o usuário.
            await interaction.reply({ content: 'Não estou mais em um canal de voz. Use !join para me chamar de novo.', ephemeral: true });
            await interaction.message.edit({ components: [] }); // Remove os botões da mensagem original.
        }
    }
});


/**
 * Função auxiliar para tocar uma estação de rádio.
 * @param {string} guildId O ID do servidor.
 */
function playStation(guildId) {
    const state = guildStates.get(guildId);
    if (!state) {
        console.log(`Nenhum estado encontrado para o servidor ${guildId}.`);
        return;
    }
    
    // Cria um recurso de áudio a partir da URL da estação.
    const resource = createAudioResource(stations[state.currentStationIndex].url);
    state.player.play(resource);

    // Log para saber o que está tocando.
    state.player.once(AudioPlayerStatus.Playing, () => {
        console.log(`Reproduzindo música em ${guildId}: ${stations[state.currentStationIndex].name}`);
    });
}


// Conecta o bot ao Discord usando o token.
client.login(TOKEN);


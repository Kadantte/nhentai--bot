import 'reflect-metadata';
import { config } from 'dotenv';
config();

import { Client, Intents, Options, Util } from 'discord.js';
import { URL, fileURLToPath, pathToFileURL } from 'url';
import readdirp from 'readdirp';
import { container } from 'tsyringe';
import mongoose from 'mongoose';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import { Command, commandInfo } from './Command';
import { tCommands, tMongoose } from './tokens';
import { logger } from './logger';
import type { Event } from './Event';

const connection = mongoose.createConnection(String(process.env.MONGODB_URI), {
	family: 4,
	autoIndex: true,
	keepAlive: true,
	keepAliveInitialDelay: 300000,
	serverSelectionTimeoutMS: 5000,
});

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
	makeCache: Options.cacheWithLimits({
		// @ts-expect-error
		ChannelManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		GuildChannelManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		MessageManager: 100,
		StageInstanceManager: 10,
		ThreadManager: {
			sweepInterval: 3600,
			sweepFilter: Util.archivedThreadSweepFilter(),
		},
		VoiceStateManager: 10,
	}),
});
client.setMaxListeners(20);

const commands = new Map<string, Command>();

container.register(Client, { useValue: client });
container.register(tCommands, { useValue: commands });
container.register(tMongoose, { useValue: connection });

const commandFiles = readdirp(fileURLToPath(new URL('./commands', import.meta.url)), {
	fileFilter: '*.js',
});

const eventFiles = readdirp(fileURLToPath(new URL('./events', import.meta.url)), {
	fileFilter: '*.js',
});

try {
	await i18next.use(Backend).init({
		backend: {
			loadPath: fileURLToPath(new URL('./locales/{{lng}}/{{ns}}.json', import.meta.url)),
		},
		cleanCode: true,
		fallbackLng: ['en-US'],
		defaultNS: 'translation',
		lng: 'en-US',
		ns: ['translation'],
	});


	for await (const dir of commandFiles) {
		const cmdInfo = commandInfo(dir.path);
		if (!cmdInfo) continue;

		const command = container.resolve<Command>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info(
			{ command: { name: command.name ?? cmdInfo.name } },
			`Registering command: ${command.name ?? cmdInfo.name}`,
		);

		commands.set((command.name ?? cmdInfo.name).toLowerCase(), command);
	}

	for await (const dir of eventFiles) {
		const event = container.resolve<Event>((await import(pathToFileURL(dir.fullPath).href)).default);
		logger.info({ event: { name: event.name, event: event.event } }, `Registering event: ${event.name}`);

		if (event.disabled) {
			continue;
		}
		event.execute();
	}

	await client.login();
} catch (e) {
	logger.error(e, e.message);
}

import { Client, Constants, Guild, Snowflake } from 'discord.js';
import { on } from 'events';
import { injectable } from 'tsyringe';

import type { Event } from '../Event';
import { logger } from '../logger';

const { LOGGING_CHANNEL } = process.env;

@injectable()
export default class implements Event {
	public name = 'New guild join';

	public event = Constants.Events.GUILD_CREATE;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const [guild] of on(this.client, this.event) as AsyncIterableIterator<[Guild]>) {
			logger.info(
				{
					event: { name: this.name, event: this.event },
					guildId: guild.id,
				},
				`Joined guild "${guild.name}" (ID: ${guild.id}) (Total: ${this.client.guilds.cache.size} guilds)`,
			);

			const channel = await this.client.channels.fetch(LOGGING_CHANNEL as Snowflake);
			if (channel?.isText()) {
				channel.send('kek');
			}

			continue;
		}
	}
}

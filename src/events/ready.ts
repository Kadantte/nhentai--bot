import { Client, Constants } from 'discord.js';
import { on } from 'events';
import { injectable } from 'tsyringe';

import type { Event } from '../Event';
import { logger } from '../logger';

@injectable()
export default class implements Event {
	public name = 'Client ready handling';

	public event = Constants.Events.CLIENT_READY;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const _ of on(this.client, this.event) as AsyncIterableIterator<[void]>) {
			logger.info(
				{ event: { name: this.name, event: this.event } },
				`Logged in as ${this.client.user.tag}. ID: ${this.client.user.id}`,
			);
			this.client.user.setActivity('Abandon all hope, ye who enter here', { type: Constants.ActivityTypes.PLAYING });
			continue;
		}
	}
}

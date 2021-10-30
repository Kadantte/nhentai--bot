import { Client, Constants, Interaction, DMChannel, User } from 'discord.js';
import i18next from 'i18next';
import { on } from 'events';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command';

import type { Event } from '../Event';
import { transformInteraction } from '../commands/InteractionOptions';
import { logger } from '../logger';
import { tCommands } from '../tokens';

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Constants.Events.INTERACTION_CREATE;

	public cooldowns = new Map<string, Map<User['id'], number>>();

	public constructor(
		public readonly client: Client<true>,
		@inject(tCommands) public readonly commands: Map<string, Command>,
	) {}

	public async execute(): Promise<void> {
		for await (const [interaction] of on(this.client, this.event) as AsyncIterableIterator<[Interaction]>) {
			if ((!interaction.isCommand() && !interaction.isContextMenu()) || interaction.channel instanceof DMChannel) {
				continue;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());
			if (command) {
				try {
					if (interaction.channel && interaction.channel.isText() && !interaction.channel.partial) {
						if (!interaction.channel.isThread() && !interaction.channel.nsfw && command.nsfw) {
							await interaction.editReply({ content: i18next.t('common.errors.nsfw', { lng: 'en' }) });
							continue;
						}
					}

					const cooldownAmount = command.cooldown ?? 0;
					const name = interaction.commandName;

					if (cooldownAmount > 0) {
						if (!this.cooldowns.has(name)) {
							this.cooldowns.set(name, new Map());
						}

						const now = Date.now();
						const timestamps = this.cooldowns.get(name)!;

						if (timestamps.has(interaction.user.id)) {
							const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
							if (now < expirationTime) {
								const timeLeft = expirationTime - now;
								await interaction.editReply({
									content: i18next.t('common.errors.cooldown', {
										lng: 'en',
										time: timeLeft / 1000,
										minimumFractionDigits: 2,
									}),
								});
								continue;
							}
						}

						timestamps.set(interaction.user.id, now);
						setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
					}

					logger.info(
						{
							command: { name: interaction.commandName, type: interaction.type },
							userId: interaction.user.id,
						},
						`Executing command ${interaction.commandName}`,
					);

					await command.execute(interaction, transformInteraction(interaction.options.data));
				} catch (e) {
					logger.error(e, e.message);
					try {
						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{
									command: {
										name: interaction.commandName,
										type: interaction.type,
									},
									userId: interaction.user.id,
								},
								'Command interaction has not been deferred before throwing',
							);
							await interaction.deferReply();
						}

						await interaction.editReply({ content: e.message, components: [] });
					} catch (err) {
						logger.error(err, err.message);
					}
				}
			}

			continue;
		}
	}
}

import type { CommandInteraction } from 'discord.js';
import { inject, injectable } from 'tsyringe';

import type { ArgumentsOf } from '../ArgumentsOf';
import type { Command } from '../../Command';

export default class implements Command {
    cooldown = 20000;
    nsfw = true;
    public async execute(
        interaction: CommandInteraction,
        args: ArgumentsOf<typeof GCommand>,
    ): Promise<void> {
        
    }
}

import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const GCommand = {
    name: 'g',
    description: 'Searches nhentai for specified code',
    options: [
        {
            name: 'query',
            description: 'The code to search for on nhentai',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: 'page',
            description: 'Starting page number (default: 1)',
            type: ApplicationCommandOptionType.Integer,
        },
        {
            name: 'more',
            description: 'Views more info about the doujin (default: false)',
            type: ApplicationCommandOptionType.Boolean,
        },
        {
            name: 'private',
            description: 'Whether to send the reply in private (default: false)',
            type: ApplicationCommandOptionType.Boolean,
        },
    ],
} as const;
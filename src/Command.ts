import type { CommandInteraction } from 'discord.js';
import { basename, extname } from 'path';

export interface Command {
    name?: string;
    nsfw?: boolean;
    cooldown?: number;
    owner?: boolean;
    execute(
        interaction: CommandInteraction,
        args: unknown,
    ): unknown | Promise<unknown>;
}

export interface CommandInfo {
    name: string;
}

export function commandInfo(path: string): CommandInfo | null {
    if (extname(path) !== '.js') {
        return null;
    }

    return { name: basename(path, '.js') };
}

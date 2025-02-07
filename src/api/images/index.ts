import axios from 'axios';
import NekosClient from 'nekos.life';

export type Endpoint = keyof typeof ACTIONS | keyof typeof SFW_METHODS | keyof typeof NSFW_METHODS;

export class Client {
    public NekosAPI = new NekosClient();
    public nekobotAPI = 'https://nekobot.xyz/api/image?type=';
    public hmtaiAPI = 'https://hmtai.herokuapp.com/v2/';

    private random<T>(a: T[]): T {
        return a[Math.floor(Math.random() * a.length)];
    }

    private isURL(url: string): boolean {
        const PROTOCOL_AND_DOMAIN_RE = /^(?:\w+:)?\/\/(\S+)$/;
        const LOCALHOST_DOMAIN_RE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
        const NON_LOCALHOST_DOMAIN_RE = /^[^\s\.]+\.\S{2,}$/;
        if (typeof url !== 'string') return false;
        const match = url.match(PROTOCOL_AND_DOMAIN_RE);
        if (!match) return false;
        const everythingAfterProtocol = match[1];
        if (!everythingAfterProtocol) return false;
        if (
            LOCALHOST_DOMAIN_RE.test(everythingAfterProtocol) ||
            NON_LOCALHOST_DOMAIN_RE.test(everythingAfterProtocol)
        )
            return true;
        return false;
    }

    public async fetch(type: 'actions' | 'sfw' | 'nsfw', query: Endpoint): Promise<string> {
        const urls: string[] = [];
        let method: typeof ACTIONS | typeof SFW_METHODS | typeof NSFW_METHODS;
        switch (type) {
            case 'actions':
                method = ACTIONS;
                break;
            case 'sfw':
                method = SFW_METHODS;
                break;
            case 'nsfw':
                method = NSFW_METHODS;
            default:
                break;
        }
        if (method[query]?.nekoslife) {
            const q = this.random(method[query].nekoslife) as keyof typeof NekosClient;
            try {
                const url = (await this.NekosAPI[type === 'nsfw' ? 'nsfw' : 'sfw'][q]())
                    ?.url;
                if (this.isURL(url)) urls.push(url);
            } catch (err) {
                /* ignore */
            }
        }
        if (method[query]?.nekobot) {
            const q = this.random(method[query].nekobot);
            const url = await axios
                .get(this.nekobotAPI + q)
                .then(res => res.data.message)
                .catch(err => {
                    /* ignore */
                });
            if (this.isURL(url)) urls.push(url);
        }
        if (method[query]?.hmtai) {
            const q = this.random(method[query].hmtai);
            const url = await axios
                .get(this.hmtaiAPI + q)
                .then(res => res.data.url)
                .catch(err => {
                    /* ignore */
                });
            if (this.isURL(url)) urls.push(url);
        }
        return this.random(urls);
    }
}

export const ACTIONS = {
    tickle: {
        nekoslife: ['tickle'],
    },
    slap: {
        nekoslife: ['slap'],
    },
    poke: {
        nekoslife: ['poke'],
    },
    pat: {
        nekoslife: ['pat'],
    },
    kiss: {
        nekoslife: ['kiss'],
    },
    hug: {
        nekoslife: ['hug'],
    },
    feed: {
        nekoslife: ['feed'],
    },
    cuddle: {
        nekoslife: ['cuddle'],
    },
};

export const SFW_METHODS = {
    avatar: {
        nekoslife: ['avatar'],
    },
    foxgirl: {
        nekoslife: ['foxGirl'],
    },
    gah: {
        nekobot: ['gah'],
    },
    gecg: {
        nekoslife: ['gecg'],
    },
    jahy: {
        hmtai: ['jahy'],
    },
    kanna: {
        nekobot: ['kanna'],
    },
    kemonomimi: {
        nekoslife: ['kemonomimi'],
    },
    neko: {
        nekoslife: ['neko', 'nekoGif'],
        nekobot: ['neko'],
        hmtai: ['neko'],
    },
    smug: {
        nekoslife: ['smug'],
    },
    waifu: {
        nekoslife: ['waifu'],
    },
    wallpaper: {
        nekoslife: ['wallpaper'],
        hmtai: ['wallpaper', 'mobileWallpaper'],
    },
};

export const NSFW_METHODS = {
    ahegao: {
        hmtai: ['ahegao'],
    },
    anal: {
        nekobot: ['hanal'],
    },
    ass: {
        nekobot: ['hass'],
        hmtai: ['ass'],
    },
    bdsm: {
        hmtai: ['bdsm'],
    },
    blowjob: {
        hmtai: ['blowjob'],
    },
    boobs: {
        nekobot: ['hboobs'],
    },
    cuckold: {
        hmtai: ['cuckold'],
    },
    cum: {
        hmtai: ['cum', 'creampie'],
    },
    elf: {
        hmtai: ['elves'],
    },
    ero: {
        hmtai: ['ero'],
    },
    feet: {
        hmtai: ['foot'],
    },
    femdom: {
        hmtai: ['femdom'],
    },
    glasses: {
        hmtai: ['glasses'],
    },
    hentai: {
        nekobot: ['hentai'],
        hmtai: ['hentai', 'gif'],
    },
    holo: {
        nekobot: ['holo'],
    },
    incest: {
        hmtai: ['incest'],
    },
    kemonomimi: {
        nekobot: ['kemonomimi'],
    },
    kitsune: {
        nekobot: ['hkitsune'],
    },
    masturbation: {
        hmtai: ['masturbation'],
    },
    midriff: {
        nekobot: ['hmidriff'],
    },
    neko: {
        nekobot: ['hneko'],
        hmtai: ['nsfwNeko'],
    },
    orgy: {
        hmtai: ['orgy'],
    },
    paizuri: {
        nekobot: ['paizuri'],
        hmtai: ['boobjob'],
    },
    pantsu: {
        hmtai: ['pantsu'],
    },
    public: {
        hmtai: ['public'],
    },
    pussy: {
        hmtai: ['vagina'],
    },
    tentacle: {
        nekobot: ['tentacle'],
        hmtai: ['tentacles'],
    },
    thigh: {
        nekobot: ['hthigh'],
        hmtai: ['thighs'],
    },
    uniform: {
        hmtai: ['uniform'],
    },
    wallpaper: {
        hmtai: ['nsfwMobileWallpaper'],
    },
    yaoi: {
        nekobot: ['yaoi'],
    },
    yuri: {
        hmtai: ['yuri'],
    },
    'zettai ryouiki': {
        hmtai: ['zettaiRyouiki'],
    },
};

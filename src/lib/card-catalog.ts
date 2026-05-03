export type CardIconKey =
  | "news"
  | "url"
  | "comment"
  | "recipe"
  | "followers"
  | "health"
  | "thumbnail"
  | "islamic"
  | "wish";

export type CardDefinition = {
  id: string;
  label: string;
  href: string;
  description: string;
  iconKey: CardIconKey;
  requiresPro?: boolean;
  featured?: boolean;
};

export type CardGroup = {
  name: string;
  summary: string;
  cards: CardDefinition[];
};

export const CARD_GROUPS: CardGroup[] = [
  {
    name: "Core Cards",
    summary: "Quick-turn templates for news, links, and stories.",
    cards: [
      {
        id: "news",
        label: "Today's News",
        href: "/news",
        description: "Turn breaking stories into polished cards fast.",
        iconKey: "news",
        requiresPro: true,
        featured: true,
      },
      {
        id: "url",
        label: "URL Newscard",
        href: "/url",
        description: "Convert any link into a clean preview card.",
        iconKey: "url",
        featured: true,
      },
      {
        id: "comment",
        label: "Comment/Quote",
        href: "/comment",
        description: "Turn quotes and reactions into shareable visuals.",
        iconKey: "comment",
        requiresPro: true,
      },
      {
        id: "recipe",
        label: "New Recipe Card",
        href: "/recipe",
        description: "Design recipe posts with ingredients and steps.",
        iconKey: "recipe",
        requiresPro: true,
        featured: true,
      },
    ],
  },
  {
    name: "Audience Growth",
    summary: "Cards for milestones, thumbnails, and community updates.",
    cards: [
      {
        id: "followers",
        label: "Followers Card",
        href: "/followers",
        description: "Celebrate audience milestones and growth updates.",
        iconKey: "followers",
        requiresPro: true,
        featured: true,
      },
      {
        id: "thumbnail",
        label: "News Thumbnail",
        href: "/thumbnail",
        description: "Create bold cover art for posts and videos.",
        iconKey: "thumbnail",
        requiresPro: true,
      },
      {
        id: "wish",
        label: "Wish Card",
        href: "/wish",
        description: "Send birthday and celebration greetings in style.",
        iconKey: "wish",
        requiresPro: true,
      },
    ],
  },
  {
    name: "Lifestyle & Culture",
    summary: "Helpful cards for wellbeing and faith-based content.",
    cards: [
      {
        id: "health",
        label: "Health Card",
        href: "/health",
        description: "Share wellness advice, reminders, and routines.",
        iconKey: "health",
        requiresPro: true,
      },
      {
        id: "islamic",
        label: "Islamic Card",
        href: "/islamic",
        description: "Publish prayers, quotes, and seasonal greetings.",
        iconKey: "islamic",
        requiresPro: true,
      },
    ],
  },
];

export const CARD_TYPES = CARD_GROUPS.flatMap((group) => group.cards);
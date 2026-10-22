// Static Game Assets, Sprites, and UI Icons

export const NPC_SPR: Record<string, any> = {
  "gerbang": {
    "w": 51.88,
    "h": 89.21,
    "ax": 13.03,
    "gy": 88.85,
    "body": 84,
    "blink": {
      "x": 16.36,
      "y": 19.39,
      "w": 11.15,
      "h": 3.64
    },
    "call": 9.0,
    "done": 9.0,
    "hop": 0.8,
    "u": {
      "idle": "/npc/gerbang-idle.webp",
      "blink": "/npc/gerbang-blink.webp",
      "help": "/npc/gerbang-help.webp",
      "happy": "/npc/gerbang-happy.webp",
      "head": "/npc/gerbang-head.webp"
    }
  },
  "kakek": {
    "w": 65.72,
    "h": 87.84,
    "ax": 16.18,
    "gy": 87.17,
    "body": 86,
    "blink": {
      "x": 26.65,
      "y": 17.77,
      "w": 17.1,
      "h": 6.37
    },
    "u": {
      "idle": "/npc/kakek-idle.webp",
      "blink": "/npc/kakek-blink.webp",
      "help": "/npc/kakek-help.webp",
      "happy": "/npc/kakek-happy.webp",
      "head": "/npc/kakek-head.webp"
    }
  },
  "lila": {
    "w": 41.09,
    "h": 80.52,
    "ax": 12.3,
    "gy": 80.21,
    "body": 80,
    "blink": {
      "x": 10.89,
      "y": 12.35,
      "w": 16.81,
      "h": 7.06
    },
    "call": 8.0,
    "done": 7.0,
    "hop": 0.8,
    "u": {
      "idle": "/npc/lila-idle.webp",
      "blink": "/npc/lila-blink.webp",
      "help": "/npc/lila-help.webp",
      "happy": "/npc/lila-happy.webp",
      "head": "/npc/lila-head.webp"
    }
  },
  "mimi": {
    "w": 47.8,
    "h": 81.51,
    "ax": 13.65,
    "gy": 80.88,
    "body": 80,
    "blink": {
      "x": 15.97,
      "y": 22.14,
      "w": 15.35,
      "h": 6.04
    },
    "call": 8.0,
    "done": 7.0,
    "hop": 1.4,
    "u": {
      "idle": "/npc/mimi-idle.webp",
      "blink": "/npc/mimi-blink.webp",
      "help": "/npc/mimi-help.webp",
      "happy": "/npc/mimi-happy.webp",
      "head": "/npc/mimi-head.webp"
    }
  },
  "portal": {
    "w": 60.9,
    "h": 102.2,
    "ax": 17.32,
    "gy": 101.67,
    "body": 84,
    "blink": {
      "x": 19.6,
      "y": 30.45,
      "w": 13.3,
      "h": 7.0
    },
    "call": 11.0,
    "done": 9.0,
    "hop": 0.9,
    "u": {
      "idle": "/npc/portal-idle.webp",
      "blink": "/npc/portal-blink.webp",
      "help": "/npc/portal-help.webp",
      "happy": "/npc/portal-happy.webp",
      "head": "/npc/portal-head.webp"
    }
  },
  "raja": {
    "w": 67.11,
    "h": 92.81,
    "ax": 20.23,
    "gy": 92.27,
    "body": 92,
    "blink": {
      "x": 27.19,
      "y": 13.94,
      "w": 14.34,
      "h": 5.95
    },
    "call": 11.0,
    "done": 9.0,
    "hop": 0.5,
    "u": {
      "idle": "/npc/raja-idle.webp",
      "blink": "/npc/raja-blink.webp",
      "help": "/npc/raja-help.webp",
      "happy": "/npc/raja-happy.webp",
      "head": "/npc/raja-head.webp"
    }
  },
  "rimba": {
    "w": 59.14,
    "h": 84.6,
    "ax": 18.75,
    "gy": 84.05,
    "body": 82,
    "blink": {
      "x": 20.81,
      "y": 18.21,
      "w": 19.71,
      "h": 8.76
    },
    "call": 7.0,
    "done": 8.0,
    "hop": 1.2,
    "u": {
      "idle": "/npc/rimba-idle.webp",
      "blink": "/npc/rimba-blink.webp",
      "help": "/npc/rimba-help.webp",
      "happy": "/npc/rimba-happy.webp",
      "head": "/npc/rimba-head.webp"
    }
  },
  "waktu": {
    "w": 63.51,
    "h": 88.91,
    "ax": 18.45,
    "gy": 88.3,
    "body": 88,
    "blink": {
      "x": 25.25,
      "y": 17.24,
      "w": 14.82,
      "h": 5.14
    },
    "call": 13.0,
    "done": 10.0,
    "hop": 0.6,
    "u": {
      "idle": "/npc/waktu-idle.webp",
      "blink": "/npc/waktu-blink.webp",
      "help": "/npc/waktu-help.webp",
      "happy": "/npc/waktu-happy.webp",
      "head": "/npc/waktu-head.webp"
    }
  }
};

export const NPC_PORTRAITS: Record<string, string> = {
  "ayu": "/portraits/ayu.webp",
  "bima": "/portraits/bima.webp",
  "rangga": "/portraits/rangga.webp",
  "sera": "/portraits/sera.webp"
};

export const OWL_SPR: Record<string, string> = {
  "blink": "/owl/blink.webp",
  "down": "/owl/down.webp",
  "happy": "/owl/happy.webp",
  "head": "/owl/head.webp",
  "idle": "/owl/idle.webp",
  "land": "/owl/land.webp",
  "out": "/owl/out.webp",
  "talk": "/owl/talk.webp",
  "up": "/owl/up.webp"
};

export const FOREST_UI: Record<string, string> = {
  "bag": "/ui/forest/bag.webp",
  "bell": "/ui/forest/bell.webp",
  "bridge": "/ui/forest/bridge.webp",
  "bus": "/ui/forest/bus.webp",
  "castle": "/ui/forest/castle.webp",
  "cave": "/ui/forest/cave.webp",
  "city": "/ui/forest/city.webp",
  "clock": "/ui/forest/clock.webp",
  "door": "/ui/forest/door.webp",
  "exit": "/ui/forest/exit.webp",
  "forest": "/ui/forest/forest.webp",
  "hourglass": "/ui/forest/hourglass.webp",
  "lightning": "/ui/forest/lightning.webp",
  "map": "/ui/forest/map.webp",
  "market": "/ui/forest/market.webp",
  "message": "/ui/forest/message.webp",
  "portal": "/ui/forest/portal.webp",
  "pot": "/ui/forest/pot.webp",
  "quest": "/ui/forest/quest.webp",
  "school": "/ui/forest/school.webp",
  "settings": "/ui/forest/settings.webp",
  "talk": "/ui/forest/talk.webp",
  "target": "/ui/forest/target.webp",
  "train": "/ui/forest/train.webp",
  "village": "/ui/forest/village.webp",
  "water": "/ui/forest/water.webp"
};

export const COMMON_UI: Record<string, string> = {
  "book": "/ui/common/book.webp",
  "bulb": "/ui/common/bulb.webp",
  "crown": "/ui/common/crown.webp",
  "happy": "/ui/common/happy.webp",
  "home": "/ui/common/home.webp",
  "lock": "/ui/common/lock.webp",
  "speaker": "/ui/common/speaker.webp",
  "worried": "/ui/common/worried.webp"
};


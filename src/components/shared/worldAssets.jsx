const sectionAssets = {
  Sanctuary: {
    src: "https://images.unsplash.com/photo-1761066449630-10a807cdc8fd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=900&h=700",
    alt: "A lit candle glowing in a dark room",
  },
  "Deck Garden": {
    src: "https://images.unsplash.com/photo-1762765306286-07f1eab18669?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=900&h=700",
    alt: "A greenhouse walkway filled with plants",
  },
  Archive: {
    src: "https://images.unsplash.com/photo-1760166699654-5d0e10f51994?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=900&h=700",
    alt: "A warm modern library with tall bookshelves",
  },
  Observatory: {
    src: "https://images.unsplash.com/photo-1759772082797-6c5fef25a39c?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=900&h=700",
    alt: "Observatory domes beneath the Milky Way",
  },
  Campfire: {
    src: "https://images.unsplash.com/photo-1761665861442-f74d8e9321be?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=900&h=700",
    alt: "A glowing campfire with sparks in the dark",
  },
};

function getSectionAsset(name) {
  return sectionAssets[name] || null;
}

export { getSectionAsset };

# Section Asset Plan

This document maps each major place in the app to a small, tasteful visual asset.

Goal:
- Make each section feel real and emotionally justified
- Keep the UI simple and readable
- Avoid large hero banners or noisy stock-photo clutter
- Prefer one asset per section, used as a small media chip or compact header visual

## Asset Principles

- Use still images first.
- Use animation only for `Campfire`, and only if it remains subtle.
- Darken or soften every image with an overlay before placing it in the UI.
- Keep assets compact: rounded thumbnail, media chip, or small header tile.
- Never place detailed photos directly behind body text.
- If an image fails to load, fall back to the Lucide icon already in the UI.

## Placement Rules

- Section header image:
  - Place to the left of the title or in the top-right of the header
  - Size: `48x48`, `56x56`, or `72x56`
  - Radius: `16px`
  - Add a dark overlay between `18%` and `28%`
- Special chip image:
  - Use beside labels like `Campfire`
  - Size: `36x36` to `48x48`
  - Keep motion optional
- Deck thumbnail:
  - Optional later
  - Use only for smart decks first

## Section Mapping

### Sanctuary

- Intent:
  - calm, intimate, ritual-start feeling
- Best treatment:
  - small still image beside title
- Recommended asset:
  - `A lit candle in a dark room with bokeh lights`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/a-lit-candle-in-a-dark-room-with-bokeh-lights-DyfS-ujqHE8
  - Photographer: Akshat Sharma
- Why it fits:
  - visually quiet
  - feels like an entry ritual
  - works well cropped to a small tile
- UI note:
  - keep the `Sanctuary` title text
  - add image as a supporting tile, not a replacement

### Campfire

- Intent:
  - warmth, progress, reflection, small reward moment
- Best treatment:
  - tiny looping media chip if performance is acceptable
  - otherwise use a still image
- Recommended still asset:
  - `Flames of a campfire burning brightly at night`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/flames-of-a-campfire-burning-brightly-at-night-Ljr-aEeGUKY
  - Photographer: Mario Dominguez
- Alternate still asset:
  - `Campfire sparks against a night forest backdrop`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/campfire-sparks-against-a-night-forest-backdrop-RrtNvze6u5o
  - Photographer: Vladyslav Tobolenko
- UI note:
  - this is the only section where a subtle loop could make sense
  - if animated, use a very small rounded chip only
  - never replace all text with the media

### Deck Garden

- Intent:
  - growth, curation, collecting, exploration
- Best treatment:
  - small greenhouse or lush pathway image
- Recommended asset:
  - `A long walkway inside a greenhouse filled with plants`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/a-long-walkway-inside-a-greenhouse-filled-with-plants-xGQET8KLrEg
  - Photographer: Adrien Olichon
- Alternate asset:
  - `Greenhouse interior with blooming red flowers and plants`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/greenhouse-interior-with-blooming-red-flowers-and-plants-EVClKT3W_Tc
  - Photographer: Evelina Kasparaitė
- Why it fits:
  - clearly justifies the garden metaphor
  - reads well even in a small crop

### Archive

- Intent:
  - organized knowledge, binder, curated library
- Best treatment:
  - warm bookshelf or modern library image
- Recommended asset:
  - `Modern library interior with floor-to-ceiling bookshelves`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/modern-library-interior-with-floor-to-ceiling-bookshelves-TQ8ICns1tgE
  - Photographer: Fer Troulik
- Alternate asset:
  - `Bookshelves illuminated with warm light`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/bookshelves-illuminated-with-warm-light-x5CYgL1pe40
  - Photographer: Declan Sun
- Why it fits:
  - reinforces the archive/library concept immediately
  - warm wood tones match the collectible card direction

### Observatory

- Intent:
  - quiet control room, night sky, system settings
- Best treatment:
  - telescope or observatory dome image
- Recommended asset:
  - `Observatory domes under the milky way at night`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/observatory-domes-under-the-milky-way-at-night-Xsva3kxJ6mw
  - Photographer: Evgeni Tcherkasski
- Alternate asset:
  - `A telescope on a hill at night with stars in the sky`
  - Source: Unsplash
  - Link: https://unsplash.com/photos/a-telescope-on-a-hill-at-night-with-stars-in-the-sky-5SqTxWX-IRw
  - Photographer: Kelly Zhang
- Why it fits:
  - gives the settings area a real-world meaning
  - visually distinct from Sanctuary and Archive

## Recommended First Pass

Implement these first:

1. Sanctuary image tile
2. Campfire image chip
3. Deck Garden image tile
4. Archive image tile
5. Observatory image tile

Keep all of them:
- small
- darkened
- rounded
- secondary to the text

## What Not To Do

- Do not add full-width stock-photo banners.
- Do not use different illustration styles in different sections.
- Do not place bright photos directly under small text.
- Do not animate multiple sections at once.
- Do not add images to every card.

## Licensing Note

These recommended sources were selected from free-to-use pages on Unsplash. Before implementation, confirm the final downloaded asset and attribution requirements on the source page you actually use.

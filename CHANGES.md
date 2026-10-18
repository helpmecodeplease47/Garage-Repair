# Quick Fix Garage Doors – Royal Blue Redesign

Built on GitHub `main` at commit 0b34913 ("big ai upload here grok", Oct 18, 2026, 4:08 PM MT).

## What changed
- **New theme on all 16 pages:** royal blue (#1F45C8), darker blue (#16349A), navy text (#0F1B3D), light gray sections (#F3F5F9).
  Yellow (#FFE600) appears only on the main "Call Now (801) 641-6850" button at the top of each page.
- **New white circle logo** in a blue header (about 18% bigger than the mockup), and in the footer. The homepage hero also shows the large logo.
- **Tailwind CDN removed.** All pages now share one small stylesheet, `css/styles.css` (26 KB). The font (Roboto) is hosted on the site (`fonts/`), preloaded, with font-display: swap. Google Fonts and Poppins are no longer loaded.
- **Phone menu:** same menu button and open/close behavior as before, restyled blue. It now also reports open or closed to screen readers.
- **Homepage:** the hero matches the mockup. The service cards now have photos, and the New Installs card uses your new install photo. City buttons are now chips. Connect Four stays at the bottom, above the contact form. No review cards were added.
- **Installation page:** your new install photo is the hero background and also appears in the "Find Your Perfect Door" section with a caption.
- **Bug fix:** on the spring, motor, tune-up and installation pages, every city in "Proudly Serving" is now a link. Cities with their own page link to that page. The rest (Bluffdale, Midvale, Oquirrh, Lehi, Orem, Provo, Vineyard) link to service-areas.html. Murray was added to those pages, and each one got a "See All Garage Door Service Areas" button.
- **New footer on every page:** name, Licensed & Insured, DOPL #14116475-5501, 9256 Targhee Dr, West Jordan, UT 84088, hours, phone, links to the 4 services and 10 cities, and All service areas.
- **Faster loading:** phones download smaller hero photos (the new `*-828.jpg` files). The service cards use small thumbnails (`card-*.jpg`).
- No changes to: page text, titles and descriptions, the code Google reads (JSON-LD), canonicals, the Formspree form (xoejbppp), Google Analytics, or sitemap.xml.

## Upload
Unzip and drag everything into the repo, keeping the folders (`css/`, `fonts/`, `js/`, `Images/`). Let the new files replace the old ones.

## Delete from the repo (optional cleanup)
- `quickfix-city-pages.patch`: an old note file from the last bundle. The site doesn't use it.

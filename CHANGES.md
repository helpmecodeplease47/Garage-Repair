# Quick Fix Garage Doors: city pages update (Oct 18, 2026)

Based on GitHub main at commit afc39e9 (Gavin's Oct 18 v2 upload). Nothing was pushed.

## New pages
- service-areas.html: hub linking every city page
- south-jordan.html, riverton.html, herriman.html, sandy.html, draper.html,
  taylorsville.html, murray.html, west-valley-city.html

Each city page has its own title, description, H1, canonical, local content,
FAQ, click-to-call buttons, links to the 4 service pages and nearby cities, and
schema for the business (9256 Targhee Dr, West Jordan 84088, real map pin, full hours,
areaServed = that city) plus breadcrumbs and the FAQ.

## Rewritten
- west-jordan.html and daybreak.html: new, non-overlapping text in the same layout.
  Fixes 3 missing images (daybreak-hero.jpg, daybreak-neighborhood.jpg,
  west-jordan-neighborhood.jpg) by using photos that exist.

## Edited
- index.html: the 4 "Learn More" buttons now say Garage Spring Repair, Garage Motor
  Repair, Garage Door Tune-Up, Garage Door Installation. City names in "Areas We Serve" now link
  to their pages (Murray added), plus a "See All Service Areas" button. Nothing else changed.
- Quote form on all 16 pages now posts to https://formspree.io/f/xoejbppp
  (index, the 4 service pages, and every city page).
- sitemap.xml: now lists 16 URLs.
- Trust line "Licensed & Insured Utah Contractor" is in the top trust bar of the homepage and
  every city page, and in the homepage hero line. Every page's footer now shows
  "Utah DOPL License #14116475-5501". The service pages' old "Licensed & Insured" footer
  line now reads "Licensed & Insured Utah Contractor".

## Homepage and service-page cleanup
- index.html: the Connect Four game section now sits just above the contact form. Its
  heading is an H3, and the empty winner-popup H2 is now a <p>. The game code moved into
  js/connect-four.js, which loads with `defer`. The game was tested in a browser and works.
- index.html: "5+ Years Exp." badge is now "Serving Since 2024". The About text "With over
  5 years of hands-on experience..." now says "We have been serving the Salt Lake Valley
  since 2024."
- Schema: removed the self-given 58-review aggregateRating from the homepage, the spring
  page and the installation page. The spring and installation pages' Product schema is now
  Service schema, without the conflicting $200/$250/$2,100 prices.
- index.html + the 4 service pages: schema business name is now "Quick Fix Garage Doors",
  with an @id linking to the homepage business and map pin 40.5832, -111.9906 (also in the
  geo meta tags).
- index.html: the star rating graphic gets role="img" so its aria-label is valid HTML.

## Images
- Images/ holds the 13 compressed photos (already live since afc39e9; included again only so
  the bundle is complete).

## How to upload
Upload the zip contents over the repo root, keeping the folder structure. Or apply
quickfix-city-pages.patch with `git am`.

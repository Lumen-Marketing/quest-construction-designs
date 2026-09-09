# Stock photographs — openly licensed, not Quest's own work

56 openly licensed photographs from Wikimedia Commons, sized for the web and
named by the service they belong to. 50 are trade work. 6 are Arizona desert
scene-setters for page backgrounds.

**Nothing here is a Quest job.** It is kept out of `assets/quest/`, out of
`site/`, and out of the build, so the gallery can never pick it up by accident.
The gallery reads from `build/lib/photos.mjs`, which only ever lists files in
`assets/quest/`.

## What is here

| Service | Files | What they show |
| --- | --- | --- |
| Residential Development | 6 | Aerials of finished and part-built subdivisions, tile roofs, desert edges |
| Custom Home Building | 4 | Houses in open frame, sheathing going on |
| Concrete | 6 | Slab pours at framed houses, chutes, screeding, driveway pours |
| Roofing | 3 | Tear-off back to the deck, tear-off truck at the house |
| Siding | 5 | Lap courses, window returns, finished elevations |
| Dry Wall | 6 | Hanging, taping, running compound, a finished corner |
| Painting | 6 | Cutting in, rolling out, exterior ladder work, spray and masking |
| Full Remodel | 5 | Finished kitchens and bathrooms, plus mid-fit shots |
| Deck Building | 4 | New deck off the house, boards and rail, finished deck |
| Demolition | 5 | Excavators working, loading out to a clear site |
| Arizona / Sonoran desert | 6 | Saguaro, desert plain, a Tucson street — for backgrounds |

## Read this before using any of it

**1. Do not put these in the project gallery.** The gallery is presented as
Quest's completed work. A stock photograph in there is a claim about a job Quest
did not do, and Quest's own customers are the people most likely to spot it. Use
them for page backgrounds, section headers and service page imagery, where they
read as illustration rather than as a portfolio.

**2. 39 of the 56 need a credit line wherever they are published.** The other 17
are public domain and need nothing. `CREDITS.md` has the exact line for each. One
credits page carrying those lines, linked from any page that uses one, satisfies
the licence.

**3. Some are CC BY-SA (share-alike).** Placing one on a page does not put the
page under that licence, but publishing a *modified* version of the photograph
does. These were resized only, which is not an adaptation. Check `CREDITS.md`
before cropping, recolouring or compositing.

## Services with nothing here

**Casita**, **ADU**, **Stucco** and **Framing**.

Roughly 5,800 files were walked out of the Commons trade categories and reviewed
by eye. Those four came back empty of anything usable: "stucco" on Commons is
Islamic architectural relief in museums, "ADU" is Nepalese guest houses and German
pensions, "casita" is historic adobe and Californian mission buildings, and the
framing categories are commercial steel and timber roofs rather than American
stick framing.

Framing needs nothing anyway — it has 35 real Quest photographs. Casita has 3.
Stucco and ADU have none, and the honest fix for those two is a phone camera on a
Quest job.

## Sourcing more

Pexels, Pixabay and Unsplash have far better coverage of American residential
trades and their licences need no attribution at all. Their image CDNs are
reachable from this machine, but searching them needs a free API key that is not
set up here. Get a key from any one of them and this can be re-run against a much
better library.

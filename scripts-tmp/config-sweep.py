#!/usr/bin/env python3
"""Fingerprint sweep: rename geoStalking keys, rewrite default.yml user content, new PGP/oauth values."""
import re, sys

# 1) geoStalking* -> travelMeta*/workplaceVisual* across code + config (NOT codefixes/cypress)
FILES = ['config/default.yml', 'lib/config.schema.ts', 'data/datacreator.ts',
         'lib/startup/validateConfig.ts', 'test/server/configValidation.unit.test.ts']
for p in FILES:
    s = open(p).read()
    s = (s.replace('geoStalkingMetaSecurityQuestion', 'travelMetaSecurityQuestion')
          .replace('geoStalkingMetaSecurityAnswer', 'travelMetaSecurityAnswer')
          .replace('geoStalkingVisualSecurityQuestion', 'workplaceVisualSecurityQuestion')
          .replace('geoStalkingVisualSecurityAnswer', 'workplaceVisualSecurityAnswer'))
    open(p, 'w').write(s)
print('geo keys renamed')

# 2) default.yml targeted replacements (exact strings)
s = open('config/default.yml').read()
rep = [
 # PGP fingerprint + security.txt copy
 ("encryption: 'https://keybase.io/lollo_logistics/pgp_keys.asc?fingerprint=19c01cb7157e4645e9e2c863062a85a8cbfbdcda'",
  "encryption: 'https://keybase.io/lollo_logistics/pgp_keys.asc?fingerprint=6580B39EEB2F6FE21CD277F80842B6E30A6A04F0'"),
 ("acknowledgements: 'https://lollo-logistics.shop/hall-of-fame'",
  "acknowledgements: 'https://lollo-logistics.shop/security-credits'"),
 # googleOauth clientId (upstream real client -> fresh placeholder)
 ("clientId: '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com' # TODO: replace with new OAuth client for lollo-logistics.shop",
  "clientId: '447923815763-9kt2vpqm5x0c7h4wnz8d3r6y1b5f8sja.apps.googleusercontent.com'"),
 # chatbot sample questions: token-ish -> plain text
 ("""    sampleQuestions:
      - 'CHATBOT_PROMPT_RECOMMENDATION_SUMMER_PARTY'
      - 'CHATBOT_PROMPT_RECOMMENDATION_POPULAR'
      - 'CHATBOT_PROMPT_RECOMMENDATION_SUGAR_FREE'
      - 'CHATBOT_PROMPT_RECOMMENDATION_START_DAY'
      - 'CHATBOT_PROMPT_RECOMMENDATION_SEASONAL'""",
  """    sampleQuestions:
      - 'What cooler flavors do you recommend for a summer depot party?'
      - 'Which products do most dispatch drivers order twice?'
      - 'Show me something sugar-free for the long haul.'
      - 'What should I grab to start an early shift right?'
      - 'Any seasonal specials in stock this week?'"""),
 # welcome banner message
 ("""    message: "<p>Lollo Logistics is your one-stop shop for premium shipping supplies, logistics equipment, and delivery services. Browse our catalog of carefully curated products designed to keep your shipments moving smoothly.</p><h1><a href='https://lollo-logistics.shop' target='_blank'>https://lollo-logistics.shop</a></h1>\"""",
  """    message: "<p>Welcome aboard! Lollo Logistics stocks everything a modern freight depot runs on: crates, cold-chain gear, fleet apparel and the odd experimental gadget. Place an order by noon and it ships with today's convoy.</p><h1><a href='https://lollo-logistics.shop' target='_blank'>https://lollo-logistics.shop</a></h1>\""""),
 # cookie consent copy
 ("message: 'We use cookies to improve your shopping experience and track your orders.'",
  "message: 'Cookies keep your basket, language and dispatch preferences running smoothly across visits.'"),
]
for old, new in rep:
    if old not in s:
        sys.exit(f'MISS: {old[:60]!r}')
    s = s.replace(old, new, 1)

# 3) product descriptions & reviews -> fresh logistics copy (author aliases kept: they key into seeded users)
prod = [
 # classic crate
 ("'The all-time classic of fragile-goods transport.'", "'Our founding product. Double-wall corrugated, stacks six high, forgives everything except glassware.'"),
 ("- { text: 'One of my favorites!', author: admin }", "- { text: 'Stocked in every aisle since day one.', author: admin }"),
 ("""      - { text: "Great! We'll have a depot party. Everyone brings a crate and - STUFFS IT FULL OF GLASSWARE!", author: basil }""",
  """      - { text: "Bought twelve. The night crew filled them all with bubble wrap and declared it art.", author: basil }"""),
 ("'Keeps your temperature-sensitive cargo in perfect tune.'", "'48-hour cold hold, dented-but-honest exterior, fits under every depot bench we tested.'"),
 ("- { text: 'y0ur f1r3wall needs m0r3 musc13', author: vinnie }", "- { text: 'sh1pment tr4cking ne3ds m0r3 sw33t3rs', author: vinnie }"),
 ("'Now with even more exotic cushioning geometry.'", "'Interlocking egg-cell inserts that somehow always fit. Nobody knows how.'"),
 ("- { text: 'I bought it, would buy again. 5/7', author: admin }", "- { text: 'Bought a pallet, regret nothing. Solid 7 out of 10.', author: admin }"),
 ("'Made from blended Raspberry Pi, firmware and a prayer.'", "'Puck-sized GPS tracker with LoRa fallback. Firmware updates welcome but not promised.'"),
 ("'Sour but full of solvents.'", "'Cuts dock grease without eating the paint. Lemon forward, solvent finish.'"),
 ("'Monkeys love it the most.'", "'Compostable fiber wrap that unwinds smooth and knots like rope.'"),
 ("- { text: 'The night crew swears by it.', author: vex }", "- { text: 'Held a 300km convoy in monsoon season. Still tight.', author: vex }"),
 ("'Real couriers wear it 24/7!'", "'Heather-gray crew tee, dispatch-print pocket, survives the depot laundromat.'"),
 ("'For serious dispatch heroines only!'", "'Wrinkle-resistant field shirt with a hidden manifest sleeve and roll-up sleeves.'"),
 # PortHound tampering product (keep tool-like description, fresh wording)
 ("'PortHound is an easy to use tool to show information about SSL certificates and tests the SSL connection according given list of ciphers and various SSL configurations.'",
  "'Handheld TLS probe for dock-side network checks: reads certificate chains, negotiates cipher suites, flags stale protocol versions at a glance.'"),
 ("'Contains a random selection of 10 items from our finest catalog and an extra crew tee for an unbeatable price!'",
  "'A blind pallet of ten catalog favorites plus a crew tee. What you get is the depot's secret until it lands.'"),
 # Riptide botanical case (data-leak keywords product) - fresh wording, keep plant-registry flavor
 ("'Contains a magical collection of the rarest botanicals gathered from all around the world, like Cherymoya Annona cherimola, Jabuticaba Myrciaria cauliflora, Bael Aegle marmelos... and others, at an unbelievable price! <br/><span style=\"color:red;\">This item has been made unavailable because of lack of safety standards.</span>'",
  "'A curated crate of greenhouse exotics propagated in our partner nurseries: Spurgea Grandis, Vernormacia Obscura, Calyptra Ventosa... and a few we have not catalogued yet. <br/><span style=\"color:red;\">Currently suspended: customs flagged the species paperwork.</span>'"),
 ("      - hueteroneel\n      - eurogium edule", "      - spurgea grandis\n      - vernormacia obscura"),
 ("'Die-cut decal with the official vintage logo. By now this is a rare collectors item. <em>Out of stock!</em>'",
  "'Original 90s depot-logo decal, pressed in one short run long ago. Collectors keep asking; we keep saying no. <em>Out of stock!</em>'"),
 ("'Upgrade your courier clothes with washer safe iron-ons of the Lollo Logistics logo!'",
  "'Washer-proof iron-on crests. Twenty washes hot, and the logo still outlasts the shirt.'"),
 ("'Your break-room fridge will be even cooler with these Lollo Logistics logo magnets!'",
  "'Enamel-coated fleet magnets strong enough to hold the depot rota sheet in a gale.'"),
 ("'Massive decoration opportunities with these Lollo Logistics logo sticker sheets! Each page has 16 stickers on it.'",
  "'Sixteen waterproof stickers per sheet, from scanner-gun small to pallet-side large.'"),
 ("'Super high-quality vinyl single decal with the Lollo Logistics logo! The ultimate laptop decal!'",
  "'One perfectly cut vinyl mark. Laptop, hard hat, or forklift hood - your call.'"),
 ("'Get one of these temporary tattoos to proudly wear the Lollo Logistics logo on your skin! If you post a photo of yourself with the tattoo, you get a couple of our stickers for free!'",
  "'Skin-safe rally tattoos for driver meet weekends. Post a photo wearing yours and we mail you a sticker pack.'"),
 ("- { text: 'I straight-up gots nuff props fo''these tattoos!', author: dj }", "- { text: 'Held up all weekend on the coastal run, no smudge. Respect.', author: dj }"),
 ("'Black mug with regular logo on one side and heritage crest on the other! Your colleagues will envy you!'",
  "'Matte black 11oz, current mark one side, the 1987 depot crest on the other. Dishwasher loyal.'"),
 ("'Hacker-style apparel. But in black. And with logo.'", "'Heavyweight warehouse hoodie, zip pockets, no reflective strips. Black, as mandated by fashion.'"),
 ("'4x3.5\" embroidered patch with velcro backside. The ultimate decal for every tactical bag or backpack!'",
  "'4x3.5 inch stitched patch, hook-and-loop backing. Bonds to bags, hard hats, questionable decisions.'"),
 ("- { text: 'This thang would look phat on the forklift!', author: dj }", "- { text: 'Stuck it to the forklift. Maintenance asked where they could get one.', author: dj }"),
 ("- { text: 'Looks so much better on my uniform than the old company logo.', author: leo }", "- { text: 'Far cleaner stitch work than what the old depot handed out.', author: leo }"),
 ("'Harvested and manufactured in the Black Forest, Germany. Can cause hyperactive behavior in children. Can cause permanent green tongue when consumed undiluted.'",
  "'Small-batch woodruff syrup from the valley co-op. Dilute 1:8. Will turn your tongue green at full strength; children bounce at full strength.'"),
 ("'Looks poisonous but is actually very good for your health! Made from green cabbage, spinach, kiwi and grass.'",
  "'Suspiciously green cold-pressed blend: cabbage, spinach, kiwi, and a whisper of wheatgrass. Healthy first, pretty later.'"),
 ("- { text: 'Straight off the packing line.', author: leo }", "- { text: 'Drinks fine after a loading shift. No notes.', author: leo }"),
 ("'Cordial of the <em>Cydonia oblonga</em> fruit. Not exactly sweet but rich in Vitamin C.'",
  "'Quince cordial from orchard seconds. Tart, golden, quietly heroic with sparkling water.'"),
 ("'Finest pressed pulp packing material. Allergy disclaimer: Might contain traces of worms. Can be <a href=\"/#recycle\">sent back to us</a> for recycling.'",
  "'Pressed pulp cushioning from our own compactor line. May contain plant confetti. <a href=\"/#recycle\">Ship it back</a> and we re-pulp it.'"),
 ("'Crates go in. Packing pulp comes out. Pulp you can send back to us for recycling purposes.'",
  "'Feed crates to the hopper, pull packing pulp from the tray. The depot's own closed loop, at desk scale.'"),
 ("'This rare item was designed and handcrafted in Sweden. This is why it is so incredibly expensive despite its complete lack of purpose.'",
  "'Desk-scale crate trophy, printed layer by patient layer in Malmo. Beautiful. Functionless. Price accordingly.'"),
 ("- OpenSCAD", "- FreeCAD"),
 ("'Unique masterpiece painted with different kinds of cargo stains on 90g/m² lined paper.'",
  "'Abstract composition: coffee, hydraulic fluid, and blueberry cooler on 90g lined paper. Framed at the depot since.'"),
 ("'Your chance to nominate up to three quiet pillars of the logistics community ends 2017-06-30! <a href=\"https://www.example.com/index.php/Quiet_Hero_Awards_2017\">Nominate now!</a>'",
  "'The 2017 depot recognition round: nominate up to three unsung colleagues before June 30. <a href=\"https://www.example.com/index.php/DepotRecognition2017\">Open the form</a>'"),
 ("'Sweet & tasty!'", "'Chilled strawberry lemonade, no added sugar.'"),
 ("'As the old German saying goes: \"Carrots are good for the eyes. Or has anyone ever seen a rabbit with glasses?\"'",
  "'Cold-pressed carrot with a squeeze of orange. The depot's only energy drink that admits what it is.'"),
 ("- { text: '0 st4rs f0r 7h3 h0rr1bl3 s3cur17y', author: vinnie }", "- { text: 'l0v3 7h3 t4573 bu7 y0ur l0g1n scr33n sc4r3s m3', author: vinnie }"),
 ("'10 sheets of Nordic-themed stickers with 15 stickers on each.'", "'Ten sheets, fifteen aurora-and-fjord stickers each. Retired with the 2017 convoy tour.'"),
 ("<em>The official Companion Guide</em> to running a modern logistics depot, available <a href=\"https://example.com/companion-guide\">for free online</a>!",
  "<em>The unofficial-but-tolerated Companion Guide</em> to running a modern depot, readable <a href=\"https://example.com/companion-guide\">free online</a>!"),
 ("- { text: 'Better than the in-terminal Wi-Fi waiting lounge!', author: oscar }", "- { text: 'Chapter 4 alone saved my Tuesday layover.', author: oscar }"),
 ("'The wheels of this cart are made from real water melons. You might not want to roll it up/down the curb too hard.'",
  "'Limited comeback piece with hand-turned watermelon-composite wheels. Curb cuts remain inadvisable.'"),
 ("'Our 95mm circle coasters are printed in full color and made from thick, premium coaster board.'",
  "'Full-color 95mm coasters on heavyweight board. Absorb coffee, survive dock talk.'"),
 ("- { text: 'Wait for a 10$ sale, then stock up!', author: weber }", "- { text: 'Bought it for team night; the route-planning round got heated.', author: weber }"),
 ("""      - { text: "Here yo' learn how tha fuck ta not show yo' goddamn phone on camera!", author: dj }""",
  """      - { text: "Teaches you to keep your phone out of the loading-bay cameras. Practical.", author: dj }"""),
 ("\"Die-cut holographic decal. Stand out from those 08/15-decal-covered laptops with this shiny beacon of 80's coolness!\"",
  "\"Holographic depot mark. Refraction grade, not craft-store grade. Turns heads at every tech bench.\""),
 ("- { text: \"Rad, dude!\", author: dj }", "- { text: 'Catches the light like a scanner gun.', author: dj }"),
 ("- { text: \"Looks spacy on Bones' new tricorder!\", author: leo }", "- { text: 'Looks sharp on the new label printer.', author: leo }"),
 ("- { text: \"Will put one on the delivery van's bumper!\", author: vex }", "- { text: 'Survived a monsoon season on my van bumper.', author: vex }"),
 ("\"Dust mask with compartment for filter from 50% cotton and 50% polyester.\"",
  "\"Half-mask dust wrap with replaceable filter pocket; breathable cotton-poly blend for grain-dust days.\""),
 ("- { text: \"K33p5 y0ur 5plu773r 70 y0ur53lf!\", author: vinnie }", "- { text: 'k33p5 7h3 du57 0u7 0f my b33rd, w0r7h 3v3ry cr3d17', author: vinnie }"),
 ("- { text: \"Puny mask for puny human weaklings!\", author: vex }", "- { text: 'Held up on the silo run. The filter is the real hero.', author: vex }"),
 ("'Common rarity \"Forklift Operator\" card for the depot trading card club.'", "'Common-edition Forklift Operator from the depot card club. Opens the lunch-table meta.'"),
 ("- { text: \"Ooooh, puny human playing Mau Mau, now?\", author: vex }", "- { text: 'Fine. I will deign to join a game with this in deck.', author: vex }"),
 ("'Super rare \"Forklift Operator\" card with holographic foil-coating for the depot trading card club.'", "'Foil-stamped Forklift Operator, serial-numbered out of 50. Sleeves strongly encouraged.'"),
 ("- { text: \"Mau Mau with bling-bling? Humans are so pathetic!\", author: vex }", "- { text: 'The foil really is quite nice. I said nothing more at the meeting.', author: vex }"),
 ("'Exact version of <a href=\"https://example.com/releases/tag/v9.3.1-PERMAFROST\">our warehouse management system that was archived on 02/02/2020</a> by the Global Data Archive Program and ultimately went into the <a href=\"https://example.com/arctic-vault\">Arctic Code Vault</a> on July 8. 2020 where it will be safely stored for at least 1000 years.'",
  "'A sealed archive copy of <a href=\"https://example.com/releases/tag/v9.3.1-PERMAFROST\">our warehouse system as it stood on 02/02/2020</a>, mirrored into the <a href=\"https://example.com/cold-archive-vault\">Arctic Data Vault</a> on July 8, 2020. One copy sold, none will be made.'"),
 ("- { text: \"🧊 Let it go, let it go 🎶 Can't hold it back anymore 🎶 Let it go, let it go 🎶 Turn away and slam the door ❄️\", author: dj }", "- { text: 'Bought it purely to brag. Worth every credit.', author: dj }"),
 ("'Unique digital painting depicting Stan, our most qualified and almost profitable salesman. He made a succesful carreer in selling used ships, coffins, krypts, crosses, real estate, life insurance, restaurant supplies, voodoo enhanced asbestos and courtroom souvenirs before <em>finally</em> adding his expertise to the Lollo Logistics marketing team.'",
  "'Digital portrait of Stan, our most decorated and marginally profitable salesman. Before <em>joining the depot he moved used ferries, greenhouse glass, lighthouse parts, three kinds of insurance, and one haunted vending machine.'"),
 ("- { text: \"I'd stand on my head to make you a deal for this piece of art.\", author: stan }", "- { text: 'Hang it facing the loading bay. Better leads.', author: stan }"),
 ("- { text: \"Just when my opinion of humans couldn't get any lower, along comes Stan...\", author: vex }", "- { text: 'The brushwork sells him shorter than he deserves. Or longer.', author: vex }"),
 ("'Mythic rare <small><em>(obviously...)</em></small> card \"Lollo Logistics\" with three distinctly useful abilities. Alpha printing, mint condition. A true collectors piece to own!'",
  "'Tournament-legal promo of our own depot mark, alpha print, centering that photographs smugly. Triple-sleeved shipping only.'"),
 ("- { text: 'DO NOT PLAY WITH THIS! Double-sleeve, then put it in the Arctic Vault for perfect preservation and boost of secondary market value!', author: accountant }",
  "- { text: 'Play it twice a year max; humidity is the enemy of resale.', author: accountant }"),
 ("'Get your <a href=\"https://example.com/20thanniversary/\" target=\"_blank\">free 🎫 for the Logistics Guild 20th Anniversary Celebration</a> online conference! Hear from world renowned keynotes and special speakers, network with your peers and interact with our event sponsors. With an anticipated 10k+ attendees from around the world, you will not want to miss this live on-line event!'",
  "'Seat at the <a href=\"https://example.com/anniversary20/\" target=\"_blank\">freight guild's 20th anniversary summit</a>: three days of route-war stories, a warehouse expo floor, and more lanyards than one person needs.'"),
 ("- { text: \"I'll be there! Will you, too?\", author: weber }", "- { text: 'Reserved mine the morning it dropped.', author: weber }"),
 ("'Want to run a home lab cluster in style? Build <a href=\"https://example.com/lego/server-rack.pdf\" target=\"_blank\">your own server rack tower</a> which holds four Raspberry Pi 4 models with PoE HAT modules running a Kubernetes cluster! Wire to a switch and connect to your network to have an out-of-the-box ready depot network rack up in no time!'",
  "'A brick-built <a href=\"https://example.com/bricks/server-rack.pdf\" target=\"_blank\">micro server rack</a> that holds four single-board nodes with PoE, feeding your home Kubernetes cluster. Click, snap, ship logs.'"),
 ("- { text: 'Check out the /#/photo-wall for some impressions of the assembly process!', author: weber }", "- { text: 'Build photos are up on the depot photo wall - step 9 is tricky.', author: weber }"),
 ("'You are going to the Global AppSec Conference 2024? <a href=\"https://example.com/tickets\" target=\"_blank\">Get a ticket<sup>*</sup></a> for this amazing side event as well! Check the cargo-packed agenda <a href=\"https://example.com/userday\" target=\"_blank\">here</a> for all the details!<br><br><small><small><sup>*</sup>=scroll down to <strong>Elevate: Ops Security User Day (Sept. 25)</strong> after clicking <em>Get Tickets</em>. Ticket price set to only cover fees for room, AV, and catering throughout the day.</small></small>'",
  "'Attending FreightCon 2024? Add a pass to <a href=\"https://example.com/tickets\" target=\"_blank\">the depot-ops day<sup>*</sup></a> - hands-on sessions on dock automation and manifest hygiene. <a href=\"https://example.com/depofday\" target=\"_blank\">Agenda here</a>.<br><br><small><small><sup>*</sup>=pick <strong>Workshop: Depot Ops Day (Sept. 25)</strong> under <em>Add-ons</em>. Priced at cost: room, coffee, sandwiches.</small></small>'"),
 ("- { text: 'The Live Assessment session will even use our warehouse system as its \"real-world\" example!', author: pretzel }", "- { text: 'They audited a live depot on stage. Bold.', author: weber }"),
 ("- { text: 'We will showcase the amazing Raspberry Pi Server Rack at this event!', author: r7291k }", "- { text: 'The brick rack demo drew a crowd all afternoon.', author: r7291k }"),
 ("'Tropical refreshment from the finest sun-ripened pineapples.'", "'Slow-pressed pineapple with sea salt. Sun in a bottle.'"),
 ("'Refreshing and sweet cooler made from ripe melons.'", "'Honeydew-and-mint refresher, lightly sparkling.'"),
 ("'Deep purple and full of antioxidants from selected grapes.'", "'Concord grape pressed cold, deep purple, zero added sugar.'"),
 ("'Exotic and vibrant cooler made from dragonfruit.'", "'Dragonfruit cooler: faintly floral, aggressively pink.'"),
 ("'A delicious blend of fresh forest berries.'", "'Six-berry forest blend, tart enough to wake the depot.'"),
 ("'A unique blend of fresh basil and ginger for a healthy kick.'", "'Basil and ginger shrub with apple cider vinegar base.'"),
 ("- { text: \"(ง'̀-'́)ง\", author: basil }", "- { text: 'Stirs up my morning coffee. No complaints.', author: basil }"),
 ("'Traditional Balkan drink made from fermented millet. Lightly sweet-sour, refreshing, and naturally energizing.'", "'Fermented millet brew, faintly sour and quietly strong; a Balkan farmhouse classic.'"),
 ("'Floral and fragrant soft drink made from elderflowers. Traditionally enjoyed chilled.'", "'Elderflower pressé, cut with spring water. Chilled or it sulks.'"),
 ("'Tangy and slightly sour cooler, extremely rich in Vitamin C and antioxidants.'", "'Sea buckthorn cooler: face-puckering orange, loaded with vitamin C.'"),
 ("'A sweet and tart refreshment inspired by classic grenadine flavors.'", "'Pomegranate and a touch of rose, balanced like old-school grenadine soda.'"),
]
for old, new in prod:
    if old not in s:
        sys.exit(f'MISS product: {old[:70]!r}')
    s = s.replace(old, new, 1)

open('config/default.yml', 'w').write(s)
print('products rewritten')

# memories captions
s = open('config/default.yml').read()
mem = [
 ("caption: 'Team offsite day! 🚚'", "caption: 'Offsite morning briefing at the north yard'"),
 ("caption: 'My rare collectors item! [̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]'", "caption: 'Won this at the depot auction, bidding war included'"),
 ("caption: 'I love going hiking here...'", "caption: 'Weekend trail near the old cabin - map is in my desk drawer...'"),
 ("travelMetaSecurityAnswer: 'Daniel Boone National Forest'", "travelMetaSecurityAnswer: 'Red River Gorge'"),
 ("caption: 'My old workplace...'", "caption: 'Last shift at the riverside sorting office'"),
 ("workplaceVisualSecurityAnswer: 'ITsec'", "workplaceVisualSecurityAnswer: 'Riverside Sorting'"),
 ("caption: 'Welcome to the Depot Garden (/#/bee-haven)🌻'", "caption: 'The depot garden finally bloomed 🌻'"),
 ("caption: 'Sorted the pieces, starting assembly process...'", "caption: 'Parts sorted, build day starts now'"),
 ("caption: 'Building something literally bottom up...'", "caption: 'Frame first - always bottom up'"),
 ("caption: 'Putting in the hardware...'", "caption: 'Bolts, brackets, patience'"),
 ("caption: 'Everything up and running!'", "caption: 'Day done: everything boots and hums'"),
]
for old, new in mem:
    if old not in s:
        sys.exit(f'MISS memory: {old[:60]!r}')
    s = s.replace(old, new, 1)
open('config/default.yml', 'w').write(s)
print('memories rewritten')

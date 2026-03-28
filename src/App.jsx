import { useState, useEffect, useRef } from "react";

/* ═══ ICONS ═══ */
const Check = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M4 9L7.5 12.5L14 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Pin = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Plus = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const CL = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CR = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const YT = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6zm11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>;
const CalI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ListI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>;
const MapI = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const Chev = ({d}) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{transform:d?"rotate(-90deg)":"none",transition:"transform .2s"}}><path d="M3 5L7 9L11 5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/></svg>;

/* ═══ CONSTANTS ═══ */
const CITY_ORDER = ["madrid","barcelona","nice","amsterdam","munich","berlin"];
const CITY_COORDS = {madrid:{lat:40.4168,lng:-3.7038},barcelona:{lat:41.3874,lng:2.1686},nice:{lat:43.7102,lng:7.2620},amsterdam:{lat:52.3676,lng:4.9041},munich:{lat:48.1351,lng:11.5820},berlin:{lat:52.5200,lng:13.4050}};
const DISTANCES = {madrid:0, barcelona:621, nice:560, amsterdam:1230, munich:840, berlin:585}; // km between consecutive
const DIST_LABELS = ["Madrid → Barcelona: 621 km","Barcelona → Nice: 560 km","Nice → Amsterdam: 1,230 km","Amsterdam → Munich: 840 km","Munich → Berlin: 585 km"];
const TOTAL_DIST = 3836;

/* ═══ INITIAL DATA ═══ */
const INIT = {
  madrid:{city:"Madrid",flag:"🇪🇸",dates:"June 13–15",color:"#E63946",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"m-f1",text:"Bocadillo de calamares",note:"Fried squid sandwich",done:false,lat:40.4168,lng:-3.7038},
        {id:"m-f2",text:"Cocido madrileño",note:"Hearty chickpea stew",done:false},
        {id:"m-f3",text:"Patatas bravas",note:"Fried potatoes with spicy aioli",done:false},
        {id:"m-f4",text:"Churros con chocolate",note:"Chocolatería San Ginés (24 hrs)",done:false,lat:40.4170,lng:-3.7070},
        {id:"m-f5",text:"Jamón ibérico",note:"Splurge at a taberna",done:false},
        {id:"m-f6",text:"Mercado de San Miguel",note:"Graze the stalls",done:false,lat:40.4154,lng:-3.7090},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"m-s1",text:"Parque del Retiro",note:"Crystal Palace, rowing",done:false,lat:40.4153,lng:-3.6845},
        {id:"m-s2",text:"Royal Palace",note:"Largest in Western Europe",done:false,lat:40.4180,lng:-3.7142},
        {id:"m-s3",text:"Plaza Mayor",note:"Grand main square",done:false,lat:40.4155,lng:-3.7074},
        {id:"m-s4",text:"Prado Museum",note:"Free after 6 PM",done:false,lat:40.4138,lng:-3.6921},
        {id:"m-s5",text:"Reina Sofía",note:"Picasso's Guernica",done:false,lat:40.4086,lng:-3.6943},
        {id:"m-s6",text:"Gran Vía",note:"Main boulevard",done:false,lat:40.4203,lng:-3.7059},
        {id:"m-s7",text:"Bernabéu Tour",note:"Book online 🎟",done:false,lat:40.4531,lng:-3.6883},
        {id:"m-s8",text:"Retiro at sunset",note:"Locals come out at 7 PM",done:false,lat:40.4153,lng:-3.6845},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife & Clubs",items:[
        {id:"m-n1",text:"La Capital",note:"Rooftop, starts ~1 AM",done:false,lat:40.4205,lng:-3.7011},
        {id:"m-n2",text:"Kapital",note:"7-floor megaclub",done:false,lat:40.4108,lng:-3.6934},
        {id:"m-n3",text:"Teatro Joy Eslava",note:"Theatre club, till 6 AM",done:false,lat:40.4171,lng:-3.7075},
        {id:"m-n4",text:"Sala El Sol",note:"Indie in Malasaña",done:false,lat:40.4212,lng:-3.7060},
        {id:"m-n5",text:"Malasaña bar crawl",note:"El Penta, Bar La Palma",done:false,lat:40.4245,lng:-3.7074},
        {id:"m-n6",text:"Chueca neighborhood",note:"LGBTQ+ district",done:false,lat:40.4228,lng:-3.6978},
      ]},
    },
    schedule:[
      {day:"June 13",title:"Arrival Night",slots:[
        {time:"Evening",text:"Walk Gran Vía",ref:"m-s6"},
        {time:"9–10 PM",text:"Dinner at taberna in Malasaña",id:"m-sch1",done:false},
        {time:"Late",text:"Malasaña bar crawl",ref:"m-n5"},
      ]},
      {day:"June 14",title:"Full Day",slots:[
        {time:"Morning",text:"Parque del Retiro",ref:"m-s1"},
        {time:"Afternoon",text:"Royal Palace",ref:"m-s2"},
        {time:"Afternoon",text:"Plaza Mayor",ref:"m-s3"},
        {time:"Afternoon",text:"Mercado de San Miguel",ref:"m-f6"},
        {time:"Evening",text:"Gran Vía stroll",ref:"m-s6"},
        {time:"Night",text:"La Capital or Kapital",ref:"m-n1"},
      ]},
      {day:"June 15",title:"Last Day",slots:[
        {time:"Morning",text:"Bernabéu Tour 🎟",ref:"m-s7"},
        {time:"Afternoon",text:"Prado Museum",ref:"m-s4"},
        {time:"Night",text:"Teatro Joy Eslava",ref:"m-n3"},
      ]},
    ],
  },
  barcelona:{city:"Barcelona",flag:"🇪🇸",dates:"June 16–17",color:"#2A9D8F",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"b-f1",text:"Pan con tomate",note:"Bread rubbed with tomato",done:false},
        {id:"b-f2",text:"Patatas bravas (BCN)",note:"Two sauces",done:false},
        {id:"b-f3",text:"Seafood paella",note:"Near Barceloneta",done:false,lat:41.3809,lng:2.1897},
        {id:"b-f4",text:"Pintxos in El Born",note:"Basque bar snacks",done:false,lat:41.3851,lng:2.1826},
        {id:"b-f5",text:"Jamón croquetas",note:"Crispy, creamy",done:false},
        {id:"b-f6",text:"Mercat de la Boqueria",note:"Fruit, jamón, juice",done:false,lat:41.3816,lng:2.1719},
        {id:"b-f7",text:"Gelat (Catalan gelato)",note:"Gothic Quarter",done:false},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"b-s1",text:"Sagrada Família",note:"9 AM tower entry 🎟",done:false,lat:41.4036,lng:2.1744},
        {id:"b-s2",text:"Park Güell",note:"Gaudí terraces 🎟",done:false,lat:41.4145,lng:2.1527},
        {id:"b-s3",text:"Gothic Quarter",note:"Get lost on purpose",done:false,lat:41.3833,lng:2.1761},
        {id:"b-s4",text:"Casa Batlló",note:"Gaudí's surreal building 🎟",done:false,lat:41.3916,lng:2.1650},
        {id:"b-s5",text:"Casa Milà (La Pedrera)",note:"Rooftop at sunset",done:false,lat:41.3954,lng:2.1620},
        {id:"b-s6",text:"La Rambla",note:"Walk it once",done:false,lat:41.3809,lng:2.1734},
        {id:"b-s7",text:"Barceloneta Beach",note:"Morning swim",done:false,lat:41.3785,lng:2.1925},
        {id:"b-s8",text:"Camp Nou Tour",note:"Insane scale",done:false,lat:41.3809,lng:2.1228},
        {id:"b-s9",text:"Montjuïc at sunset",note:"Best panoramic view",done:false,lat:41.3642,lng:2.1587},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife",items:[
        {id:"b-n1",text:"Opium Barcelona",note:"Beachfront megaclub",done:false,lat:41.3847,lng:2.2008},
        {id:"b-n2",text:"Pacha Barcelona",note:"On the beach",done:false,lat:41.3867,lng:2.1970},
        {id:"b-n3",text:"Razzmatazz",note:"5 rooms, 5 genres",done:false,lat:41.3978,lng:2.1901},
        {id:"b-n4",text:"Sala Apolo",note:"Indie/electronic",done:false,lat:41.3744,lng:2.1691},
        {id:"b-n5",text:"El Born bar crawl",note:"Pre-club crawl",done:false,lat:41.3851,lng:2.1826},
      ]},
    },
    schedule:[
      {day:"June 16",title:"Arrival",slots:[
        {time:"9 AM",text:"Sagrada Família 🎟",ref:"b-s1"},
        {time:"Afternoon",text:"Gothic Quarter",ref:"b-s3"},
        {time:"Afternoon",text:"La Rambla → Boqueria",ref:"b-f6"},
        {time:"Night",text:"El Born → Razzmatazz",ref:"b-n3"},
      ]},
      {day:"June 17",title:"Full Day",slots:[
        {time:"Morning",text:"Barceloneta Beach",ref:"b-s7"},
        {time:"Morning",text:"Camp Nou Tour",ref:"b-s8"},
        {time:"Afternoon",text:"Park Güell 🎟",ref:"b-s2"},
        {time:"Afternoon",text:"Casa Batlló",ref:"b-s4"},
        {time:"Night",text:"Opium or Pacha",ref:"b-n1"},
      ]},
    ],
  },
  nice:{city:"Nice",flag:"🇫🇷",dates:"June 18–19",color:"#457B9D",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"n-f1",text:"Socca",note:"Crispy chickpea crepe",done:false},
        {id:"n-f2",text:"Pan bagnat",note:"Tuna Niçoise sandwich",done:false},
        {id:"n-f3",text:"Salade Niçoise",note:"Proper brasserie version",done:false},
        {id:"n-f4",text:"Pissaladière",note:"Onion anchovy flatbread",done:false},
        {id:"n-f5",text:"Ratatouille",note:"The real thing",done:false},
        {id:"n-f6",text:"Rosé from Provence",note:"You're in the right place",done:false},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"n-s1",text:"Promenade des Anglais",note:"Morning or sunset walk",done:false,lat:43.6948,lng:7.2654},
        {id:"n-s2",text:"Vieux-Nice",note:"Pastel buildings, Cours Saleya",done:false,lat:43.6966,lng:7.2764},
        {id:"n-s3",text:"Castle Hill",note:"Best view of Nice, free",done:false,lat:43.6953,lng:7.2820},
        {id:"n-s4",text:"Cours Saleya market",note:"Go in the morning",done:false,lat:43.6955,lng:7.2760},
        {id:"n-s5",text:"Matisse Museum",note:"Free first Sunday",done:false,lat:43.7196,lng:7.2753},
        {id:"n-s6",text:"Pebble beach",note:"Lovely for a swim",done:false,lat:43.6946,lng:7.2600},
      ]},
      monaco:{icon:"🇲🇨",label:"Monaco Day Trip",items:[
        {id:"n-m1",text:"Casino de Monte-Carlo",note:"2 PM, €20, Belle Époque",done:false,lat:43.7389,lng:7.4282},
        {id:"n-m2",text:"Prince's Palace",note:"Guard change 11:55 AM",done:false,lat:43.7316,lng:7.4202},
        {id:"n-m3",text:"Port Hercule",note:"Superyachts, F1 pit lane",done:false,lat:43.7347,lng:7.4210},
        {id:"n-m4",text:"F1 circuit walk",note:"City streets = the track",done:false,lat:43.7347,lng:7.4210},
        {id:"n-m5",text:"Larvotto Beach",note:"Monaco public beach",done:false,lat:43.7458,lng:7.4382},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife",items:[
        {id:"n-n1",text:"Bâoli Nice",note:"Upscale beach club",done:false},
        {id:"n-n2",text:"Wayne's Bar",note:"Expat bar Vieux-Nice",done:false,lat:43.6966,lng:7.2764},
        {id:"n-n3",text:"High Club",note:"Top nightclub",done:false},
        {id:"n-n4",text:"Le Ghost",note:"Underground electronic",done:false},
      ]},
    },
    schedule:[
      {day:"June 18",title:"Arrive Nice",slots:[
        {time:"Morning",text:"Promenade des Anglais",ref:"n-s1"},
        {time:"Morning",text:"Cours Saleya market",ref:"n-s4"},
        {time:"Afternoon",text:"Vieux-Nice",ref:"n-s2"},
        {time:"Sunset",text:"Castle Hill",ref:"n-s3"},
        {time:"Dinner",text:"Socca + pan bagnat + rosé",id:"n-sch1",done:false},
        {time:"Night",text:"Wayne's Bar → High Club",ref:"n-n2"},
      ]},
      {day:"June 19",title:"Monaco Day Trip",slots:[
        {time:"11:55 AM",text:"Prince's Palace guard change",ref:"n-m2"},
        {time:"Afternoon",text:"Casino de Monte-Carlo",ref:"n-m1"},
        {time:"Afternoon",text:"Port Hercule → F1 walk",ref:"n-m3"},
        {time:"Evening",text:"Back to Nice for dinner",id:"n-sch2",done:false},
      ]},
    ],
  },
  amsterdam:{city:"Amsterdam",flag:"🇳🇱",dates:"June 20–21",color:"#F4A261",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"a-f1",text:"Stroopwafel (fresh cart)",note:"Not packaged",done:false},
        {id:"a-f2",text:"Haring (raw herring)",note:"Dutch way, with onions",done:false},
        {id:"a-f3",text:"Bitterballen",note:"Fried beef ragù balls",done:false},
        {id:"a-f4",text:"Dutch fries (patat)",note:"Thick-cut, with mayo",done:false},
        {id:"a-f5",text:"Rijsttafel",note:"Indonesian rice table",done:false},
        {id:"a-f6",text:"Poffertjes",note:"Mini fluffy pancakes",done:false},
        {id:"a-f7",text:"Jenever",note:"Dutch gin, brown café",done:false},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"a-s1",text:"Rijksmuseum",note:"Night Watch 🎟",done:false,lat:52.3600,lng:4.8852},
        {id:"a-s2",text:"Anne Frank House",note:"Book months ahead 🎟",done:false,lat:52.3752,lng:4.8840},
        {id:"a-s3",text:"Van Gogh Museum",note:"Best collection 🎟",done:false,lat:52.3584,lng:4.8811},
        {id:"a-s4",text:"Canal bike — Jordaan",note:"The real Amsterdam",done:false,lat:52.3747,lng:4.8818},
        {id:"a-s5",text:"Vondelpark",note:"Beautiful in June",done:false,lat:52.3579,lng:4.8686},
        {id:"a-s6",text:"NDSM Wharf",note:"Waterfront arts district",done:false,lat:52.4012,lng:4.8918},
        {id:"a-s7",text:"Heineken Experience",note:"Fun casual day",done:false,lat:52.3578,lng:4.8914},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife",items:[
        {id:"a-n1",text:"Paradiso",note:"Converted church",done:false,lat:52.3621,lng:4.8840},
        {id:"a-n2",text:"Melkweg",note:"Multiple rooms",done:false,lat:52.3642,lng:4.8818},
        {id:"a-n3",text:"Shelter Amsterdam",note:"Techno, A'DAM Tower",done:false,lat:52.3841,lng:4.9013},
        {id:"a-n5",text:"Leidseplein crawl",note:"Main nightlife square",done:false,lat:52.3636,lng:4.8827},
        {id:"a-n6",text:"Rembrandtplein",note:"Bar hopping",done:false,lat:52.3662,lng:4.8962},
        {id:"a-n7",text:"De Pijp",note:"Hipper, local",done:false,lat:52.3537,lng:4.8934},
      ]},
    },
    schedule:[
      {day:"June 20",title:"Arrive",slots:[
        {time:"Morning",text:"Rijksmuseum 🎟",ref:"a-s1"},
        {time:"Morning",text:"Vondelpark",ref:"a-s5"},
        {time:"Afternoon",text:"Canal bike — Jordaan",ref:"a-s4"},
        {time:"Night",text:"Leidseplein crawl",ref:"a-n5"},
        {time:"Night",text:"Paradiso or Melkweg",ref:"a-n1"},
      ]},
      {day:"June 21",title:"Full Day",slots:[
        {time:"Morning",text:"Anne Frank House 🎟",ref:"a-s2"},
        {time:"Afternoon",text:"Van Gogh Museum",ref:"a-s3"},
        {time:"Afternoon",text:"De Pijp neighborhood",ref:"a-n7"},
        {time:"Night",text:"Rembrandtplein → Shelter",ref:"a-n6"},
      ]},
    ],
  },
  munich:{city:"Munich",flag:"🇩🇪",dates:"June 22–24",color:"#264653",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"mu-f1",text:"Weisswurst",note:"Before noon tradition",done:false},
        {id:"mu-f2",text:"Schweinshaxe",note:"Roasted pork knuckle",done:false},
        {id:"mu-f3",text:"Obatzda + pretzel",note:"Bavarian cheese spread",done:false},
        {id:"mu-f5",text:"Weissbier (Mass)",note:"Liter glass",done:false},
        {id:"mu-f6",text:"Hofbräuhaus",note:"Do it once",done:false,lat:48.1376,lng:11.5799},
        {id:"mu-f7",text:"Viktualienmarkt",note:"Famous food market",done:false,lat:48.1351,lng:11.5763},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"mu-s1",text:"Marienplatz + Glockenspiel",note:"11 AM clock",done:false,lat:48.1374,lng:11.5755},
        {id:"mu-s2",text:"English Garden",note:"Eisbach river surfers",done:false,lat:48.1642,lng:11.6054},
        {id:"mu-s3",text:"Neuschwanstein Castle",note:"🎟 Book NOW",done:false,lat:47.5576,lng:10.7498},
        {id:"mu-s4",text:"Marienbrücke bridge",note:"Iconic castle view",done:false,lat:47.5577,lng:10.7440},
        {id:"mu-s5",text:"BMW Museum + Welt",note:"Welt is free",done:false,lat:48.1770,lng:11.5564},
        {id:"mu-s6",text:"Nymphenburg Palace",note:"Baroque gardens",done:false,lat:48.1583,lng:11.5035},
        {id:"mu-s7",text:"Augustiner Beer Garden",note:"Most authentic",done:false,lat:48.1439,lng:11.5492},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife",items:[
        {id:"mu-n1",text:"Harry Klein",note:"World-class electronic",done:false},
        {id:"mu-n2",text:"Rote Sonne",note:"Local techno",done:false},
        {id:"mu-n3",text:"Blitz Club",note:"Serious, no tourists",done:false},
        {id:"mu-n4",text:"Schumann's Bar",note:"Legendary cocktails",done:false},
      ]},
    },
    schedule:[
      {day:"June 22",title:"Arrive",slots:[
        {time:"11 AM",text:"Marienplatz + Glockenspiel",ref:"mu-s1"},
        {time:"Afternoon",text:"Viktualienmarkt",ref:"mu-f7"},
        {time:"Evening",text:"Hofbräuhaus + weissbier",ref:"mu-f6"},
        {time:"Night",text:"Harry Klein or Rote Sonne",ref:"mu-n1"},
      ]},
      {day:"June 23",title:"Full Day",slots:[
        {time:"Morning",text:"English Garden (surfers)",ref:"mu-s2"},
        {time:"Afternoon",text:"BMW Museum or Nymphenburg",ref:"mu-s5"},
        {time:"Evening",text:"Augustiner Beer Garden",ref:"mu-s7"},
        {time:"Night",text:"Blitz Club",ref:"mu-n3"},
      ]},
      {day:"June 24",title:"Neuschwanstein",slots:[
        {time:"Full day",text:"Neuschwanstein 🎟 (~2 hrs each way)",ref:"mu-s3"},
        {time:"Full day",text:"Marienbrücke bridge",ref:"mu-s4"},
        {time:"Evening",text:"Back to Munich, early night",id:"mu-sch1",done:false},
      ]},
    ],
  },
  berlin:{city:"Berlin",flag:"🇩🇪",dates:"June 25–27",color:"#9B2226",
    categories:{
      food:{icon:"🍽️",label:"Must-Try Food",items:[
        {id:"be-f1",text:"Currywurst",note:"Berlin icon",done:false},
        {id:"be-f2",text:"Döner kebab",note:"Best in the world",done:false},
        {id:"be-f3",text:"Pretzels + mustard",note:"Any street cart",done:false},
        {id:"be-f4",text:"Königsberger Klopse",note:"Meatballs, caper sauce",done:false},
        {id:"be-f5",text:"Club Mate",note:"Berlin club drink",done:false},
        {id:"be-f6",text:"Turkish in Kreuzberg",note:"Best outside Turkey",done:false,lat:52.4992,lng:13.4038},
        {id:"be-f7",text:"Markthalle Neun",note:"Best on Thursdays",done:false,lat:52.5009,lng:13.4335},
      ]},
      sights:{icon:"👁️",label:"Must-See Sights",items:[
        {id:"be-s1",text:"Brandenburg Gate",note:"Go at sunrise",done:false,lat:52.5163,lng:13.3777},
        {id:"be-s2",text:"Holocaust Memorial",note:"Walk through slowly",done:false,lat:52.5139,lng:13.3789},
        {id:"be-s3",text:"East Side Gallery",note:"1.3 km murals, bike it",done:false,lat:52.5050,lng:13.4395},
        {id:"be-s4",text:"Checkpoint Charlie",note:"Historically heavy",done:false,lat:52.5075,lng:13.3904},
        {id:"be-s5",text:"Museum Island",note:"Pergamon Museum",done:false,lat:52.5210,lng:13.3966},
        {id:"be-s6",text:"Reichstag Dome",note:"Free, book online 🎟",done:false,lat:52.5186,lng:13.3761},
        {id:"be-s7",text:"Berliner Dom",note:"Rooftop climb",done:false,lat:52.5190,lng:13.4013},
        {id:"be-s8",text:"Topography of Terror",note:"Free, sobering",done:false,lat:52.5065,lng:13.3837},
        {id:"be-s9",text:"Mauerpark flea market",note:"Sundays, karaoke",done:false,lat:52.5445,lng:13.4024},
      ]},
      nightlife:{icon:"🎉",label:"Nightlife",items:[
        {id:"be-n1",text:"Berghain",note:"All black, after midnight",done:false,lat:52.5112,lng:13.4433},
        {id:"be-n2",text:"Tresor",note:"Original techno bunker",done:false,lat:52.5099,lng:13.4210},
        {id:"be-n3",text:"Watergate",note:"Spree river terrace",done:false,lat:52.5016,lng:13.4426},
        {id:"be-n4",text:"Sisyphos",note:"Open-air, former factory",done:false,lat:52.4932,lng:13.4787},
        {id:"be-n5",text:"Kater Blau",note:"Riverside, accessible",done:false,lat:52.5121,lng:13.4276},
        {id:"be-n6",text:"Kreuzberg crawl",note:"Schlesische Straße",done:false,lat:52.4970,lng:13.4450},
      ]},
    },
    schedule:[
      {day:"June 25",title:"Arrive Afternoon",slots:[
        {time:"Afternoon",text:"Brandenburg Gate",ref:"be-s1"},
        {time:"Afternoon",text:"Holocaust Memorial",ref:"be-s2"},
        {time:"Afternoon",text:"Checkpoint Charlie",ref:"be-s4"},
        {time:"Dinner",text:"Turkish in Kreuzberg",ref:"be-f6"},
        {time:"Night",text:"Watergate or Kater Blau",ref:"be-n3"},
      ]},
      {day:"June 26",title:"Full Day",slots:[
        {time:"Morning",text:"East Side Gallery (bike)",ref:"be-s3"},
        {time:"Afternoon",text:"Museum Island",ref:"be-s5"},
        {time:"Evening",text:"Markthalle Neun / Kreuzberg",ref:"be-f7"},
        {time:"Night",text:"Tresor or Sisyphos",ref:"be-n2"},
      ]},
      {day:"June 27",title:"Last Day",slots:[
        {time:"Morning",text:"Reichstag Dome 🎟",ref:"be-s6"},
        {time:"Afternoon",text:"Mauerpark or Berliner Dom",ref:"be-s9"},
        {time:"Dinner",text:"Currywurst at Curry 36",ref:"be-f1"},
        {time:"Night",text:"Berghain. After midnight. Go.",ref:"be-n1"},
      ]},
    ],
  },
};

const INIT_BOOKINGS = [
  {id:"bk-1",text:"Anne Frank House tickets",note:"Books out 2–3 months ahead",done:false,urgent:true},
  {id:"bk-2",text:"Neuschwanstein Castle tickets",note:"Book weeks in advance",done:false,urgent:true},
  {id:"bk-3",text:"Sagrada Família tower entry",note:"Specific time slot",done:false,urgent:true},
  {id:"bk-4",text:"Park Güell timed entry",note:"",done:false},
  {id:"bk-5",text:"Reichstag Dome registration",note:"Free but requires advance booking",done:false},
  {id:"bk-6",text:"Rijksmuseum timed entry",note:"",done:false},
  {id:"bk-7",text:"Van Gogh Museum timed entry",note:"",done:false},
  {id:"bk-8",text:"Bernabéu Tour",note:"",done:false},
];

const INIT_TRANSPORT = [
  {id:"tr-1",text:"✈️ Fly to Madrid (June 13)",note:"Arrival flight",done:false},
  {id:"tr-2",text:"🚄 AVE train Madrid → Barcelona",note:"June 16 morning, ~2.5 hrs",done:false},
  {id:"tr-3",text:"✈️ Fly Barcelona → Nice",note:"June 18 morning (or 5hr coastal train)",done:false},
  {id:"tr-4",text:"✈️ Fly Nice → Amsterdam",note:"June 20 morning",done:false},
  {id:"tr-5",text:"🚄 Train Amsterdam → Munich",note:"June 22 (or fly, ~4 hrs ICE)",done:false},
  {id:"tr-6",text:"🚄 ICE train Munich → Berlin",note:"June 25 morning, ~4 hrs",done:false},
  {id:"tr-7",text:"✈️ Fly home from Berlin (BER)",note:"June 28",done:false},
];

/* ═══ HELPERS ═══ */
const findItem = (cd, id) => { for (const c of Object.values(cd.categories)) { const i = c.items.find(x=>x.id===id); if(i) return i; } return null; };
const slotDone = (cd, s) => s.ref ? (findItem(cd,s.ref)?.done||false) : !!s.done;
const slotCoords = (cd, s) => { if(s.lat&&s.lng) return s; if(s.ref){const i=findItem(cd,s.ref); if(i?.lat) return i;} return null; };
const cityCounts = (cd) => { let t=0,d=0; Object.values(cd.categories).forEach(c=>c.items.forEach(i=>{t++;if(i.done)d++;})); (cd.schedule||[]).forEach(dy=>dy.slots.forEach(s=>{if(!s.ref&&s.id){t++;if(s.done)d++;}})); return {t,d}; };
const pct = (d,t) => t>0?Math.round((d/t)*100):0;
const allCityItems = (cd) => { const r=[]; Object.entries(cd.categories).forEach(([k,c])=>c.items.forEach(i=>{if(i.lat&&i.lng)r.push({...i,cat:k,catIcon:c.icon});})); return r; };

/* ═══ REUSABLE COMPONENTS ═══ */
const f = "'DM Sans',sans-serif";
const pf = "'Playfair Display',serif";

function Cb({on,color,sz=22,onClick}){return <button onClick={onClick} style={{width:sz,height:sz,minWidth:sz,borderRadius:sz>20?7:6,border:on?"none":`2px solid ${color}55`,background:on?color:"transparent",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",marginTop:1,flexShrink:0}}>{on&&<Check/>}</button>}

function MapBtn({lat,lng,color}){return <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:7,background:`${color}14`,color,textDecoration:"none",flexShrink:0,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=`${color}30`} onMouseLeave={e=>e.currentTarget.style.background=`${color}14`} title="Open in Maps"><Pin/></a>}

function AddForm({onAdd,color}){
  const[open,setOpen]=useState(false);const[text,setText]=useState("");const[note,setNote]=useState("");const r=useRef();
  useEffect(()=>{if(open&&r.current)r.current.focus();},[open]);
  const go=()=>{if(!text.trim())return;onAdd({text:text.trim(),note:note.trim()});setText("");setNote("");setOpen(false);};
  if(!open) return <button onClick={()=>setOpen(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 14px",background:"transparent",border:`1px dashed ${color}44`,borderRadius:10,color,cursor:"pointer",fontSize:12.5,fontFamily:f,width:"100%",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=color} onMouseLeave={e=>e.currentTarget.style.borderColor=`${color}44`}><Plus/> Add item</button>;
  return <div style={{display:"flex",flexDirection:"column",gap:7,padding:11,background:"var(--bg-card)",borderRadius:11,border:`1px solid ${color}33`}}>
    <input ref={r} value={text} onChange={e=>setText(e.target.value)} placeholder="What?" onKeyDown={e=>e.key==="Enter"&&go()} style={{padding:"7px 11px",borderRadius:7,border:"1px solid var(--border)",background:"var(--bg-input)",color:"var(--text-primary)",fontSize:13.5,fontFamily:f,outline:"none"}}/>
    <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Notes (optional)" onKeyDown={e=>e.key==="Enter"&&go()} style={{padding:"7px 11px",borderRadius:7,border:"1px solid var(--border)",background:"var(--bg-input)",color:"var(--text-primary)",fontSize:12.5,fontFamily:f,outline:"none"}}/>
    <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}>
      <button onClick={()=>{setOpen(false);setText("");setNote("");}} style={{padding:"5px 13px",borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--text-secondary)",fontSize:12.5,cursor:"pointer",fontFamily:f}}>Cancel</button>
      <button onClick={go} style={{padding:"5px 13px",borderRadius:7,border:"none",background:color,color:"#fff",fontSize:12.5,cursor:"pointer",fontFamily:f,opacity:text.trim()?1:.4}}>Add</button>
    </div>
  </div>;
}

function ItemRow({item,color,onToggle}){
  return <div style={{display:"flex",alignItems:"flex-start",gap:9,padding:"9px 0",borderBottom:"1px solid var(--border-light)",opacity:item.done?0.5:1,transition:"opacity .25s"}}>
    <Cb on={item.done} color={color} onClick={onToggle}/>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:13.5,fontWeight:500,color:"var(--text-primary)",textDecoration:item.done?"line-through":"none",fontFamily:f}}>{item.text}</div>
      {item.note&&<div style={{fontSize:11.5,color:"var(--text-secondary)",marginTop:1.5,fontFamily:f,lineHeight:1.35}}>{item.note}</div>}
    </div>
    {item.lat&&item.lng&&<MapBtn lat={item.lat} lng={item.lng} color={color}/>}
  </div>;
}

/* ═══ CITY MAP COMPONENT ═══ */
function CityMap({cityData}){
  const items = allCityItems(cityData);
  if(items.length===0) return <div style={{padding:20,textAlign:"center",color:"var(--text-secondary)",fontSize:13,fontFamily:f}}>No locations with coordinates</div>;
  const lats=items.map(i=>i.lat),lngs=items.map(i=>i.lng);
  const minLat=Math.min(...lats),maxLat=Math.max(...lats),minLng=Math.min(...lngs),maxLng=Math.max(...lngs);
  const padLat=(maxLat-minLat)*0.35||0.015,padLng=(maxLng-minLng)*0.35||0.015;
  const bbox=`${minLng-padLng},${minLat-padLat},${maxLng+padLng},${maxLat+padLat}`;
  const osmUrl=`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  const catColors={food:"#FF6B6B",sights:"#4ECDC4",nightlife:"#A855F7",monaco:"#FFD93D"};
  // Build a Google Maps link with all locations
  const gmapsUrl = `https://www.google.com/maps/dir/${items.map(i=>`${i.lat},${i.lng}`).join("/")}`;

  return <div>
    <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",marginBottom:10}}>
      <iframe src={osmUrl} style={{width:"100%",height:340,border:"none",display:"block"}} loading="lazy" title="City Map"/>
    </div>
    {/* Location list */}
    <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:10}}>
      {items.map(item=>{
        const col=catColors[item.cat]||cityData.color;
        return <a key={item.id} href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:8,textDecoration:"none",background:"var(--bg-card)",border:"1px solid var(--border-light)",transition:"all .15s",opacity:item.done?0.45:1}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=col} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-light)"}>
          <div style={{width:8,height:8,borderRadius:4,background:col,flexShrink:0}}/>
          <span style={{fontSize:12.5,fontWeight:500,color:"var(--text-primary)",fontFamily:f,flex:1,textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
          <span style={{color:col,flexShrink:0}}><Pin/></span>
        </a>;
      })}
    </div>
    {/* Legend */}
    <div style={{display:"flex",gap:12,justifyContent:"center",padding:"6px 0",flexWrap:"wrap"}}>
      {Object.entries(catColors).filter(([k])=>items.some(i=>i.cat===k)).map(([k,c])=><div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"var(--text-secondary)",fontFamily:f}}>
        <div style={{width:8,height:8,borderRadius:4,background:c}}/>{k==="monaco"?"Monaco":k.charAt(0).toUpperCase()+k.slice(1)}
      </div>)}
    </div>
    {/* Google Maps button */}
    <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",borderRadius:10,background:cityData.color,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:600,fontFamily:f,marginTop:8,transition:"opacity .15s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      <Pin/> Open All in Google Maps
    </a>
  </div>;
}

/* ═══ ROUTE MAP COMPONENT ═══ */
function RouteMap({data}){
  // Full Europe bbox: Spain to Germany
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-5.5,38.5,15.5,54&layer=mapnik`;
  const routeUrl = `https://www.google.com/maps/dir/Madrid,Spain/Barcelona,Spain/Nice,France/Amsterdam,Netherlands/Munich,Germany/Berlin,Germany`;
  const cities = CITY_ORDER.map(k=>({key:k,...data[k],...CITY_COORDS[k]}));

  return <div>
    <div style={{position:"relative",borderRadius:14,overflow:"hidden",border:"1px solid var(--border)",marginBottom:10}}>
      <iframe src={osmUrl} style={{width:"100%",height:360,border:"none",display:"block"}} loading="lazy" title="Trip Route Map"/>
    </div>
    {/* City stops */}
    <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:10}}>
      {cities.map((c,i)=><div key={c.key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--bg-card)",borderRadius:9,border:"1px solid var(--border-light)"}}>
        <div style={{width:24,height:24,borderRadius:7,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,fontWeight:700,color:c.color,fontFamily:f}}>{i+1}</div>
        <span style={{fontSize:16,flexShrink:0}}>{c.flag}</span>
        <span style={{fontSize:13,fontWeight:600,color:"var(--text-primary)",fontFamily:f,flex:1}}>{c.city}</span>
        {i<cities.length-1&&<span style={{fontSize:11,color:"var(--text-secondary)",fontFamily:f}}>{DIST_LABELS[i].split(": ")[1]}</span>}
        {i<cities.length-1&&<span style={{fontSize:11,color:"var(--text-secondary)"}}>→</span>}
      </div>)}
    </div>
    {/* Open in Google Maps */}
    <a href={routeUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",borderRadius:10,background:"#457B9D",color:"#fff",textDecoration:"none",fontSize:13,fontWeight:600,fontFamily:f,transition:"opacity .15s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      <Pin/> View Full Route in Google Maps
    </a>
  </div>;
}

/* ═══ CATEGORY SECTION ═══ */
function CatSec({catKey,cat,color,cityKey,data,setData}){
  const[col,setCol]=useState(false);
  const items=cat.items,dc=items.filter(i=>i.done).length;
  const toggle=id=>{setData(p=>{const n=JSON.parse(JSON.stringify(p));const i=findItem(n[cityKey],id);if(i)i.done=!i.done;return n;});};
  const add=({text,note})=>{setData(p=>{const n=JSON.parse(JSON.stringify(p));n[cityKey].categories[catKey].items.push({id:`${cityKey}-c-${Date.now()}`,text,note,done:false});return n;});};
  return <div style={{marginBottom:18}}>
    <button onClick={()=>setCol(!col)} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"7px 0",background:"none",border:"none",cursor:"pointer",color:"var(--text-primary)"}}>
      <span style={{fontSize:17}}>{cat.icon}</span>
      <span style={{fontSize:13.5,fontWeight:600,fontFamily:f,flex:1,textAlign:"left"}}>{cat.label}</span>
      <span style={{fontSize:11.5,color,fontFamily:f,fontWeight:600,background:`${color}14`,padding:"2px 7px",borderRadius:16}}>{dc}/{items.length}</span>
      <Chev d={col}/>
    </button>
    {!col&&<div style={{paddingLeft:3}}>
      {items.map(i=><ItemRow key={i.id} item={i} color={color} onToggle={()=>toggle(i.id)}/>)}
      <div style={{marginTop:7}}><AddForm onAdd={add} color={color}/></div>
    </div>}
  </div>;
}

/* ═══ SCHEDULE VIEW ═══ */
function SchedView({cityKey,data,setData}){
  const cd=data[cityKey],color=cd.color;
  const toggle=(di,si)=>{setData(p=>{const n=JSON.parse(JSON.stringify(p));const s=n[cityKey].schedule[di].slots[si];if(s.ref){const i=findItem(n[cityKey],s.ref);if(i)i.done=!i.done;}else s.done=!s.done;return n;});};
  return <div>{(cd.schedule||[]).map((day,dI)=>{
    const dc=day.slots.filter(s=>slotDone(cd,s)).length,all=dc===day.slots.length&&day.slots.length>0;
    return <div key={dI} style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,padding:"9px 13px",background:`${color}08`,borderRadius:11,border:`1px solid ${color}18`}}>
        <div style={{width:36,height:36,borderRadius:9,background:all?`${color}18`:"var(--bg-card)",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${all?color+"40":"var(--border)"}`,flexShrink:0}}>
          <span style={{fontSize:12,fontWeight:700,color:all?color:"var(--text-secondary)",fontFamily:f}}>{dc}/{day.slots.length}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14.5,fontWeight:700,color:"var(--text-primary)",fontFamily:f}}>{day.day}</div>
          <div style={{fontSize:11.5,color:"var(--text-secondary)",fontFamily:f}}>{day.title}</div>
        </div>
        {all&&<span style={{fontSize:18}}>✅</span>}
      </div>
      <div style={{paddingLeft:3}}>{day.slots.map((s,sI)=>{
        const done=slotDone(cd,s),co=slotCoords(cd,s);
        return <div key={sI} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border-light)",opacity:done?0.5:1,transition:"opacity .25s"}}>
          <Cb on={done} color={color} sz={20} onClick={()=>toggle(dI,sI)}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"baseline",gap:7,flexWrap:"wrap"}}>
              <span style={{fontSize:10.5,fontWeight:700,color,fontFamily:f,minWidth:52,textTransform:"uppercase",letterSpacing:".04em"}}>{s.time}</span>
              <span style={{fontSize:13,fontWeight:500,color:"var(--text-primary)",fontFamily:f,textDecoration:done?"line-through":"none"}}>{s.text}</span>
            </div>
          </div>
          {co&&<MapBtn lat={co.lat} lng={co.lng} color={color}/>}
        </div>;
      })}</div>
    </div>;
  })}</div>;
}

/* ═══ PROGRESS BAR ═══ */
function PBar({d,t,color}){const p=pct(d,t);return <div style={{marginBottom:18}}>
  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11.5,fontFamily:f,color:"var(--text-secondary)"}}><span>{d} of {t}</span><span style={{fontWeight:600,color}}>{p}%</span></div>
  <div style={{width:"100%",height:5,background:"var(--border)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:3,transition:"width .35s ease"}}/></div>
</div>}

/* ═══ CITY PAGE ═══ */
function CityPage({cityKey,data,setData}){
  const city=data[cityKey],[tab,setTab]=useState("checklist");
  const{t,d}=cityCounts(city);
  const hasSch=city.schedule?.length>0;
  const tabs=[{key:"checklist",icon:<ListI/>,label:"Checklist"},{key:"schedule",icon:<CalI/>,label:"Schedule"},{key:"map",icon:<MapI/>,label:"Map"}];
  return <div style={{maxWidth:600,margin:"0 auto",padding:"0 16px 40px"}}>
    <div style={{textAlign:"center",padding:"22px 0 10px"}}>
      <div style={{fontSize:38,marginBottom:3}}>{city.flag}</div>
      <h1 style={{fontSize:26,fontWeight:700,fontFamily:pf,color:"var(--text-primary)",margin:"0 0 2px",letterSpacing:"-0.02em"}}>{city.city}</h1>
      <div style={{fontSize:12.5,color:city.color,fontFamily:f,fontWeight:500}}>{city.dates}</div>
    </div>
    {/* Tabs */}
    <div style={{display:"flex",gap:3,marginBottom:14,background:"var(--bg-card)",borderRadius:10,padding:3,border:"1px solid var(--border)"}}>
      {tabs.map(tb=><button key={tb.key} onClick={()=>setTab(tb.key)} style={{
        flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
        padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",
        background:tab===tb.key?city.color:"transparent",
        color:tab===tb.key?"#fff":"var(--text-secondary)",
        fontSize:12.5,fontWeight:600,fontFamily:f,transition:"all .15s",
      }}>{tb.icon}{tb.label}</button>)}
    </div>
    <PBar d={d} t={t} color={city.color}/>
    {tab!=="map"&&hasSch&&<div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 11px",background:`${city.color}08`,borderRadius:8,marginBottom:16,border:`1px solid ${city.color}14`}}>
      <span style={{fontSize:12}}>🔗</span><span style={{fontSize:11,color:"var(--text-secondary)",fontFamily:f}}>Checklist ↔ Schedule stay synced</span>
    </div>}
    {tab==="checklist"&&Object.entries(city.categories).map(([k,c])=><CatSec key={k} catKey={k} cat={c} color={city.color} cityKey={cityKey} data={data} setData={setData}/>)}
    {tab==="schedule"&&<SchedView cityKey={cityKey} data={data} setData={setData}/>}
    {tab==="map"&&<CityMap cityData={city}/>}
  </div>;
}

/* ═══ STATS COMPONENT ═══ */
function TripStats({data,bookings,transport}){
  let grandT=0,grandD=0;
  const visited = CITY_ORDER.filter(k=>{const{t,d}=cityCounts(data[k]);return d>0;}).length;
  CITY_ORDER.forEach(k=>{const{t,d}=cityCounts(data[k]);grandT+=t;grandD+=d;});
  const bkDone=bookings.filter(b=>b.done).length;
  const trDone=transport.filter(t=>t.done).length;
  const countries = new Set(CITY_ORDER.map(k=>data[k].flag)).size;
  // distance "traveled" based on completed transport segments
  const dists=[621,560,1230,840,585];
  let distTraveled=0; transport.slice(1,-1).forEach((tr,i)=>{if(tr.done&&i<dists.length)distTraveled+=dists[i];});
  if(transport[0]?.done) distTraveled+=0; // arrival doesn't add km

  const stats = [
    {label:"Cities",value:`${visited}/6`,icon:"🏙️",sub:`${countries} countries`},
    {label:"Items Done",value:`${grandD}/${grandT}`,icon:"✅",sub:`${pct(grandD,grandT)}% complete`},
    {label:"Booked",value:`${bkDone+trDone}/${bookings.length+transport.length}`,icon:"🎟️",sub:"tickets & transport"},
    {label:"Distance",value:`${distTraveled.toLocaleString()} km`,icon:"📍",sub:`of ${TOTAL_DIST.toLocaleString()} km`},
  ];
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
    {stats.map((s,i)=><div key={i} style={{background:"var(--bg-card)",borderRadius:12,padding:"14px 14px",border:"1px solid var(--border)",textAlign:"center"}}>
      <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
      <div style={{fontSize:18,fontWeight:700,fontFamily:f,color:"var(--text-primary)"}}>{s.value}</div>
      <div style={{fontSize:11,color:"var(--text-secondary)",fontFamily:f,fontWeight:500}}>{s.label}</div>
      <div style={{fontSize:10,color:"var(--text-secondary)",fontFamily:f,marginTop:2,opacity:.7}}>{s.sub}</div>
    </div>)}
  </div>;
}

/* ═══ OVERVIEW PAGE ═══ */
function Overview({data,setActiveCity,bookings,setBookings,transport,setTransport}){
  let gT=0,gD=0;
  CITY_ORDER.forEach(k=>{const{t,d}=cityCounts(data[k]);gT+=t;gD+=d;});
  const gP=pct(gD,gT);
  const toggleBk=id=>setBookings(p=>p.map(b=>b.id===id?{...b,done:!b.done}:b));
  const toggleTr=id=>setTransport(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const addBk=({text,note})=>setBookings(p=>[...p,{id:`bk-${Date.now()}`,text,note,done:false}]);
  const addTr=({text,note})=>setTransport(p=>[...p,{id:`tr-${Date.now()}`,text,note,done:false}]);

  return <div style={{maxWidth:600,margin:"0 auto",padding:"0 16px 40px"}}>
    <div style={{textAlign:"center",padding:"26px 0 8px"}}>
      <div style={{fontSize:34,marginBottom:5}}>🌍</div>
      <h1 style={{fontSize:22,fontWeight:700,fontFamily:pf,color:"var(--text-primary)",margin:"0 0 3px",letterSpacing:"-0.02em"}}>Europe Trip 2025</h1>
      <div style={{fontSize:12.5,color:"var(--text-secondary)",fontFamily:f}}>June 13–28 · 6 cities · 16 days</div>
    </div>
    {/* Progress */}
    <div style={{background:"var(--bg-card)",borderRadius:13,padding:"14px 16px",margin:"14px 0 16px",border:"1px solid var(--border)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:12.5,fontFamily:f,color:"var(--text-secondary)"}}>Trip Progress</span>
        <span style={{fontSize:20,fontWeight:700,fontFamily:f,color:"var(--text-primary)"}}>{gP}%</span>
      </div>
      <div style={{width:"100%",height:7,background:"var(--border)",borderRadius:4,overflow:"hidden"}}>
        <div style={{width:`${gP}%`,height:"100%",background:"linear-gradient(90deg,#E63946,#2A9D8F,#457B9D,#F4A261,#264653,#9B2226)",borderRadius:4,transition:"width .4s ease"}}/>
      </div>
      <div style={{fontSize:11.5,color:"var(--text-secondary)",marginTop:6,fontFamily:f}}>{gD} of {gT} items</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",background:"#FF000012",borderRadius:11,marginBottom:20,border:"1px solid #FF000020"}}>
      <span style={{color:"#FF0000"}}><YT/></span>
      <span style={{fontSize:11.5,color:"var(--text-secondary)",fontFamily:f,lineHeight:1.35}}>Check off items as you go — use this to plan your YouTube video</span>
    </div>
    {/* Cities */}
    {CITY_ORDER.map(key=>{
      const city=data[key];const{t,d}=cityCounts(city);const p=pct(d,t);
      return <button key={key} onClick={()=>setActiveCity(key)} style={{
        display:"flex",alignItems:"center",gap:12,padding:"14px 16px",
        background:"var(--bg-card)",borderRadius:13,border:"1px solid var(--border)",
        width:"100%",cursor:"pointer",marginBottom:8,textAlign:"left",transition:"all .15s",
      }} onMouseEnter={e=>{e.currentTarget.style.borderColor=city.color;e.currentTarget.style.transform="translateY(-1px)";}}
         onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="none";}}>
        <div style={{width:42,height:42,borderRadius:11,background:`${city.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>{city.flag}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14.5,fontWeight:600,color:"var(--text-primary)",fontFamily:f}}>{city.city}</div>
          <div style={{fontSize:11.5,color:"var(--text-secondary)",fontFamily:f}}>{city.dates}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
          <span style={{fontSize:12.5,fontWeight:600,color:city.color,fontFamily:f}}>{p}%</span>
          <div style={{width:44,height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${p}%`,height:"100%",background:city.color,borderRadius:2,transition:"width .35s ease"}}/>
          </div>
        </div>
        <CR/>
      </button>;
    })}

    {/* ── BOOKINGS ── */}
    <div style={{background:"var(--bg-card)",borderRadius:13,padding:"14px 16px",marginTop:20,border:"1px solid var(--border)"}}>
      <div style={{fontSize:14,fontWeight:600,fontFamily:f,color:"var(--text-primary)",marginBottom:10}}>🎟️ Bookings & Tickets</div>
      {bookings.map(b=><div key={b.id} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border-light)",opacity:b.done?0.5:1,transition:"opacity .25s"}}>
        <Cb on={b.done} color="#E63946" sz={20} onClick={()=>toggleBk(b.id)}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text-primary)",fontFamily:f,textDecoration:b.done?"line-through":"none"}}>{b.text}</div>
          {b.note&&<div style={{fontSize:11,color:"var(--text-secondary)",fontFamily:f,marginTop:1}}>{b.note}</div>}
        </div>
        {b.urgent&&!b.done&&<span style={{fontSize:9,fontWeight:700,color:"#E63946",background:"#E6394614",padding:"2px 6px",borderRadius:8,fontFamily:f,whiteSpace:"nowrap"}}>URGENT</span>}
      </div>)}
      <div style={{marginTop:8}}><AddForm onAdd={addBk} color="#E63946"/></div>
    </div>

    {/* ── TRANSPORT ── */}
    <div style={{background:"var(--bg-card)",borderRadius:13,padding:"14px 16px",marginTop:10,border:"1px solid var(--border)"}}>
      <div style={{fontSize:14,fontWeight:600,fontFamily:f,color:"var(--text-primary)",marginBottom:10}}>🚄 Transport & Flights</div>
      {transport.map(t=><div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"8px 0",borderBottom:"1px solid var(--border-light)",opacity:t.done?0.5:1,transition:"opacity .25s"}}>
        <Cb on={t.done} color="#457B9D" sz={20} onClick={()=>toggleTr(t.id)}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:500,color:"var(--text-primary)",fontFamily:f,textDecoration:t.done?"line-through":"none"}}>{t.text}</div>
          {t.note&&<div style={{fontSize:11,color:"var(--text-secondary)",fontFamily:f,marginTop:1}}>{t.note}</div>}
        </div>
      </div>)}
      <div style={{marginTop:8}}><AddForm onAdd={addTr} color="#457B9D"/></div>
    </div>

    {/* ── STATS ── */}
    <div style={{marginTop:24,marginBottom:8}}>
      <div style={{fontSize:14,fontWeight:600,fontFamily:f,color:"var(--text-primary)",marginBottom:10}}>📊 Trip Stats</div>
      <TripStats data={data} bookings={bookings} transport={transport}/>
    </div>

    {/* ── ROUTE MAP ── */}
    <div style={{marginTop:24}}>
      <div style={{fontSize:14,fontWeight:600,fontFamily:f,color:"var(--text-primary)",marginBottom:10}}>🗺️ Trip Route — {TOTAL_DIST.toLocaleString()} km</div>
      <RouteMap data={data}/>
    </div>

    {/* ── CREW ── */}
    <div style={{marginTop:28,textAlign:"center",paddingBottom:20}}>
      <div style={{width:40,height:1,background:"var(--border)",margin:"0 auto 16px",borderRadius:1}}/>
      <div style={{fontSize:12,fontWeight:500,color:"var(--text-secondary)",fontFamily:f,letterSpacing:".06em",textTransform:"uppercase",marginBottom:12}}>A trip by</div>
      <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"center"}}>
        {["Sergio Arcila","Bryan Cadalso","Christan Mira","Jon Pereria","Dillon Cloudfeliter","Shaun Cruz"].map((name,i)=>(
          <div key={i} style={{fontSize:15,fontWeight:600,fontFamily:pf,color:"var(--text-primary)",letterSpacing:"-0.01em"}}>{name}</div>
        ))}
      </div>
      <div style={{marginTop:16,fontSize:20}}>🇪🇸 🇫🇷 🇲🇨 🇳🇱 🇩🇪</div>
      <div style={{marginTop:8,fontSize:11,color:"var(--text-secondary)",fontFamily:f}}>June 13–28, 2025 · 4 countries · 6 cities · {TOTAL_DIST.toLocaleString()} km</div>
    </div>
  </div>;
}

/* ═══ APP ═══ */
export default function App(){
  const[data,setData]=useState(INIT);
  const[bookings,setBookings]=useState(INIT_BOOKINGS);
  const[transport,setTransport]=useState(INIT_TRANSPORT);
  const[activeCity,setActiveCity]=useState(null);

  useEffect(()=>{try{
    const s=localStorage.getItem("eu-trip-v4");
    if(s){const p=JSON.parse(s);setData(p.data||INIT);setBookings(p.bookings||INIT_BOOKINGS);setTransport(p.transport||INIT_TRANSPORT);}
  }catch(e){}},[]);

  useEffect(()=>{try{
    localStorage.setItem("eu-trip-v4",JSON.stringify({data,bookings,transport}));
  }catch(e){}},[data,bookings,transport]);

  useEffect(()=>{window.scrollTo(0,0);},[activeCity]);

  const ci=activeCity?CITY_ORDER.indexOf(activeCity):-1;
  const prev=ci>0?CITY_ORDER[ci-1]:null,next=ci<CITY_ORDER.length-1?CITY_ORDER[ci+1]:null;

  return <>
    <style>{`
      :root{--bg:#0F1115;--bg-card:#1A1D23;--bg-input:#22252B;--text-primary:#F0EDE8;--text-secondary:#8B8A88;--border:#2A2D33;--border-light:#1F2228;}
      @media(prefers-color-scheme:light){:root{--bg:#FAFAF8;--bg-card:#FFFFFF;--bg-input:#F5F5F3;--text-primary:#1A1A1A;--text-secondary:#777;--border:#E8E8E5;--border-light:#F0F0ED;}}
      *{box-sizing:border-box;margin:0;padding:0;}body{background:var(--bg);}
      ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
      input::placeholder{color:var(--text-secondary);opacity:.6;}
    `}</style>
    <div style={{background:"var(--bg)",minHeight:"100vh",color:"var(--text-primary)",fontFamily:f}}>
      {/* Header */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"var(--bg)",borderBottom:"1px solid var(--border)",backdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"11px 16px",display:"flex",alignItems:"center",gap:9}}>
          {activeCity?<>
            <button onClick={()=>setActiveCity(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-secondary)",display:"flex",alignItems:"center",padding:"3px 0",fontSize:12.5,fontFamily:f,gap:3}}><CL/> All Cities</button>
            <div style={{flex:1}}/>
            <div style={{display:"flex",gap:3}}>
              {prev&&<button onClick={()=>setActiveCity(prev)} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:7,padding:"3px 9px",cursor:"pointer",fontSize:11.5,color:"var(--text-secondary)",fontFamily:f,display:"flex",alignItems:"center",gap:2}}><CL/>{data[prev].city}</button>}
              {next&&<button onClick={()=>setActiveCity(next)} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:7,padding:"3px 9px",cursor:"pointer",fontSize:11.5,color:"var(--text-secondary)",fontFamily:f,display:"flex",alignItems:"center",gap:2}}>{data[next].city}<CR/></button>}
            </div>
          </>:
            <div style={{fontSize:14,fontWeight:600,fontFamily:f,letterSpacing:".04em",color:"var(--text-secondary)"}}>TRIP TRACKER</div>
          }
        </div>
      </div>
      {activeCity?<CityPage cityKey={activeCity} data={data} setData={setData}/>:
        <Overview data={data} setActiveCity={setActiveCity} bookings={bookings} setBookings={setBookings} transport={transport} setTransport={setTransport}/>}
    </div>
  </>;
}

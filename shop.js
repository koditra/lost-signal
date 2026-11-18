const amazon = (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
const categories = [
  { id: "hardware-electronics", title: "Hardware & Electronics" },
  { id: "cool-prizes", title: "Cool Prizes" },
  { id: "grants-credits", title: "Grants & Credits" }
];
const products = [
  {
    name: "M5Stack Cardputer ADV",
    category: "Hardware & Electronics",
    description: "A pocket-size computer that feels like carrying a tiny command center.",
    vendor: "M5Stack",
    href: amazon("M5Stack Cardputer ADV"),
    image: "assets/shop/cutouts/cardputer-adv-reference.png",
    visual: "handheld"
  },
  {
    name: "LILYGO T-Echo (LoRa)",
    category: "Hardware & Electronics",
    description: "A little LoRa handheld for sending Meshtastic messages beyond cell range.",
    vendor: "LILYGO",
    href: amazon("LILYGO T-Echo LoRa Meshtastic"),
    image: "assets/shop/cutouts/lilygo-t-echo.png",
    visual: "handheld"
  },
  {
    name: "Heltec WiFi LoRa 32",
    category: "Hardware & Electronics",
    description: "An ESP32 and LoRa board ready for your own off-grid node.",
    vendor: "Amazon",
    href: amazon("Heltec WiFi LoRa 32 V3"),
    image: "assets/shop/cutouts/heltec-wifi-lora-32.png",
    visual: "board"
  },
  {
    name: "Meshtastic-compatible LoRa device",
    category: "Hardware & Electronics",
    description: "A ready-to-go LoRa node for passing messages across a mesh.",
    vendor: "Amazon",
    href: amazon("Meshtastic compatible LoRa device"),
    image: "assets/shop/cutouts/meshtastic-t-deck.png",
    visual: "radio"
  },
  {
    name: "HackRF One",
    category: "Hardware & Electronics",
    description: "A software-defined radio for exploring and building radio projects.",
    vendor: "Amazon",
    href: amazon("HackRF One software defined radio"),
    image: "assets/shop/cutouts/hackrf-one.png",
    visual: "radio"
  },
  {
    name: "RTL-SDR Blog V4",
    category: "Hardware & Electronics",
    description: "A tiny USB receiver for exploring a huge range of radio signals.",
    vendor: "RTL-SDR Blog",
    href: "https://www.rtl-sdr.com/buy-rtl-sdr-dvb-t-dongles/",
    image: "assets/shop/cutouts/rtl-sdr-v4-product.png",
    visual: "radio"
  },
  {
    name: "CC1101 module",
    category: "Hardware & Electronics",
    description: "A small sub-GHz transceiver module for low-power radio experiments.",
    vendor: "Amazon",
    href: amazon("CC1101 wireless transceiver module"),
    image: "assets/shop/cutouts/cc1101-module.png",
    visual: "module"
  },
  {
    name: "ESP32-S3 development board",
    category: "Hardware & Electronics",
    description: "A flexible Wi-Fi and Bluetooth board for your next connected gadget.",
    vendor: "Amazon",
    href: amazon("ESP32-S3 development board"),
    image: "assets/shop/esp32-s3-devkit-centered.png",
    imageFit: "slim",
    visual: "board"
  },
  {
    name: "ESP32 DevKit starter board",
    category: "Hardware & Electronics",
    description: "A plug-in-and-code ESP32 board for Wi-Fi projects and sensor experiments.",
    vendor: "Amazon",
    href: amazon("ESP32 DevKit development board"),
    image: "assets/shop/cutouts/esp32-kit-amazon-alt.png",
    visual: "board"
  },
  {
    name: "USB logic analyzer",
    category: "Hardware & Electronics",
    description: "See digital signals and debug what your circuit is really doing.",
    vendor: "Amazon",
    href: amazon("USB logic analyzer 8 channel"),
    image: "assets/shop/cutouts/logic-8.png",
    visual: "analyzer"
  },
  {
    name: "Pinecil V2 soldering iron",
    category: "Hardware & Electronics",
    description: "A smart, pocketable soldering iron that fits right in your project kit.",
    vendor: "PINE64",
    href: "https://pine64.com/product/pinecil-smart-mini-portable-soldering-iron/",
    image: "assets/shop/cutouts/pinecil.png",
    visual: "solder"
  },
  {
    name: "iFixit Mako Driver Kit",
    category: "Hardware & Electronics",
    description: "A compact driver and bit set for fixing all kinds of electronics.",
    vendor: "iFixit",
    href: "https://www.ifixit.com/products/mako-driver-kit-64-precision-bits",
    image: "assets/shop/cutouts/ifixit-mako.png",
    visual: "driver"
  },
  {
    name: "Portable SSD",
    category: "Hardware & Electronics",
    description: "Fast pocket storage for project files, firmware, and field notes.",
    vendor: "Amazon",
    href: amazon("portable SSD Samsung T7"),
    image: "assets/shop/portable-ssd.webp",
    visual: "storage"
  },
  {
    name: "USB-C power bank",
    category: "Hardware & Electronics",
    description: "Keep your phone and field gadgets powered away from an outlet.",
    vendor: "Amazon",
    href: amazon("USB-C power bank 10000mAh"),
    image: "assets/shop/cutouts/usb-c-powerbank.png",
    visual: "powerbank"
  },
  {
    name: "GPS module",
    category: "Hardware & Electronics",
    description: "Add location and accurate time to a radio or mapping project.",
    vendor: "Adafruit",
    href: "https://www.adafruit.com/product/746",
    image: "assets/shop/cutouts/gps-module.png",
    visual: "gps"
  },
  {
    name: "OLED display module",
    category: "Hardware & Electronics",
    description: "A crisp little screen for menus, status messages, and signal readouts.",
    vendor: "Adafruit",
    href: "https://www.adafruit.com/product/326",
    image: "assets/shop/cutouts/oled-module.png",
    visual: "oled"
  },
  {
    name: "915 MHz LoRa antenna",
    category: "Hardware & Electronics",
    description: "A compact antenna tuned for 915 MHz LoRa and Meshtastic builds.",
    vendor: "Amazon",
    href: amazon("915 MHz LoRa antenna SMA"),
    image: "assets/shop/cutouts/lora-antenna.png",
    imageFit: "slim",
    visual: "antenna"
  },
  {
    name: "IKEA BLÅHAJ",
    category: "Cool Prizes",
    description: "A very important project buddy. Excellent at morale support.",
    vendor: "IKEA",
    href: "https://www.ikea.com/us/en/p/blahaj-soft-toy-shark-90373590/",
    image: "assets/shop/cutouts/blahaj.png",
    visual: "shark"
  },
  {
    name: "Play chess with @Ash",
    category: "Cool Prizes",
    description: "Challenge @Ash to a game of chess and earn 10 one-time-use packets of instant matcha. Winner gets bragging rights!",
    vendor: "@Ash",
    href: "https://lichess.org/",
    image: "assets/shop/cutouts/chess-set.png",
    visual: "handheld"
  },
  {
    name: "Flipper Zero",
    category: "Cool Prizes",
    description: "A pocket-sized multi-tool for curious hardware tinkerers.",
    vendor: "Flipper Zero",
    href: "https://shop.flipperzero.one/",
    image: "assets/shop/cutouts/flipper-zero.png",
    visual: "handheld"
  },
  {
    name: "YubiKey 5 NFC",
    category: "Cool Prizes",
    description: "A tiny security key for adding a physical layer to your logins.",
    vendor: "Yubico",
    href: "https://www.yubico.com/product/yubikey-5-nfc/",
    image: "assets/shop/cutouts/yubikey.png",
    visual: "security-key"
  },
  {
    name: "Mechanical keyboard",
    category: "Cool Prizes",
    description: "A satisfying keyboard for late-night builds and very serious typing.",
    vendor: "Amazon",
    href: amazon("mechanical keyboard"),
    image: "assets/shop/cutouts/mechanical-keyboard-trim.png",
    imageFit: "large",
    visual: "keyboard"
  },
  {
    name: "Mini thermal printer",
    category: "Cool Prizes",
    description: "Print tiny receipts, labels, or messages from your next project.",
    vendor: "Adafruit",
    href: "https://www.adafruit.com/product/597",
    image: "assets/shop/cutouts/thermal-printer.png",
    visual: "thermal-printer"
  },
  {
    name: "3D printer",
    category: "Cool Prizes",
    description: "Turn your CAD files into real enclosures, parts, and prototypes.",
    vendor: "Bambu Lab",
    href: "https://us.store.bambulab.com/products/a1-mini",
    image: "assets/shop/cutouts/a1-mini-trim.png",
    imageFit: "large",
    visual: "printer"
  },
  {
    name: "Wacom Intuos Small",
    category: "Cool Prizes",
    description: "A compact drawing tablet for sketching interfaces and making art.",
    vendor: "Amazon",
    href: amazon("Wacom Intuos Small"),
    image: "assets/shop/cutouts/wacom-intuos.png",
    visual: "tablet"
  },
  {
    name: "Hardware component grant",
    category: "Grants & Credits",
    description: "Grab a little boost for sensors, boards, and all those tiny parts.",
    vendor: "DigiKey / LCSC",
    href: "https://www.digikey.com/",
    image: "assets/shop/grant-cards/hardware-grant.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  },
  {
    name: "JLCPCB grant",
    category: "Grants & Credits",
    description: "Put ten bucks toward getting your next custom PCB made.",
    vendor: "JLCPCB",
    href: "https://jlcpcb.com/",
    image: "assets/shop/grant-cards/jlcpcb-grant.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  },
  {
    name: "3D printing credits",
    category: "Grants & Credits",
    description: "A ten-dollar boost for turning your design into a real part.",
    vendor: "PCBWay",
    href: "https://www.pcbway.com/rapid-prototyping/3d-printing/",
    image: "assets/shop/grant-cards/3d-printing-credits.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  },
  {
    name: "AI grant",
    category: "Grants & Credits",
    description: "A little boost for AI tools to help bring your next idea to life.",
    vendor: "OpenAI",
    href: "https://developers.openai.com/api/docs/pricing",
    image: "assets/shop/grant-cards/ai-grant.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  },
  {
    name: "Server hosting credits",
    category: "Grants & Credits",
    description: "A little cloud budget to get your next project online.",
    vendor: "DigitalOcean",
    href: "https://www.digitalocean.com/pricing/droplets",
    image: "assets/shop/grant-cards/hosting-grant.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  },
  {
    name: "iFixit credits",
    category: "Grants & Credits",
    description: "Put ten bucks toward tools and parts for your next repair.",
    vendor: "iFixit",
    href: "https://www.ifixit.com/",
    image: "assets/shop/grant-cards/ifixit-grant.png",
    imageFit: "grant",
    visual: "credit",
    value: "$10"
  }
];

const itemCosts = {
  "M5Stack Cardputer ADV": 60,
  "LILYGO T-Echo (LoRa)": 70,
  "Heltec WiFi LoRa 32": 30,
  "Meshtastic-compatible LoRa device": 90,
  "HackRF One": 340,
  "RTL-SDR Blog V4": 40,
  "CC1101 module": 10,
  "ESP32-S3 development board": 15,
  "ESP32 DevKit starter board": 12,
  "USB logic analyzer": 15,
  "Pinecil V2 soldering iron": 40,
  "iFixit Mako Driver Kit": 40,
  "Portable SSD": 90,
  "USB-C power bank": 25,
  "GPS module": 15,
  "OLED display module": 8,
  "915 MHz LoRa antenna": 15,
  "IKEA BLÅHAJ": 30,
  "Play chess with @Ash": 20,
  "Flipper Zero": 170,
  "YubiKey 5 NFC": 55,
  "Mechanical keyboard": 60,
  "Mini thermal printer": 60,
  "3D printer": 200,
  "Wacom Intuos Small": 70,
  "Hardware component grant": 10,
  "JLCPCB grant": 10,
  "3D printing credits": 10,
  "AI grant": 10,
  "Server hosting credits": 10,
  "iFixit credits": 10
};
const regionMultipliers = {
  "north-america": 1.2,
  asia: 1.35
};
for (const product of products) {
  const itemCost = itemCosts[product.name];
  if (itemCost === undefined) throw new Error(`Missing estimated order cost for ${product.name}`);
  product.itemCostUSD = itemCost;
}

const shippingRegion = document.querySelector("#shipping-region");
const shippingCountry = document.querySelector("#shipping-country");
function getDeliveryMultiplier() {
  if (shippingRegion.value !== "other") return regionMultipliers[shippingRegion.value];
  const region = shippingCountry.value.trim().toLowerCase();
  if (!region) return null;
  if (/(europe|uk|united kingdom|france|germany|spain|italy|netherlands|sweden|norway|finland|ireland|poland)/.test(region)) return 1.3;
  if (/(asia|china|japan|korea|india|singapore|taiwan|thailand|indonesia|philippines|vietnam)/.test(region)) return 1.35;
  if (/(oceania|australia|new zealand)/.test(region)) return 1.45;
  if (/(africa|south africa|kenya|nigeria|egypt)/.test(region)) return 1.55;
  if (/(south america|brazil|argentina|chile|colombia|peru)/.test(region)) return 1.5;
  if (/(middle east|israel|uae|united arab emirates|saudi arabia)/.test(region)) return 1.45;
  return 1.5;
}
const priceFor = (product) => {
  const deliveryMultiplier = getDeliveryMultiplier();
  if (deliveryMultiplier === null) return null;
  const deliveredCost = product.itemCostUSD * deliveryMultiplier;
  return Math.ceil(deliveredCost / 5) * 10;
};
const priceLabel = (product) => {
  const price = priceFor(product);
  return price === null ? "Enter region" : `${price} Signal Sharks`;
};

const art = {
  handheld: '<rect x="115" y="24" width="90" height="142" rx="17" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><rect x="127" y="38" width="66" height="46" rx="5" fill="#00d5de"/><path d="M136 53h34M136 64h21" stroke="#003b4b" stroke-width="4" stroke-linecap="round"/><g fill="#ffd966"><circle cx="139" cy="104" r="6"/><circle cx="160" cy="104" r="6"/><circle cx="181" cy="104" r="6"/><circle cx="139" cy="126" r="6"/><circle cx="160" cy="126" r="6"/><circle cx="181" cy="126" r="6"/></g>',
  board: '<rect x="72" y="35" width="176" height="120" rx="12" fill="#13765e" stroke="#f8ffff" stroke-width="4"/><rect x="126" y="62" width="68" height="58" rx="5" fill="#003b4b" stroke="#00d5de" stroke-width="4"/><rect x="91" y="52" width="23" height="18" rx="3" fill="#ffd966"/><rect x="207" y="51" width="23" height="18" rx="3" fill="#ffd966"/><rect x="90" y="121" width="25" height="16" rx="3" fill="#00d5de"/><path d="M114 60h12M194 70h12M114 130h12M194 110h12M160 120v18" stroke="#f8ffff" stroke-width="3"/>',
  radio: '<rect x="90" y="49" width="140" height="106" rx="13" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><path d="M118 49 95 22" stroke="#ffd966" stroke-width="7" stroke-linecap="round"/><rect x="108" y="66" width="72" height="37" rx="5" fill="#00d5de"/><path d="M119 79h42M119 90h27" stroke="#003b4b" stroke-width="4" stroke-linecap="round"/><circle cx="201" cy="80" r="10" fill="#ffd966"/><circle cx="201" cy="119" r="17" fill="#f8ffff"/><circle cx="201" cy="119" r="7" fill="#003b4b"/>',
  module: '<rect x="86" y="48" width="148" height="100" rx="10" fill="#14735b" stroke="#f8ffff" stroke-width="4"/><rect x="112" y="66" width="54" height="50" rx="5" fill="#003b4b"/><path d="M188 72c20 0 20 32 0 32s-20-32 0-32Zm0 10c8 0 8 12 0 12s-8-12 0-12Z" fill="#ffd966"/><circle cx="105" cy="134" r="5" fill="#00d5de"/><circle cx="127" cy="134" r="5" fill="#00d5de"/><circle cx="149" cy="134" r="5" fill="#00d5de"/>',
  antenna: '<path d="M160 92v68m-22 0h44" fill="none" stroke="#f8ffff" stroke-width="9" stroke-linecap="round"/><circle cx="160" cy="75" r="8" fill="#ffd966"/><path d="M135 82a36 36 0 0 1 0-51m50 51a36 36 0 0 0 0-51M113 97a67 67 0 0 1 0-82m94 82a67 67 0 0 0 0-82" fill="none" stroke="#00d5de" stroke-width="6" stroke-linecap="round"/>',
  analyzer: '<rect x="76" y="65" width="168" height="70" rx="14" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><rect x="96" y="81" width="81" height="36" rx="4" fill="#00d5de"/><path d="M104 104h14V91h13v17h14V94h14" fill="none" stroke="#003b4b" stroke-width="4"/><path d="M193 84v34M207 84v34M221 84v34" stroke="#ffd966" stroke-width="5"/><path d="M110 135v25m22-25v25m22-25v25" stroke="#f8ffff" stroke-width="3"/>',
  solder: '<path d="m93 130 88-88 30 30-88 88z" fill="#f8ffff" stroke="#003b4b" stroke-width="5"/><path d="m169 54 16-16 30 30-16 16" fill="#00d5de" stroke="#003b4b" stroke-width="4"/><path d="m87 136-12 29 30-12" fill="#ffd966" stroke="#003b4b" stroke-width="4"/><path d="M207 59q19-19 35 0" fill="none" stroke="#ffd966" stroke-width="5" stroke-linecap="round"/>',
  driver: '<rect x="93" y="35" width="134" height="123" rx="13" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><rect x="111" y="51" width="98" height="90" rx="7" fill="#f8ffff"/><g fill="#00aeb6"><circle cx="130" cy="70" r="6"/><circle cx="160" cy="70" r="6"/><circle cx="190" cy="70" r="6"/><circle cx="130" cy="97" r="6"/><circle cx="160" cy="97" r="6"/><circle cx="190" cy="97" r="6"/><circle cx="130" cy="124" r="6"/><circle cx="160" cy="124" r="6"/><circle cx="190" cy="124" r="6"/></g>',
  storage: '<rect x="79" y="56" width="162" height="82" rx="18" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><path d="M101 76h93a19 19 0 0 1 0 38h-93a19 19 0 0 1 0-38Z" fill="#00d5de"/><circle cx="211" cy="97" r="6" fill="#ffd966"/><path d="M91 145v9m15-9v9m15-9v9" stroke="#f8ffff" stroke-width="4"/>',
  powerbank: '<rect x="103" y="33" width="114" height="130" rx="16" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><rect x="118" y="51" width="84" height="78" rx="8" fill="#00d5de"/><path d="M163 62 145 94h17l-7 24 24-36h-17l8-20Z" fill="#ffd966"/><rect x="145" y="141" width="30" height="7" rx="3" fill="#f8ffff"/>',
  gps: '<rect x="78" y="45" width="164" height="112" rx="12" fill="#14735b" stroke="#f8ffff" stroke-width="4"/><rect x="128" y="78" width="63" height="48" rx="7" fill="#003b4b"/><path d="M159 82c-17 0-26 13-26 26 0 17 26 37 26 37s26-20 26-37c0-13-9-26-26-26Z" fill="#00d5de"/><circle cx="159" cy="108" r="7" fill="#ffd966"/><path d="M92 61h21m-21 17h21m92 61h20m-20-17h20" stroke="#ffd966" stroke-width="4"/>',
  oled: '<rect x="66" y="45" width="188" height="112" rx="13" fill="#13765e" stroke="#f8ffff" stroke-width="4"/><rect x="91" y="62" width="138" height="74" rx="6" fill="#003b4b" stroke="#00d5de" stroke-width="3"/><path d="M106 115 127 95l17 12 22-25 16 15 24-22" fill="none" stroke="#ffd966" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="79" cy="57" r="4" fill="#ffd966"/><circle cx="241" cy="57" r="4" fill="#ffd966"/>',
  components: '<g stroke="#f8ffff" stroke-width="3"><rect x="75" y="54" width="56" height="38" rx="6" fill="#13765e"/><rect x="154" y="43" width="78" height="52" rx="5" fill="#003b4b"/><path d="M91 92v18m18-18v18M167 95v20m16-20v20m16-20v20m16-20v20" stroke="#ffd966" stroke-width="4"/><rect x="86" y="121" width="37" height="24" rx="5" fill="#00d5de"/><circle cx="169" cy="131" r="12" fill="#ffd966"/><path d="m202 119 17 25m0-25-17 25" stroke="#00d5de" stroke-width="7"/></g>',
  shark: '<path d="M54 111c12-37 47-61 99-60 39 1 66 16 88 47l32 19-33 10c-12 26-42 41-83 42-49 1-88-18-103-58Z" fill="#00aeb6" stroke="#f8ffff" stroke-width="4"/><path d="m131 58 22-31 13 34m38 11 23-19-2 42" fill="#00aeb6" stroke="#f8ffff" stroke-width="4" stroke-linejoin="round"/><path d="M60 116q50 14 112 1 35-7 68 3c-20 25-43 38-79 39-48 1-84-15-101-43Z" fill="#f8ffff"/><circle cx="208" cy="91" r="5" fill="#003b4b"/><path d="M255 115 286 96l-5 25 7 20-33-10" fill="#ffd966" stroke="#f8ffff" stroke-width="3"/>',
  "security-key": '<rect x="82" y="73" width="156" height="54" rx="27" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><circle cx="105" cy="100" r="10" fill="#00d5de"/><rect x="133" y="88" width="54" height="24" rx="10" fill="#00d5de"/><circle cx="207" cy="100" r="8" fill="#ffd966"/><path d="M225 91v18m-9-9h18" stroke="#f8ffff" stroke-width="3"/>',
  keyboard: '<rect x="54" y="58" width="212" height="90" rx="12" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><g fill="#00d5de" stroke="#f8ffff" stroke-width="2"><rect x="69" y="73" width="22" height="17" rx="3"/><rect x="98" y="73" width="22" height="17" rx="3"/><rect x="127" y="73" width="22" height="17" rx="3"/><rect x="156" y="73" width="22" height="17" rx="3"/><rect x="185" y="73" width="22" height="17" rx="3"/><rect x="214" y="73" width="22" height="17" rx="3"/><rect x="69" y="100" width="30" height="17" rx="3"/><rect x="106" y="100" width="30" height="17" rx="3"/><rect x="143" y="100" width="59" height="17" rx="3"/><rect x="209" y="100" width="27" height="17" rx="3"/></g><rect x="105" y="126" width="112" height="10" rx="5" fill="#ffd966"/>',
  "thermal-printer": '<rect x="76" y="71" width="168" height="85" rx="14" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><path d="M115 73V39h91v34" fill="#f8ffff" stroke="#003b4b" stroke-width="4"/><path d="M129 51h62m-62 11h49" stroke="#00aeb6" stroke-width="4" stroke-linecap="round"/><rect x="101" y="96" width="118" height="28" rx="8" fill="#00d5de"/><circle cx="214" cy="139" r="6" fill="#ffd966"/>',
  printer: '<path d="M80 42h160v116H80z" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><path d="M102 57h116v78H102z" fill="#00d5de" stroke="#f8ffff" stroke-width="3"/><path d="M160 62v68m-53-34h106m-88-32 70 66m0-66-70 66" stroke="#003b4b" stroke-width="4"/><path d="M115 139h90v17h-90z" fill="#ffd966"/><circle cx="221" cy="147" r="5" fill="#00d5de"/>',
  tablet: '<rect x="66" y="39" width="188" height="119" rx="14" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><rect x="81" y="52" width="158" height="92" rx="7" fill="#00d5de"/><path d="m108 121 32-44 23 30 19-19 28 33" fill="none" stroke="#003b4b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="m211 40 14-18 17 9-14 18" fill="#ffd966" stroke="#f8ffff" stroke-width="3"/>',
  credit: '<path d="M70 53h180v101H70z" rx="12" fill="#003b4b" stroke="#f8ffff" stroke-width="4"/><path d="M70 80h180" stroke="#00d5de" stroke-width="6"/><circle cx="94" cy="67" r="6" fill="#ffd966"/><circle cx="226" cy="67" r="6" fill="#ffd966"/><text x="160" y="128" fill="#ffd966" font-family="Baloo 2, sans-serif" font-size="46" font-weight="800" text-anchor="middle">$10</text>'
};

function productImage(product) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" role="img" aria-label="${product.name} illustration"><g transform="translate(32 19) scale(.8)">${art[product.visual]}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const shop = document.querySelector("#shop-products");
const dialog = document.querySelector("#product-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCategory = document.querySelector("#dialog-category");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogValue = document.querySelector("#dialog-value");
const dialogBuy = document.querySelector("#dialog-buy");
let activeProduct;

function updateProductPrices() {
  shippingCountry.hidden = shippingRegion.value !== "other";
  for (const card of shop.querySelectorAll(".product-card")) {
    const product = products.find((item) => item.name === card.dataset.productName);
    card.querySelector(".product-value").textContent = priceLabel(product);
  }
  if (activeProduct) dialogValue.textContent = priceLabel(activeProduct);
}

shippingRegion.addEventListener("change", updateProductPrices);
shippingCountry.addEventListener("input", updateProductPrices);

for (const category of categories) {
  const section = document.createElement("section");
  section.className = "shop-category";
  section.id = category.id;
  section.setAttribute("aria-labelledby", `${category.id}-heading`);

  const heading = document.createElement("h2");
  heading.id = `${category.id}-heading`;
  heading.textContent = category.title;

  const grid = document.createElement("div");
  grid.className = "product-grid";

  for (const product of products.filter((item) => item.category === category.title)) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "product-card";
    card.dataset.productName = product.name;
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `View ${product.name}`);

    const visual = document.createElement("span");
    visual.className = "product-visual";
    const image = document.createElement("img");
    image.className = `product-art ${product.image ? "product-photo" : "product-icon"}${product.imageFit === "slim" ? " product-art--slim" : ""}${product.imageFit === "grant" ? " product-art--grant" : ""}`;
    if (product.imageFit === "large") image.classList.add("product-art--large");
    image.src = product.image || productImage(product);
    image.alt = product.image ? `${product.name} product photo` : `${product.name} illustration`;
    image.loading = "lazy";
    visual.append(image);

    const copy = document.createElement("span");
    copy.className = "product-copy";

    const name = document.createElement("span");
    name.className = "product-title";
    name.textContent = product.name;
    copy.append(name);

    const value = document.createElement("span");
    value.className = "product-value";
    value.textContent = priceLabel(product);
    copy.append(value);

    card.append(visual, copy);
    card.addEventListener("click", () => {
      activeProduct = product;
      dialogImage.src = image.src;
      dialogImage.alt = image.alt;
      dialogImage.classList.toggle("dialog-image--slim", product.imageFit === "slim");
      dialogImage.classList.toggle("dialog-image--grant", product.imageFit === "grant");
      dialogCategory.textContent = `${product.category} · ${product.vendor}`;
      dialogTitle.textContent = product.name;
      dialogDescription.textContent = product.description;
      dialogValue.textContent = priceLabel(product);
      dialogValue.hidden = false;
      dialogBuy.href = product.href;
      dialogBuy.setAttribute("aria-label", `Shop ${product.name} at ${product.vendor}`);
      dialog.showModal();
    });

    grid.append(card);
  }

  section.append(heading, grid);
  shop.append(section);
}

updateProductPrices();

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

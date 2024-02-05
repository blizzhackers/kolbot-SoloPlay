/**
*  @filename    NameGen.js
*  @author      isid0re, theBGuy (added bigger list of nouns)
*  @desc        Creates character names by combining a Descriptive Adjective + Noun
*
*/

(function (module) {
  const adjectives = [
    "Ancient", "Angry", "Artful", "Able", "Abundant", "Accepting", "Acclaimed", "Active", "Addictive", "Adept", "Adequate", "Admired", "Adorable",
    "Adored", "Agile", "Amazing", "Amiable", "Amicable", "Amusing", "Anxious", "Anxious", "Apathetic", "Aquatic", "Arrogant", "Artistic",
    "Attentive", "Awesome", "Azure", "Barren", "Bitter", "Black", "Blue", "Blasted", "Bold", "Bonding", "Boorish", "Bountiful", "Braggart",
    "Brave", "Bright", "Brilliant", "Broken", "Burning", "Busy", "Buzzing", "Callous", "Captious", "Caring", "Cautious", "Celestial",
    "Changing", "Charming", "Chaste", "Cheating", "Cheerful", "Churlish", "Civil", "Clean", "Clever", "Coastal", "Cold", "Colossal",
    "Composed", "Concerned", "Concrete", "Complex", "Cheap", "Compact", "Confident", "Congenial", "Cordial", "Courteous", "Covetous", "Crazy",
    "Crazed", "Creative", "Crimson", "Critical", "Crossing", "Crucial", "Crude", "Crushing", "Culpable", "Curious", "Current", "Curt", "Cynical",
    "Dancing", "Dark", "Decent", "Decorous", "Defensive", "Deft", "Dejected", "Delirious", "Demanding", "Demeaning", "Demise", "Depressed",
    "Devious", "Devoted", "Diligent", "Discreet", "Diving", "Dishonest", "Docile", "Downcast", "Doubting", "Drunken", "Dry", "Dull", "Dutiful",
    "Dynamic", "Eager", "Earnest", "Earthy", "East", "Efficient", "Elegant", "Elitist", "Emerald", "Endemic", "Energetic", "Enigmatic", "Esteemed",
    "Estimable", "Ethical", "Euphoric", "Evergreen", "Exclusive", "Expectant", "Explosive", "Exquisite", "Exuberant", "Endless", "Fair", "Faithful",
    "False", "Famous", "Fancy", "Fat", "Fatal", "Festive", "Feral", "Ferocious", "Fertile", "Fervent", "Funky", "Fibrous", "Fierce", "Firm",
    "Flawless", "Flexible", "Flowing", "Focused", "Forgiving", "Forlorn", "Frail", "Fierce", "Flustered", "Flying", "Foolish", "Friendly",
    "Generous", "Genial", "Genteel", "Gentle", "Genuine", "Gifted", "Gigantic", "Glib", "Gloomy", "Golden", "Good", "Gorgeous", "Graceful",
    "Gracious", "Grand", "Grateful", "Gravity", "Green", "Grouchy", "Guilty", "Guilty", "Gusty", "Grim", "Green", "Greedy", "Handsome", "Handy",
    "Hard", "Happy", "Haunting", "Healing", "Headless", "Heavenly", "Heroic", "Hidden", "High", "Honest", "Honorable", "Hopeful", "Hostile",
    "Humane", "Humble", "Humorous", "Hungry", "Hygienic", "Idolize", "Ignoble", "Ignorant", "Impartial", "Impolite", "Improper", "Imprudent",
    "Impudent", "Indecent", "Infinite", "Ingenuous", "Innocent", "Insolent", "Insulting", "Intense", "Introvert", "Intuitive", "Inventive",
    "Irascible", "Intrepid", "Jade", "Janky", "Jaundiced", "Jealous", "Jealous", "Jocular", "Jolly", "Jovial", "Juicy", "Joyful", "Jubilant",
    "Just", "Juvenile", "Kingly", "Keen", "Kind", "Kindred", "Kooky", "Liberal", "Listening", "Loathsome", "Loving", "LOYAL", "Limp", "Lord",
    "Loud", "Light", "Little", "Lanky", "Lazy", "Long", "Lucky", "Last", "Leaping", "Lone", "Lonely", "Lost", "Magical", "Majestic", "Malicious",
    "Mammoth", "Marine", "Masterful", "Meddling", "Migratory", "Minuscule", "Miserable", "Misty", "Modest", "Moral", "Mediocre", "Mellow", "Mute",
    "Miserable", "Naive", "Nascent", "Native", "Natural", "Natures", "Needy", "Nefarious", "Negative", "Neglected", "Negligent", "Nice", "Noble",
    "Northern", "Notorious", "Obedient", "Observant", "Open", "Orderly", "Original", "Outspoken", "Organic", "Ornate", "Ordinary", "Orange",
    "Parasitic", "Partial", "Patient", "Personal", "Petulant", "Pleasant", "Poise", "Polite", "Pollutant", "Popular", "Pouncing", "Powerful",
    "Prideful", "Primal", "Prime", "Pristine", "Prompt", "Proper", "Punctual", "Pure", "Purple", "Putrid", "Practical", "Precious", "Puzzled",
    "Quaint", "Quick", "Quiet", "Quirky", "Radiant", "Raging", "Rancorous", "Regular", "Red", "Rancid", "Rough", "Rational", "Reckless", "Refined",
    "Regal", "Renewable", "Repugnant", "Resilient", "Resolute", "Reverent", "Rotting", "Ruby", "Rude", "Ruthless", "Sad", "Safe", "Savage",
    "Scorching", "Scornful", "Secret", "Selfish", "Sensible", "Sensitive", "Sharing", "Silver", "Simple", "Sober", "Solar", "Solemn", "Solitary",
    "Southern", "Sour", "Spatial", "Special", "Splendid", "Staunch", "Singing", "Stern", "Stunning", "Subtle", "Sullen", "Superb", "Superior",
    "Surly", "Sweet", "Strong", "Smart", "Short", "Skinny", "Stupid", "Salty", "Soft", "Smooth", "Sharp", "Sneaky", "Stinky", "Tactful", "Tainted",
    "Temperate", "Temperate", "Tenacious", "Terrible", "Terrific", "Testy", "Tolerant", "Towering", "Toxic", "Tropical", "True", "Truthful", "Tasty",
    "Tricky", "Ultimate", "Ultimate", "Uncivil", "Uncouth", "Unethical", "Unfair", "Unique", "United", "Unfit", "Unrefined", "Unsavory", "Unworthy",
    "Uplifting", "Upright", "Uprooted", "Valiant", "Veracious", "Versatile", "Vicious", "Vigilant", "Vigilant", "Vigorous", "Vile", "Virtuous",
    "Visible", "Vivacious", "Vocal", "Volatile", "Violent", "Violet", "Void", "Weak", "West", "White", "Willful", "Wet", "Warm", "Wary", "Watchful",
    "Weeping", "Wicked", "Wild", "Willing", "Winning", "Winsome", "Wise", "Wistful", "Witty", "Woeful", "Wonderful", "Worldwide", "Wretched",
    "Worthy", "Yellow", "Yearning", "Yielding", "Yielding", "Yourself", "Youthful", "Zany", "Zealot", "Zealous", "Zealous", "Zero",
  ];

  const nouns = [
    "glue", "riot", "boom", "veil", "poet", "hype", "cafe", "gene", "fame", "sin", "zon", "barb", "core", "dust", "bite", "maid", "scar",
    "wing", "horn", "crew", "lake", "duke", "mask", "dawn", "seed", "tank", "flag", "jazz", "tart", "brew", "meow", "boot", "shoe", "sage", "drum",
    "babe", "cash", "luck", "lime", "eyes", "boat", "milk", "tuna", "cube", "oreo", "worm", "rage", "itch", "four", "bomb", "pear", "ship", "oven",
    "fear", "hate", "leaf", "hero", "wife", "bean", "hope", "girl", "baby", "meme", "wish", "one", "nine", "work", "cake", "lady", "fire", "pain",
    "rain", "fool", "soul", "tree", "five", "fish", "love", "life", "elk", "dad", "hog", "elf", "mop", "rod", "bat", "bug", "bot", "pus", "ufo",
    "zen", "ark", "rag", "egg", "bed", "car", "boy", "man", "cricket", "aura", "moon", "hippo", "vortex", "palm", "panther", "meteor", "deer",
    "vein", "plan", "atom", "hole", "weed", "boss", "army", "meat", "lock", "song", "rat", "rose", "blossom", "twin", "comet", "fist", "crow",
    "star", "starlight", "axe", "fury", "mouse", "blow", "swan", "bee", "asp", "viper", "feather", "bird", "bolt", "sun", "mind", "beaver", "frog",
    "mist", "day", "night", "falcon", "blood", "poison", "lily", "inferno", "kiss", "lotus", "giant", "monarch", "lord", "autumn", "spring",
    "summer", "winter", "paragon", "vulture", "condor", "coil", "chain", "spell", "dove", "peach", "petal", "droplet", "eruption", "heaven", "fog",
    "boa", "needle", "shield", "rock", "turtle", "ghost", "death", "cobra", "bane", "princess", "king", "fingers", "toes", "hand", "foot", "ear",
    "eye", "skull", "cat", "dog", "pig", "piggy", "cow", "snake", "horse", "rabbit", "goat", "wolf", "sheep", "duck", "eagle", "crab", "baboon", "basilisk",
    "fox", "badger", "beetle", "butterfly", "shark", "clownfish", "crane", "cicada", "dingo", "elephant", "jackal", "jaguar", "lion", "mandrill",
    "lungfish", "heart", "spleen", "liver", "guts", "brains", "bones", "chocolate", "candy", "surprise", "cheese", "furball", "salami", "beef",
    "supreme", "taco", "burger", "hotdog", "carrot", "onion", "fungus", "brick", "rock", "banana", "killer", "demon", "angel", "saint", "bamboo",
    "panda", "broom", "hammer", "snow", "cur", "toad", "raven", "claw", "pine", "rice", "sushi", "bread", "toast", "cereal", "smoke", "fart",
    "beer", "bear", "faucet", "pipe", "iron", "dork", "genius", "hunter", "farmer", "wiz", "witch", "churro", "donut", "shrimp", "sand", "pagoda",
    "eel", "ant", "pants", "jeans", "socks", "sword", "fork", "pizza", "trap", "pork", "wort", "sack", "hawk", "rite", "tire", "dirt", "plum",
    "ATM", "CD", "SUV", "TV", "abacus", "abbey", "abdomen", "ability", "absence", "abuse", "academy", "accent", "access", "accord", "account", "acetate", "acid", "acorn",
    "acre", "acrylic", "act", "action", "actor", "actress", "ad", "adapter", "address", "admin", "admire", "adobe", "adult", "advance", "advent", "adverb", "advice", "adviser",
    "affair", "affect", "afoul", "age", "agency", "agenda", "agent", "aglet", "agony", "aid", "aide", "aim", "air", "airbag", "airbus", "airfare", "airline", "airmail", "airman",
    "airport", "airship", "alarm", "alb", "album", "alcohol", "alcove", "alder", "ale", "alert", "alfalfa", "algebra", "alias", "alibi", "alien", "alley", "alloy", "almanac", "almond",
    "alpaca", "alpha", "altar", "alto", "amazon", "amber", "amenity", "amnesty", "amount", "anagram", "analog", "analogy", "analyst", "anarchy", "anatomy", "anchovy", "android", "angel",
    "anger", "angina", "angle", "angora", "anguish", "animal", "anime", "anise", "ankle", "anklet", "annual", "anorak", "answer", "ant", "antigen", "antique", "antler", "antling", "anxiety",
    "anybody", "anyone", "ape", "apology", "app", "apparel", "appeal", "apple", "apricot", "apron", "apse", "aquifer", "arcade", "arch", "archer", "area", "arena", "ark", "arm", "armoire", "armor",
    "armour", "armpit", "armrest", "army", "array", "arrest", "arrival", "arrow", "art", "artery", "arthur", "article", "artist", "ascend", "ascent", "ascot", "ash", "ashram", "ashtray", "aside",
    "aspect", "asphalt", "aspic", "assault", "asset", "assist", "atelier", "athlete", "atom", "atrium", "attack", "attempt", "attic", "auction", "audit", "aunt", "author", "auto",
    "autumn", "avenue", "average", "avocado", "award", "awe", "axis", "azimuth", "babe", "baboon", "baby", "back", "back-up", "backup", "bacon", "badge", "badger", "bag", "bagel", "baggage", "baggie",
    "baggy", "bagpipe", "bail", "bait", "bake", "baker", "bakery", "balance", "balcony", "ball", "ballet", "balloon", "ballot", "bamboo", "ban", "banana", "band", "bandana", "bangle", "banjo", "bank",
    "banker", "banking", "banner", "banyan", "baobab", "bar", "barber", "bargain", "barge", "barium", "bark", "barley", "barn", "barrage", "barrel", "barrier", "base", "basics", "basil", "basin", "basis",
    "basket", "bass", "bassoon", "bat", "bath", "bather", "bathtub", "batter", "battery", "batting", "battle", "bay", "bayou", "beach", "bead", "beak", "beam", "bean", "beanie", "bear", "beard", "beast",
    "beastie", "beat", "beating", "beauty", "beaver", "beck", "bed", "bedrock", "bedroom", "bee", "beech", "beef", "beer", "beet", "beetle", "beggar", "begonia", "behalf", "behest", "behold", "being",
    "belfry", "belief", "bell", "bellows", "belly", "belt", "bench", "bend", "benefit", "beret", "berry", "bet", "beyond", "bias", "bicycle", "bid", "bidder", "bidding", "bidet", "bijou", "bike", "bikini",
    "bill", "billing", "billion", "bin", "biology", "biopsy", "biplane", "birch", "bird", "birth", "biscuit", "bit", "bite", "bitten", "bitter", "black", "bladder", "blade", "blame", "blank", "blanket",
    "blast", "blazer", "blend", "blight", "blind", "blinker", "blister", "block", "blocker", "blog", "blogger", "blood", "bloom", "bloomer", "blossom", "blouse", "blow", "blowgun", "blue", "blush", "boar",
    "board", "boat", "bob", "bobcat", "body", "bog", "bolero", "bolt", "bomb", "bomber", "bombing", "bond", "bonding", "bone", "bonfire", "bongo", "bonnet", "bonsai", "bonus", "book", "bookend", "booking",
    "booklet", "boolean", "boom", "boon", "boost", "booster", "boot", "bootee", "bootie", "booty", "border", "bore", "bosom", "boss", "botany", "bother", "bottle", "bottom", "boudoir", "bough", "boulder",
    "bouquet", "bout", "bow", "bower", "bowl", "bowler", "bowling", "bowtie", "box", "boxer", "boy", "boycott", "boyhood", "bra", "brace", "bracket", "brain", "brake", "bran", "branch", "brand", "brandy",
    "brass", "bread", "break", "breast", "breath", "breeze", "brewer", "bribery", "brick", "bride", "bridge", "brief", "briefly", "briefs", "brink", "brisket", "broad", "broiler", "broker", "bronco",
    "bronze", "brooch", "brood", "brook", "broom", "brother", "brow", "brown", "brownie", "browser", "brunch", "brush", "bubble", "buck", "bucket", "buckle", "bud", "buddy", "budget", "buffalo", "buffer",
    "buffet", "bug", "buggy", "bugle", "builder", "bulb", "bulk", "bull", "bullet", "bump", "bumper", "bun", "bunch", "burden", "bureau", "burglar", "burial", "burn", "burning", "burrito", "burro", "burrow",
    "burst", "bus", "bush", "bust", "bustle", "butane", "butcher", "butler", "butter", "button", "buy", "buyer", "buying", "buzz", "buzzard", "c-clamp", "cabana", "cabbage", "cabin", "cabinet", "cable",
    "caboose", "cacao", "cactus", "caddy", "cadet", "cafe", "caftan", "cage", "cake", "calf", "caliber", "calibre", "calico", "call", "calm", "calorie", "camel", "cameo", "camera", "camp", "camper", "campus",
    "can", "canal", "cancer", "candle", "candy", "cane", "cannon", "canoe", "canon", "canopy", "canteen", "canvas", "cap", "cape", "caper", "capital", "capon", "captain", "caption", "captor", "car", "carabao",
    "caramel", "caravan", "carbon", "card", "care", "career", "cargo", "caribou", "carload", "carol", "carp", "carpet", "carport", "carrier", "carrot", "carry", "cart", "cartel", "carter", "cartoon", "carving",
    "cascade", "case", "cash", "cashew", "cashier", "casino", "casket", "cassava", "cassock", "cast", "castle", "cat", "catch", "catcher", "cation", "catsup", "cattle", "causal", "cause", "caution", "cave",
    "caviar", "cayenne", "ceiling", "celery", "cell", "cellar", "cello", "celsius", "cement", "census", "cent", "center", "centre", "century", "ceramic", "cereal", "chafe", "chain", "chair", "chaise", "chalet",
    "chalice", "chalk", "chamber", "chance", "change", "channel", "chaos", "chap", "chapel", "chapter", "chard", "charge", "charger", "charity", "charm", "charset", "chart", "charter", "chasm", "chassis",
    "chateau", "chatter", "check", "cheddar", "cheek", "cheer", "cheese", "cheetah", "chef", "chem", "cheque", "cherry", "chess", "chest", "chick", "chicken", "chicory", "chief", "child", "chili", "chill",
    "chime", "chin", "chino", "chip", "chive", "chives", "choice", "choir", "choker", "chop", "chops", "chord", "chorus", "chow", "chowder", "chrome", "chub", "chuck", "chug", "church", "churn", "chutney",
    "cicada", "cinder", "cinema", "circle", "circuit", "cirrus", "citizen", "citron", "citrus", "city", "claim", "clam", "clamp", "clan", "clank", "clarity", "clasp", "class", "classic", "clause", "clave",
    "clavier", "claw", "clay", "cleaner", "cleat", "clef", "cleft", "cleric", "clerk", "click", "client", "cliff", "climate", "climb", "clinic", "clip", "clipper", "cloak", "clock", "clogs", "clone", "close",
    "closet", "closing", "closure", "cloth", "clothes", "cloud", "clove", "clover", "cloves", "club", "clue", "cluster", "clutch", "coach", "coal", "coast", "coaster", "coat", "cob", "cobbler", "cobweb", "cock",
    "cockpit", "cocoa", "coconut", "cod", "code", "codling", "codon", "coffee", "coffin", "cohort", "coil", "coin", "coke", "cold", "collar", "collard", "college", "colon", "colony", "color", "colt", "column",
    "comb", "combat", "combine", "comedy", "comfort", "comic", "comics", "comma", "command", "comment", "common", "company", "compass", "complex", "compost", "con", "concept", "concern", "concert", "condor",
    "conduct", "cone", "conga", "congo", "conifer", "consent", "consist", "console", "consul", "contact", "contact", "lens", "content", "contest", "context", "contour", "control", "convert", "cook", "cookie",
    "cooking", "cop", "cop-out", "cope", "copper", "copy", "copying", "coral", "cord", "core", "cork", "corn", "corner", "cornet", "corps", "corral", "corsage", "cosset", "cost", "costume", "cot", "cottage",
    "cotton", "couch", "cougar", "cough", "council", "counsel", "count", "counter", "country", "county", "couple", "coupon", "courage", "course", "court", "cousin", "cover", "cow", "cowbell", "cowboy", "coyote",
    "crab", "crack", "cracker", "cradle", "craft", "crane", "cranky", "crap", "crash", "crate", "cravat", "craw", "crawdad", "crayon", "crazy", "cream", "creator", "creche", "credit", "creek", "creme", "brulee", "crepe",
    "crest", "crew", "crewman", "crewmen", "cria", "crib", "cricket", "crime", "crisis", "crisp", "critic", "crocus", "crook", "crop", "cross", "crotch", "croup", "crow", "crowd", "crown", "crude", "cruelty", "cruise",
    "crumb", "crunch", "crush", "crust", "cry", "crystal", "cub", "cube", "cuckoo", "cue", "cuisine", "culture", "culvert", "cup", "cupcake", "cupola", "curd", "cure", "curio", "curl", "curler", "currant", "current",
    "curry", "curse", "cursor", "curtain", "curve", "cushion", "custard", "custody", "custom", "cut", "cuticle", "cutlet", "cutover", "cutting", "cycle", "cyclone", "cygnet", "cymbal", "cynic", "cyst", "dad", "daddy",
    "dagger", "dahlia", "daikon", "daily", "dairy", "daisy", "dam", "damage", "dame", "damn", "dance", "dancer", "dancing", "danger", "dare", "dark", "darn", "dart", "dash", "data", "date", "dawn", "day", "daybed", "dead",
    "deal", "dealer", "dealing", "dearest", "death", "debate", "debris", "debt", "debtor", "decade", "decency", "decimal", "deck", "decline", "decoder", "deduce", "deed", "deep", "deer", "default", "defeat", "defense",
    "deficit", "degree", "delay", "delight", "demand", "demon", "demur", "den", "denim", "density", "dentist", "deposit", "depot", "depth", "deputy", "derby", "derrick", "descent", "desert", "design", "desire", "desk",
    "desktop", "dessert", "destiny", "detail", "detour", "device", "devil", "dew", "dhow", "diadem", "diagram", "dial", "dialect", "diam", "diamond", "diaper", "diarist", "diary", "dibble", "dick", "dickey", "diction",
    "die", "diesel", "diet", "diffuse", "dig", "digger", "digging", "digit", "dignity", "dill", "dime", "dimple", "diner", "dinghy", "dining", "dinner", "dioxide", "dip", "diploma", "dirndl", "dirt", "disco", "disdain",
    "disease", "disgust", "dish", "disk", "display", "dispute", "divan", "diver", "divide", "divider", "divine", "diving", "divorce", "doc", "dock", "doctor", "doe", "dog", "doggie", "dogsled", "dogwood", "doing", "doll",
    "dollar", "dollop", "dolman", "dolor", "dolphin", "domain", "dome", "donkey", "donor", "donut", "door", "doorway", "dory", "dose", "dot", "double", "doubt", "doubter", "dough", "down", "dozen", "draft", "drag", "dragon",
    "drain", "drake", "drama", "drapes", "draw", "drawer", "drawing", "dream", "dreamer", "dredger", "dress", "dresser", "drill", "drink", "drive", "driver", "driving", "drizzle", "drop", "drug", "drum", "drummer", "drunk",
    "dryer", "duck", "dud", "dude", "due", "duel", "dueling", "duffel", "dugout", "dump", "dump", "truck", "dune", "dune", "buggy", "dungeon", "durian", "dusk", "dust", "dust", "storm", "duster", "duty", "dwarf", "dwell",
    "dynamo", "dynasty", "e-book", "e-mail", "eagle", "eaglet", "ear", "eardrum", "earplug", "earring", "earth", "ease", "easel", "east", "eating", "eaves", "echidna", "eclipse", "ecology", "economy", "eddy", "edge",
    "edger", "edible", "editing", "edition", "editor", "eel", "effect", "effort", "egg", "egghead", "eggnog", "ego", "ejector", "elbow", "element", "elf", "elicit", "elite", "elixir", "elk", "ellipse", "elm", "elver",
    "email", "emanate", "embassy", "embryo", "emerald", "emery", "emitter", "emotion", "empire", "employ", "emu", "enclave", "end", "endive", "enemy", "energy", "engine", "enigma", "enquiry", "entity", "entree", "entry",
    "envy", "enzyme", "epee", "ephyra", "epic", "episode", "epoch", "eponym", "epoxy", "equal", "equinox", "equity", "era", "eraser", "erosion", "error", "escape", "escort", "essay", "essence", "estate", "estuary", "ethics",
    "ethyl", "eve", "evening", "event", "evil", "ex-wife", "exam", "example", "excerpt", "excess", "excuse", "exhaust", "exhibit", "exile", "exit", "expense", "expert", "export", "expose", "extent", "extreme", "eye", "eyeball",
    "eyebrow", "eyelash", "eyelid", "eyelids", "eyrie", "fabric", "face", "facet", "fact", "factor", "factory", "faculty", "fail", "failure", "fairy", "faith", "fall", "fallacy", "fame", "family", "fan", "fang", "fanny", "fantasy",
    "farm", "farmer", "farming", "farrow", "fascia", "fashion", "fat", "fate", "father", "fatigue", "faucet", "fault", "fav", "fava", "favor", "fawn", "fax", "fear", "feast", "feather", "feature", "fedora", "fee", "feed", "feeding",
    "feel", "feeling", "fellow", "felony", "female", "fen", "fence", "fencing", "fender", "feng", "fennel", "ferret", "ferry", "fetus", "few", "fiber", "fibre", "ficlet", "fiction", "fiddle", "field", "fiery", "fiesta", "fifth", "fig",
    "fight", "fighter", "figure", "file", "filing", "fill", "fillet", "filly", "film", "filter", "filth", "final", "finance", "finding", "fine", "finer", "finger", "finish", "fir", "fire", "fireman", "firm", "first", "fish", "fishery",
    "fishing", "fishnet", "fisting", "fit", "fitness", "fix", "fixture", "flag", "flair", "flame", "flan", "flanker", "flare", "flash", "flat", "flavor", "flax", "fleck", "fleece", "flesh", "flick", "flicker", "flight", "flint", "flock",
    "flood", "floor", "floozie", "flour", "flow", "flower", "flu", "fluke", "flume", "flung", "flute", "fly", "flytrap", "foal", "foam", "fob", "focus", "fog", "fold", "folder", "folk", "fondue", "font", "food", "fool", "foot", "footage",
    "forage", "forager", "foray", "force", "ford", "forearm", "forest", "forever", "forgery", "fork", "form", "formal", "format", "former", "formula", "fort", "forte", "fortune", "forum", "founder", "fourths", "fowl", "fox", "frame",
    "fraud", "freak", "freckle", "freedom", "freezer", "freight", "frenzy", "freon", "fresco", "fridge", "friend", "fries", "frigate", "fright", "fringe", "fritter", "frock", "frog", "front", "frost", "frown", "fruit", "fry", "fvck",
    "fuel", "fugato", "full", "fun", "fund", "funding", "funeral", "fur", "furnace", "furry", "futon", "future", "gadget", "gaffe", "gaffer", "gain", "gaiters", "gale", "gallery", "galley", "gallon", "game", "gaming", "gander", "gang",
    "gap", "garage", "garb", "garbage", "garden", "garlic", "garment", "garter", "gas", "gasket", "gasp", "gate", "gateway", "gather", "gator", "gauge", "gavel", "gazebo", "gazelle", "gear", "geek", "gel", "gelatin", "gelding", "gem",
    "gemsbok", "gender", "gene", "general", "genie", "genius", "genre", "geology", "gerbil", "gesture", "geyser", "gherkin", "ghost", "giant", "gift", "gig", "giggle", "ginger", "ginseng", "giraffe", "girdle", "girl", "git", "glacier",
    "glance", "gland", "glass", "glasses", "glee", "glen", "glider", "gliding", "glimpse", "globe", "gloom", "glory", "glove", "glow", "glucose", "glue", "glut", "gnat", "gnu", "go-kart", "goal", "goat", "gobbler", "god", "goddess", "goggles",
    "going", "gold", "golf", "gondola", "gong", "good", "goodbye", "goodie", "goose", "gopher", "gorilla", "gosling", "gossip", "gown", "grace", "grade", "graft", "grain", "gram", "grammar", "gran", "grand", "grandma", "grandpa", "granny",
    "granola", "grant", "grape", "graph", "graphic", "grasp", "grass", "gravel", "gravity", "gravy", "gray", "grease", "greed", "green", "greens", "grenade", "grey", "grid", "grief", "grill", "grin", "grip", "gripper", "grit", "grocery",
    "ground", "group", "grouper", "grouse", "grove", "growth", "grub", "guard", "guava", "guess", "guest", "guide", "guilder", "guilt", "guilty", "guinea", "guitar", "gum", "gumshoe", "gun", "gutter", "guy", "gym", "gymnast", "gyro", "habit",
    "habitat", "hacksaw", "hail", "hair", "haircut", "hake", "half", "halibut", "hall", "hallway", "halt", "ham", "hammer", "hammock", "hamster", "hand", "handful", "handgun", "handle", "handsaw", "hanger", "harald", "harbor", "harbour",
    "hardhat", "hare", "harm", "harmony", "harp", "harvest", "hash", "hashtag", "hassock", "haste", "hat", "hatbox", "hatchet", "hate", "hatred", "haunt", "haven", "havoc", "hawk", "hay", "haze", "hazel", "head", "health", "hearing", "hearsay",
    "heart", "hearth", "heat", "heater", "heating", "heaven", "heavy", "hectare", "hedge", "heel", "heifer", "height", "heir", "helium", "hell", "hellcat", "hello", "helmet", "helo", "help", "hemp", "hen", "herb", "herbs", "hermit", "hero",
    "heroine", "heron", "herring", "hexagon", "heyday", "hiccups", "hide", "high", "highway", "hike", "hiking", "hill", "hint", "hip", "hire", "hiring", "history", "hit", "hive", "hobbit", "hobby", "hockey", "hoe", "hog", "hold", "holder",
    "hole", "holiday", "home", "homonym", "honesty", "honey", "honor", "honoree", "hood", "hoof", "hook", "hop", "hope", "hops", "horde", "horizon", "hormone", "horn", "hornet", "horror", "horse", "horst", "hose", "hosiery", "hospice",
    "host", "hostel", "hostess", "hotdog", "hotel", "hound", "hour", "house", "housing", "hovel", "howard", "hub", "hubcap", "hubris", "hug", "hugger", "hull", "human", "hummus", "humor", "humour", "hundred", "hunger", "hunt", "hunter",
    "hunting", "hurdle", "hurdler", "hurry", "hurt", "husband", "hut", "hutch", "hydrant", "hyena", "hype", "ice", "iceberg", "icicle", "icing", "icon", "icy", "id", "idea", "ideal", "idiom", "idiot", "igloo", "ikebana", "illegal", "illness",
    "image", "impact", "impala", "import", "impress", "impulse", "in-joke", "in-laws", "inbox", "incense", "inch", "income", "index", "infancy", "infant", "infix", "influx", "info", "ingrate", "initial", "injury", "ink", "inlay", "inn", "input",
    "inquiry", "insect", "insert", "inside", "insight", "instant", "integer", "intent", "invader", "inverse", "invite", "invoice", "iris", "iron", "irony", "island", "issue", "item", "ivory", "jack", "jackal", "jacket", "jade", "jaguar", "jail",
    "jam", "jar", "jasmine", "jaw", "jazz", "jeans", "jeep", "jelly", "jerk", "jet", "jewel", "jewelry", "jicama", "jiffy", "job", "jockey", "joey", "jogging", "joint", "joke", "jot", "journal", "journey", "joy", "judge", "judo", "jug", "juice",
    "jumbo", "jump", "jumper", "jungle", "junior", "junk", "junker", "junket", "jury", "justice", "jute", "kale", "karate", "kayak", "kazoo", "kebab", "keep", "keeper", "kendo", "kennel", "ketch", "ketchup", "kettle", "key", "kick", "kid", "kidney",
    "kill", "killer", "killing", "kilt", "kimono", "kinase", "kind", "king", "kingdom", "kiosk", "kiss", "kit", "kitchen", "kite", "kitsch", "kitten", "kitty", "kiwi", "knee", "knife", "knight", "knock", "knot", "knuckle", "koala", "kumquat", "lab",
    "label", "labor", "laborer", "labour", "lace", "lack", "lad", "ladder", "ladle", "lady", "ladybug", "lag", "lake", "lamb", "lambkin", "lament", "lamp", "lanai", "land", "landing", "lane", "lantern", "lap", "lapdog", "laptop", "larch", "lard",
    "larder", "lark", "larva", "lasagna", "lashes", "last", "latency", "latex", "lathe", "latte", "latter", "laugh", "laundry", "lava", "law", "lawn", "lawsuit", "lawyer", "lay", "layer", "layout", "lead", "leader", "leading", "leaf", "league",
    "leaker", "leap", "leash", "leather", "leave", "leaver", "lecture", "leek", "leeway", "left", "leg", "legacy", "legal", "legend", "legging", "legume", "leisure", "lemon", "lemur", "lender", "lending", "length", "lens", "lentil", "leopard",
    "leprosy", "lesbian", "lesson", "letter", "lettuce", "level", "lever", "leveret", "liar", "liberty", "libido", "library", "licence", "license", "lid", "lie", "lieu", "life", "lift", "ligand", "light", "ligula", "lilac", "lily", "limb", "lime",
    "limit", "limo", "line", "linen", "liner", "lining", "link", "linkage", "linseed", "lion", "lip", "lipid", "liquid", "liquor", "list", "listing", "litmus", "litter", "liver", "living", "lizard", "llama", "load", "loading", "loaf", "loafer", "loan",
    "lobby", "lobster", "local", "lock", "locker", "locket", "locust", "lode", "loft", "log", "loggia", "logic", "login", "logo", "look", "lookout", "loop", "loquat", "lord", "loss", "lot", "lotion", "lottery", "lounge", "louse", "lout", "love", "lover",
    "lox", "loyalty", "luck", "luggage", "lumber", "lunch", "lung", "lunge", "lust", "lute", "luxury", "lychee", "lycra", "lye", "lynx", "lyocell", "lyre", "lyrics", "lysine", "mRNA", "macaw", "machine", "macrame", "macro", "madam", "maestro", "maggot",
    "magic", "magnet", "maid", "maiden", "mail", "mailbox", "mailer", "mailing", "mailman", "main", "maize", "major", "maker", "makeup", "making", "male", "malice", "mall", "mallard", "mallet", "mama", "mambo", "mammoth", "man", "manacle", "manager",
    "manatee", "mandate", "mangle", "mango", "manhunt", "maniac", "mankind", "manner", "manor", "mansard", "mansion", "mantel", "mantle", "mantua", "many", "map", "maple", "mapping", "maracas", "marble", "march", "mare", "margin", "marimba", "marines",
    "mark", "marker", "market", "markup", "marsh", "marten", "marxism", "mascara", "mask", "masonry", "mass", "massage", "mast", "master", "mastoid", "mat", "match", "mate", "math", "matrix", "matter", "mattock", "max", "maximum", "maybe", "mayor",
    "meadow", "meal", "mean", "meander", "meaning", "means", "measles", "measure", "meat", "mecca", "med", "medal", "media", "median", "medium", "meet", "meeting", "melody", "melon", "member", "meme", "memo", "memory", "men", "menorah", "mention", "mentor",
    "menu", "mercury", "merit", "mess", "message", "messy", "metal", "meteor", "meter", "methane", "method", "metric", "metro", "midden", "middle", "midline", "midwife", "might", "migrant", "mile", "mileage", "milk", "mill", "millet", "million", "mime", "mimosa",
    "min", "mind", "mine", "mineral", "mini", "minibus", "minimum", "mining", "minion", "mink", "minnow", "minor", "mint", "minute", "miracle", "mirror", "misfit", "miss", "missile", "mission", "mist", "mistake", "mister", "miter", "mitten", "mix", "mixer",
    "mixture", "moai", "moat", "mob", "mobile", "mobster", "mocha", "mochi", "mode", "model", "modem", "molar", "molding", "mole", "mom", "moment", "money", "monger", "monitor", "monk", "monkey", "monocle", "monsoon", "monster", "month", "mood", "moody", "moon",
    "moose", "mop", "morale", "morbid", "morning", "moron", "morsel", "mortal", "mortise", "mosque", "most", "motel", "moth", "mother", "motion", "motive", "motor", "mound", "mouse", "mouser", "mousse", "mouth", "mouton", "mover", "movie", "mower", "mud", "muffin",
    "mug", "mukluk", "mule", "murder", "muscat", "muscle", "museum", "music", "muskrat", "mussel", "mustard", "mutt", "mutton", "mystery", "myth", "nail", "name", "naming", "napkin", "nasal", "nation", "native", "nature", "neck", "necktie", "nectar", "need",
    "needle", "neglect", "neon", "neonate", "nephew", "nerve", "nest", "net", "netball", "netbook", "netsuke", "network", "neuron", "news", "nexus", "nibble", "nicety", "niche", "nick", "nickel", "niece", "night", "ninja", "nit", "nobody", "nod", "node", "noir",
    "noise", "noodle", "noodles", "noon", "norm", "normal", "north", "nose", "note", "notepad", "nothing", "notice", "notion", "nougat", "noun", "novel", "nudge", "nuke", "number", "numeric", "nun", "nurse", "nursery", "nursing", "nurture", "nut", "nutmeg",
    "nylon", "nymph", "oak", "oar", "oasis", "oat", "oatmeal", "oats", "obesity", "obi", "object", "oboe", "ocean", "ocelot", "octagon", "octave", "octavo", "octet", "octopus", "odyssey", "oeuvre", "offence", "offense", "offer", "office", "officer", "offset",
    "oil", "okra", "oldie", "oleo", "olive", "omega", "omelet", "onion", "online", "onset", "opening", "opera", "opinion", "opium", "opossum", "optimal", "option", "orange", "orator", "orchard", "orchid", "order", "ore", "oregano", "organ", "orient", "origin",
    "osmosis", "osprey", "ostrich", "other", "otter", "ottoman", "ounce", "outback", "outcome", "outfit", "outlaw", "outlay", "outlet", "outline", "outlook", "output", "outrage", "outrun", "outset", "outside", "oval", "ovary", "oven", "owl", "owner", "ox",
    "oxford", "oxygen", "oyster", "ozone", "pace", "pack", "package", "packet", "pad", "paddle", "paddock", "pagan", "page", "pagoda", "pail", "pain", "paint", "painter", "pair", "pajamas", "palace", "palate", "palm", "pan", "pancake", "panda", "panel", "panic",
    "pannier", "panpipe", "pansy", "panther", "panties", "pantry", "pants", "panty", "papa", "papaya", "paper", "parable", "parade", "parcel", "pard", "pardon", "parent", "park", "parka", "parking", "parole", "parrot", "parser", "parsley", "parsnip", "part",
    "partner", "party", "pass", "passage", "passing", "passion", "passive", "past", "pasta", "paste", "pastor", "pastry", "pasture", "pat", "patch", "pate", "patent", "path", "pathway", "patient", "patina", "patio", "patriot", "patrol", "patron", "pattern",
    "patty", "pause", "paw", "pay", "payee", "payment", "payoff", "pea", "peace", "peach", "peacoat", "peacock", "peak", "peanut", "pear", "pearl", "peasant", "pecan", "pecker", "pedal", "peek", "peen", "peer", "pelican", "pelt", "pen", "penalty", "pence",
    "pencil", "pendant", "penguin", "penis", "pennant", "penny", "pension", "peony", "people", "pepper", "percent", "perch", "perfume", "period", "permit", "perp", "person", "pest", "pet", "petal", "pew", "phase", "phone", "photo", "phrase", "physics",
    "pianist", "piano", "piccolo", "pick", "pickax", "pickaxe", "picket", "pickle", "pickup", "picnic", "picture", "pie", "piece", "pier", "piety", "pig", "pigeon", "piglet", "pigpen", "pigsty", "pike", "pilaf", "pile", "pilgrim", "pill", "pillar", "pillbox",
    "pillow", "pilot", "pimp", "pimple", "pin", "pine", "ping", "pink", "pinkie", "pinot", "pint", "pinto", "pinworm", "pioneer", "pipe", "piracy", "pirate", "piss", "pistol", "pit", "pita", "pitch", "pitcher", "pith", "pizza", "place", "placebo", "placode",
    "plain", "plan", "plane", "planet", "plant", "planter", "planula", "plaster", "plastic", "plate", "platter", "play", "player", "plea", "pleat", "pledge", "plenty", "plier", "pliers", "plight", "plot", "plough", "plover", "plow", "plowman", "plug", "plugin",
    "plum", "plumber", "plume", "plunger", "plywood", "pocket", "pod", "podcast", "poem", "poet", "poetry", "point", "poison", "poker", "pole", "polenta", "police", "policy", "polish", "poll", "polo", "polyp", "pomelo", "pompom", "poncho", "pond", "pony", "pool",
    "poor", "pop", "popcorn", "poppy", "porch", "pork", "port", "porter", "portion", "post", "postage", "postbox", "poster", "postfix", "pot", "potato", "pottery", "potty", "pouch", "poultry", "pound", "poverty", "powder", "power", "prairie", "praise", "pray",
    "prayer", "preface", "prefix", "prelude", "premier", "premise", "premium", "present", "press", "presume", "pretzel", "prey", "price", "pricing", "pride", "priest", "primary", "primate", "prince", "print", "printer", "prior", "prison", "privacy", "private",
    "prize", "probe", "problem", "process", "proctor", "produce", "product", "profile", "profit", "program", "project", "promise", "prompt", "pronoun", "proof", "propane", "prophet", "prose", "protein", "protest", "prow", "prune", "pruner", "pub", "public",
    "pudding", "puddle", "puffin", "pug", "puggle", "pulley", "pulse", "puma", "pump", "pumpkin", "pun", "punch", "pup", "pupa", "pupil", "puppet", "puppy", "puritan", "purity", "purple", "purpose", "purr", "purse", "pursuit", "push", "pusher", "put", "puzzle",
    "pyramid", "quail", "quality", "quart", "quarter", "quartet", "quartz", "queen", "query", "quest", "quiche", "quiet", "quill", "quilt", "quince", "quinoa", "quit", "quiver", "quota", "quote", "rabbi", "rabbit", "raccoon", "race", "racer", "racing", "racism",
    "racist", "rack", "radar", "radio", "radish", "raffle", "raft", "rag", "rage", "raid", "rail", "railing", "railway", "raiment", "rain", "rainbow", "rainy", "raise", "raisin", "rake", "rally", "ram", "rambler", "ramen", "ramie", "ranch", "rancher", "range",
    "ranger", "rank", "rap", "rape", "rat", "rate", "rating", "ratio", "rations", "raven", "ravioli", "rawhide", "ray", "rayon", "razor", "reach", "read", "reader", "reading", "real", "reality", "realm", "reamer", "rear", "reason", "rebel", "reboot", "recall",
    "receipt", "recess", "recipe", "record", "recruit", "red", "redhead", "reef", "reform", "refuge", "refund", "refusal", "refuse", "regard", "regime", "region", "regret", "reject", "relay", "release", "relief", "relish", "remains", "remark", "remnant",
    "remote", "removal", "rent", "repair", "repeat", "replica", "reply", "report", "request", "resale", "rescue", "reserve", "reset", "residue", "resist", "resolve", "resort", "respect", "respite", "rest", "result", "resume", "retina", "retreat", "return",
    "reunion", "reveal", "revenge", "revenue", "reverse", "review", "revival", "reward", "rhubarb", "rhyme", "rhythm", "rib", "ribbon", "rice", "riddle", "ride", "rider", "ridge", "riding", "rifle", "right", "rim", "ring", "riot", "rip", "ripple", "rise", "riser",
    "risk", "rite", "ritual", "river", "rivulet", "road", "roadway", "roar", "roast", "robe", "robin", "robot", "rock", "rocker", "rocket", "rod", "role", "roll", "roller", "romaine", "romance", "roof", "room", "rooster", "root", "rope", "rose", "roster", "rostrum",
    "round", "route", "router", "routine", "row", "rowboat", "rowing", "rubber", "rubbish", "rubric", "ruby", "ruckus", "ruffle", "rug", "rugby", "ruin", "rule", "ruler", "ruling", "rum", "rumor", "run", "runaway", "runner", "running", "runway", "rush", "rust",
    "rye", "sabre", "sac", "sack", "saddle", "sadness", "safari", "safe", "safety", "saffron", "sage", "sail", "sailing", "sailor", "saint", "sake", "salad", "salami", "salary", "sale", "salmon", "salon", "saloon", "salsa", "salt", "salute", "samovar", "sampan",
    "sample", "samurai", "sand", "sandal", "sandbar", "sanity", "sardine", "sari", "sarong", "sash", "satin", "satire", "sauce", "saucer", "sausage", "savage", "saving", "savings", "savior", "saviour", "savory", "saw", "scale", "scalp", "scam", "scanner", "scarf",
    "scene", "scenery", "scent", "schema", "scheme", "scholar", "school", "science", "scooter", "scope", "score", "scorn", "scotch", "scout", "scow", "scrap", "scraper", "scratch", "screen", "screw", "scrim", "scrip", "script", "sea", "seabass", "seafood",
    "seagull", "seal", "search", "seaside", "season", "seat", "seaweed", "second", "secrecy", "secret", "section", "sector", "seed", "seeder", "seeker", "seep", "segment", "seizure", "self", "seller", "selling", "seminar", "senate", "senator", "sender", "senior",
    "sense", "sensor", "sepal", "sequel", "serial", "series", "sermon", "serum", "serval", "servant", "server", "service", "sesame", "session", "set", "setback", "setting", "settler", "sewer", "sex", "shack", "shackle", "shade", "shadow", "shaker", "shallot",
    "shame", "shampoo", "shanty", "shape", "share", "shark", "shaw", "shawl", "shear", "sheath", "shed", "sheep", "sheet", "shelf", "shell", "shelter", "sherbet", "sherry", "shield", "shift", "shin", "shine", "shingle", "ship", "shipper", "shirt", "shjt", "shoat",
    "shock", "shoe", "shoes", "shofar", "shoot", "shop", "shopper", "shore", "short", "shorts", "shot", "shout", "shovel", "show", "shower", "shred", "shrimp", "shrine", "sibling", "sick", "side", "sidecar", "siding", "siege", "sigh", "sight", "sign", "signal",
    "signet", "signify", "signup", "silence", "silica", "silicon", "silk", "sill", "silly", "silo", "silver", "simple", "sin", "singer", "singing", "sink", "sip", "sir", "sister", "sitar", "site", "size", "skate", "skating", "skean", "ski", "skiing", "skill",
    "skin", "skirt", "skull", "skunk", "sky", "skyline", "skywalk", "slang", "slash", "slate", "slave", "slavery", "slaw", "sled", "sledge", "sleep", "sleet", "sleuth", "slice", "slide", "slider", "slime", "slip", "slipper", "slope", "slot", "sloth", "slump",
    "smell", "smile", "smith", "smock", "smog", "smoke", "smoking", "smolt", "snack", "snail", "snake", "snap", "snarl", "sneaker", "sneeze", "sniffle", "snob", "snorer", "snow", "snowman", "snuck", "snug", "snuggle", "soap", "soccer", "society", "sock", "socks",
    "soda", "sofa", "soil", "soldier", "sole", "someone", "son", "sonar", "sonata", "song", "sonnet", "soot", "soprano", "sorbet", "sorghum", "sorrel", "sorrow", "sort", "soul", "sound", "soup", "source", "south", "sow", "soy", "soybean", "space", "spacing",
    "spade", "span", "spandex", "spank", "spark", "sparrow", "spasm", "spat", "spatula", "spawn", "speaker", "spear", "spec", "special", "species", "speech", "speed", "spell", "spelt", "sphere", "sphynx", "spice", "spider", "spike", "spill", "spinach", "spine",
    "spiral", "spirit", "spit", "spite", "spleen", "split", "sponge", "sponsor", "spool", "spoon", "spork", "sport", "spot", "spouse", "sprag", "sprat", "spray", "spread", "spree", "spring", "sprout", "spruce", "spud", "spume", "spur", "spy", "square", "squash",
    "squid", "stab", "stable", "stack", "stadium", "staff", "stag", "stage", "stain", "stair", "stake", "stalk", "stall", "stamen", "stamina", "stamp", "stance", "stand", "star", "start", "starter", "state", "statin", "station", "statue", "status", "statute",
    "stay", "steak", "stealth", "steam", "steel", "steeple", "stem", "stench", "stencil", "step", "stepson", "stereo", "stew", "steward", "stick", "sticker", "still", "sting", "stinger", "stitch", "stock", "stole", "stomach", "stone", "stool", "stop", "storage",
    "store", "storey", "storm", "story", "stot", "stove", "strait", "strand", "strap", "straw", "stream", "street", "stress", "stretch", "strife", "strike", "string", "strip", "stripe", "strobe", "stroke", "strudel", "stucco", "stud", "student", "studio", "study",
    "stuff", "stump", "sty", "style", "styling", "stylus", "sub", "subject", "subset", "subsidy", "suburb", "subway", "success", "suck", "sucker", "suede", "suet", "sugar", "suicide", "suit", "suite", "sulfur", "sultan", "sum", "summary", "summer", "summit", "sun",
    "sunbeam", "sundae", "sunday", "sundial", "sunlamp", "sunrise", "sunroom", "sunset", "supper", "supply", "support", "supreme", "surface", "surge", "surgeon", "surgery", "surname", "surplus", "survey", "sushi", "suspect", "swallow", "swamp", "swan", "swath",
    "sweat", "sweater", "sweets", "swell", "swim", "swine", "swing", "switch", "swivel", "sword", "symbol", "symptom", "synergy", "synod", "synonym", "syrup", "system", "t-shirt", "tab", "tabby", "table", "tablet", "tackle", "taco", "tactics", "tactile",
    "tadpole", "tag", "tail", "tailbud", "tailor", "tale", "talent", "talk", "talking", "tamale", "tambour", "tan", "tandem", "tank", "tanker", "tankful", "tap", "tape", "tapioca", "target", "taro", "tart", "task", "tassel", "taste", "tatami", "tattler", "tattoo",
    "tavern", "tax", "taxi", "taxicab", "tea", "teacher", "team", "teapot", "tear", "tech", "teen", "teepee", "tell", "teller", "temp", "temper", "temple", "tempo", "tenant", "tender", "tenet", "tennis", "tenor", "tension", "tensor", "tent", "tenth", "tepee",
    "term", "termite", "terrace", "terror", "test", "testing", "text", "textual", "texture", "thanks", "thaw", "theater", "theft", "theism", "theme", "theory", "therapy", "thesis", "thief", "thigh", "thing", "thirst", "thistle", "thong", "thongs", "thorn", "thought",
    "thread", "threat", "thrift", "thrill", "throat", "throne", "thrush", "thrust", "thug", "thumb", "thump", "thunder", "thyme", "tiara", "tic", "tick", "ticket", "tide", "tie", "tiger", "tights", "tile", "till", "tilt", "timbale", "timber", "time", "timeout",
    "timer", "timing", "timpani", "tin", "tinkle", "tintype", "tip", "tire", "tissue", "title", "toad", "toast", "toaster", "tobacco", "today", "toe", "toenail", "toffee", "tofu", "tog", "toga", "toilet", "toll", "tom-tom", "tomato", "tomb", "ton", "tone", "tongue",
    "tonic", "tonight", "tool", "toot", "tooth", "top", "top-hat", "topic", "topsail", "toque", "tornado", "torso", "torte", "tosser", "total", "tote", "touch", "tour", "tourism", "tourist", "towel", "tower", "town", "toy", "trace", "track", "tract", "tractor",
    "trade", "trader", "trading", "traffic", "tragedy", "trail", "trailer", "train", "trainer", "trait", "tram", "tramp", "trance", "transit", "transom", "trap", "trash", "travel", "tray", "treat", "treaty", "tree", "trek", "trellis", "tremor", "trench", "trend",
    "triad", "trial", "tribe", "trick", "trigger", "trim", "trinket", "trip", "tripod", "tritone", "triumph", "trolley", "troop", "trooper", "trophy", "trouble", "trout", "trove", "trowel", "truck", "trumpet", "trunk", "trust", "trustee", "truth", "try",
    "tsunami", "tub", "tuba", "tube", "tuber", "tug", "tugboat", "tuition", "tulip", "tumbler", "tummy", "tuna", "tune", "tune-up", "tunic", "tunnel", "turban", "turf", "turkey", "turn", "turning", "turnip", "turret", "turtle", "tusk", "tussle", "tutu",
    "tuxedo", "tweet", "twig", "twine", "twins", "twist", "twister", "twitter", "type", "typhoon", "ukulele", "uncle", "unibody", "uniform", "union", "unique", "unit", "unity", "update", "upgrade", "uplift", "upper", "upward", "urge", "urgency", "urn", "usage",
    "use", "user", "usher", "usual", "utensil", "utility", "vaccine", "vacuum", "vagrant", "valance", "valley", "value", "vampire", "van", "vanadyl", "vane", "vanilla", "vanity", "variant", "variety", "vase", "vault", "veal", "vector", "vehicle", "veil", "vein",
    "veldt", "vellum", "velvet", "vendor", "veneer", "venison", "venom", "venti", "venture", "venue", "veranda", "verb", "verdict", "verse", "version", "vertigo", "verve", "vessel", "vest", "vet", "veteran", "veto", "vibe", "vice", "victim", "victory", "video",
    "view", "viewer", "villa", "village", "vine", "vinegar", "vintage", "vintner", "vinyl", "viola", "violet", "violin", "virtue", "virus", "visa", "viscose", "vise", "vision", "visit", "visitor", "visor", "vista", "visual", "vitamin", "vitro", "vivo", "vixen",
    "vodka", "vogue", "voice", "void", "vol", "volcano", "volume", "vomit", "vote", "voter", "voting", "voyage", "vulture", "wad", "wafer", "waffle", "wage", "wagon", "waist", "wait", "waiter", "waiting", "waiver", "wake", "walk", "walker", "walking", "walkway",
    "wall", "wallaby", "wallet", "walnut", "walrus", "wampum", "wannabe", "want", "war", "warden", "warfare", "warlock", "warlord", "warm-up", "warming", "warmth", "warning", "warrant", "warren", "warrior", "wasabi", "wash", "washer", "washtub", "wasp", "waste",
    "wasting", "watch", "watcher", "water", "wave", "wax", "way", "wealth", "weapon", "wear", "weasel", "weather", "web", "webinar", "webmail", "webpage", "website", "wedding", "wedge", "weed", "weeder", "week", "weekend", "weight", "weird", "welcome", "welfare",
    "well", "west", "western", "wet-bar", "wetland", "wetsuit", "whack", "whale", "wharf", "wheat", "wheel", "whelp", "whey", "whip", "whisker", "whiskey", "whisper", "whistle", "white", "whole", "whorl", "wick", "widget", "widow", "width", "wife", "wifi", "wild",
    "will", "willow", "win", "wind", "windage", "window", "wine", "winery", "wing", "wingman", "wingtip", "wink", "winner", "winter", "wire", "wiretap", "wiring", "wisdom", "wiseguy", "wish", "wit", "witch", "witness", "wok", "wolf", "woman", "wombat", "wonder",
    "wont", "wood", "wool", "woolens", "word", "wording", "work", "worker", "working", "workout", "world", "worm", "worry", "worship", "worth", "wound", "wrap", "wrapper", "wreck", "wrecker", "wren", "wrench", "wrinkle", "wrist", "writer", "writing", "wrong",
    "yacht", "yahoo", "yak", "yam", "yang", "yard", "yarn", "yawl", "year", "yeast", "yellow", "yew", "yin", "yoga", "yogurt", "yoke", "yolk", "young", "youth", "yoyo", "yurt", "zampone", "zebra", "zen", "zephyr", "zero", "zinc", "zipper", "zither", "zombie", "zone",
    "zoo", "zoology",
  ];

  /**
   *  @author Butterz
   *  @desc Retrieves global character information, manages character naming, and handles related operations.
   * 
   */

  const getGlobalCharacter = function () {
    const SaveLocation = "logs/Kolbot-SoloPlay/GlobalCharacter.json";
    const Character = (Developer.GlobalSettings.Name);

    const CharData = {
      GlobalData: { Character_Name: "", Number: 0 },

      // Create a new Json file.
      create: function () {
        FileTools.writeText(SaveLocation, JSON.stringify(this.GlobalData));
      },

      // Read data from the Json file and return the data object.
      read: function () {
        return JSON.parse(FileTools.readText(SaveLocation));
      },

      // Read data from the Json file and return the name info.
      readName: function () {
        return JSON.parse(FileTools.readText(SaveLocation)).Character_Name;
      },

      // Write a data object to the Json file.
      write: function (obj) {
        FileTools.writeText(SaveLocation, JSON.stringify(obj));
      },

      printErrorAndStop: function (message) {
        const fullMessage = message + ' Please create a valid name within the "Developer.js" file.';
        D2Bot.printToConsole(fullMessage, sdk.colors.D2Bot.Red);
        D2Bot.stop();
      },

      /**
       * Error Checks:
       * - Invalid character name (avoid spaces, numbers, use dashes/underscores).
       * - Character name must be at least 2 characters long.
       * - Character name can't exceed 15 characters.
       */
      errorChecks: function (check1, check2, check3) {
        const obj = this.read();
        const minNameLength = 2;
        const maxNameLength = 15;

        if (check1 && !/^[a-zA-Z]*[-_a-zA-Z]*[a-zA-Z]$/.test(obj.Character_Name)) {
            this.printErrorAndStop('Invalid character name. Names can contain one dash (-) or one underscore (_), except as the first or last character. Avoid spaces and numbers.');
        }

        if (check2 && obj.Character_Name.length < minNameLength) {
            this.printErrorAndStop('The character name is too short. Character names must be at least 2 characters long.');
        }

        if (check3 && obj.Character_Name.length > maxNameLength) {
            this.printErrorAndStop('The character name exceeds the limit of 15 characters.');
        }
      },

      // Set next character name - increase alphabet in the Json file.
      nextChar: function () {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const obj = this.read();
        let num = obj.Number;
    
        // Convert the number to the corresponding letter(s)
        let sequence = "";
        do {
          num -= 1;
          sequence = alphabet[num % 26] + sequence;
          num = Math.floor(num / 26);
        } while (num > 0);
    
        obj.Number += 1;
        obj.Character_Name = Character + sequence;
        this.errorChecks(true, true, true);

        // Update GlobalData with new Number and Character_Name values from 'obj'
        this.write(Object.assign(this.GlobalData, { Number: obj.Number, Character_Name: obj.Character_Name }));
    
        return obj.Character_Name;
      },

      // Creates a folder for Kolbot-SoloPlay logs if it doesn't exist.
      createFolder: function () {
        const folderPath = "logs/Kolbot-SoloPlay";
        if (!FileTools.exists(folderPath)) {
          print(
            sdk.colors.DarkGreen + "Global Settings" + 
            sdk.colors.White + " :: " + 
            sdk.colors.Blue + "Creating Kolbot-SoloPlay Folder."
          );
          dopen("logs").create("Kolbot-SoloPlay");
        }
      },

      /**
       * Print a line of text with specified styling/colors.
       * @param {string} message - The message to be printed.
       * @param {string} color1 - The first color for styling.
       * @param {string} color2 - The second color for styling.
       * @param {string} color3 - The third color for styling.
       */
      formattedPrint: function (message, color1, color2, color3) {
        const formattedMessage =
          color1 + "Global Settings" +
          color2 + " :: " +
          color3 + message;
        print(formattedMessage);
      },

      // Initializes the character data.
      initialize: function () {
        // If file exists check for valid info.
        if (FileTools.exists(SaveLocation)) {
          try {
            let jsonObj = this.read();

            // Return filename containing correct info.
            if (Character && jsonObj.Character_Name && jsonObj.Character_Name.match(Character)) {
              delay(500);
              this.formattedPrint("Successor In The Alphabetical Sequence.", sdk.colors.DarkGreen, sdk.colors.White, sdk.colors.Blue);
              delay(250);
              this.nextChar();
              delay(500);

              return this.readName();
            }
                  
            // File exists but doesn't contain valid info - Remaking .json file.
            if (Character && jsonObj.Character_Name !== Character) {
              this.formattedPrint("Removed The Saved File Location.", sdk.colors.DarkGreen, sdk.colors.White, sdk.colors.Blue);
              FileTools.remove(SaveLocation);
              delay(800);

              return this.initialize();
            }
          } catch (e) {
            print(e);
          }
        } else {
          // Check if main folder exist.
          this.createFolder();
          delay(250);
          // Creating a new .json file.
          this.formattedPrint("Creating New Character Name.", sdk.colors.DarkGreen, sdk.colors.White, sdk.colors.Blue);
          this.create();
          delay(500);
          this.nextChar();
          delay(rand(5000, 10000));

          return this.readName();
        }
        // Check if main folder exist.
        this.createFolder();

        return this.create();
      }
    };

    // Print the startup message.
    print(sdk.colors.DarkGreen + "Initializing " + sdk.colors.White + " :: " + sdk.colors.DarkGreen + "Global Settings.");
    CharData.initialize();

    return CharData.readName();
  };

  const NameGen = function () {
    if (Developer.GlobalSettings.Enable) return getGlobalCharacter();
    else {
      //let random1 = Math.floor(Math.random() * (adjectives.length + 1));
      let adjective = adjectives[rand(0, adjectives.length - 1)];
      let list2Limit = 16 - adjective.length;
      let list2 = nouns.filter(function (element) {
        return element.length < list2Limit;
      });

      let noun = list2[rand(0, list2.length - 1)];
      let namechosen = adjective + noun;

      return namechosen.toLowerCase();
    }
  };

  module.exports = NameGen;
})(module);

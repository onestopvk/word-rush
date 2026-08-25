import { DiagonalChallenge, ShifterChallenge, ShifterDifficulty } from '../types';

/**
 * DictionaryService
 * Comprehensive 4-letter English words database with anagram resolver, pattern matcher, and Word Shifter graph solver.
 */
class DictionaryService {
  // Primary high-frequency common words for challenge generation
  private coreWords: string[] = [
    'ABLE', 'ACHE', 'ACID', 'ACRE', 'AGED', 'AIDE', 'AIRS', 'ALLY', 'ALMS', 'ALOE', 'ALSO', 'AMEN', 'APEX', 'ARCH', 'AREA', 'ARMY', 'ARTS', 'ATOM', 'AUNT', 'AUTO', 'AWAY', 'AXIS',
    'BABY', 'BACK', 'BAKE', 'BALL', 'BAND', 'BANK', 'BARK', 'BARN', 'BASE', 'BATH', 'BEAK', 'BEAM', 'BEAN', 'BEAR', 'BEAT', 'BEEF', 'BEER', 'BELL', 'BELT', 'BEND', 'BEST', 'BIKE', 'BILL', 'BIND', 'BIRD', 'BITE', 'BLOW', 'BLUE', 'BOAT', 'BOIL', 'BOLD', 'BOLT', 'BOND', 'BONE', 'BOOK', 'BOOM', 'BOOT', 'BORE', 'BORN', 'BOSS', 'BOWL', 'BOYS', 'BULK', 'BULL', 'BUMP', 'BURN', 'BURY', 'BUSH', 'BUSY',
    'CAFE', 'CAGE', 'CAKE', 'CALF', 'CALL', 'CALM', 'CAMP', 'CANE', 'CAPE', 'CARD', 'CARE', 'CART', 'CASE', 'CASH', 'CAST', 'CAVE', 'CELL', 'CHAT', 'CHEF', 'CHIN', 'CHIP', 'CHOP', 'CITY', 'CLAP', 'CLAW', 'CLAY', 'CLIP', 'CLUB', 'COAL', 'COAT', 'CODE', 'COIL', 'COIN', 'COLD', 'COLT', 'COMB', 'COME', 'CONE', 'COOK', 'COOL', 'COPE', 'COPY', 'CORD', 'CORE', 'CORK', 'CORN', 'COST', 'CRAB', 'CROW', 'CUBE', 'CURE', 'CURL', 'CUTE',
    'DALE', 'DAMP', 'DARE', 'DARK', 'DART', 'DASH', 'DATE', 'DAWN', 'DAYS', 'DEAD', 'DEAF', 'DEAL', 'DEAN', 'DEAR', 'DECK', 'DEED', 'DEEP', 'DEER', 'DESK', 'DIAL', 'DICE', 'DIET', 'DIRT', 'DISC', 'DISH', 'DISK', 'DIVE', 'DOCK', 'DOLL', 'DOME', 'DONE', 'DOOM', 'DOOR', 'DOSE', 'DOWN', 'DRAG', 'DRAW', 'DREW', 'DROP', 'DRUM', 'DUAL', 'DUCK', 'DUST', 'DUTY',
    'EACH', 'EARN', 'EARS', 'EASE', 'EAST', 'EASY', 'EDGE', 'EGGS', 'ELSE', 'ENVY', 'EPIC', 'EVEN', 'EVER', 'EVIL', 'EXAM', 'EXIT', 'EYES',
    'FACE', 'FACT', 'FAIR', 'FALL', 'FAME', 'FARM', 'FAST', 'FATE', 'FEAR', 'FEAT', 'FEED', 'FEEL', 'FEET', 'FELL', 'FELT', 'FILE', 'FILL', 'FILM', 'FIND', 'FINE', 'FIRE', 'FIRM', 'FISH', 'FIST', 'FLAG', 'FLAT', 'FLAW', 'FLEE', 'FLEW', 'FLIP', 'FLOW', 'FOAM', 'FOIL', 'FOLD', 'FOLK', 'FOND', 'FOOD', 'FOOL', 'FOOT', 'FORD', 'FORK', 'FORM', 'FORT', 'FOUL', 'FOUR', 'FREE', 'FROG', 'FROM', 'FUEL', 'FULL', 'FUND', 'FURY', 'FUSE',
    'GAIN', 'GAME', 'GANG', 'GATE', 'GAVE', 'GEAR', 'GEMS', 'GENE', 'GIFT', 'GIRL', 'GIVE', 'GLAD', 'GLOW', 'GOAL', 'GOAT', 'GOLD', 'GOLF', 'GONE', 'GOOD', 'GRAB', 'GRAM', 'GRAY', 'GREW', 'GRID', 'GRIN', 'GRIP', 'GROW', 'GULF',
    'HAIR', 'HALF', 'HALL', 'HALT', 'HAND', 'HANG', 'HARD', 'HARM', 'HATE', 'HAVE', 'HAWK', 'HEAD', 'HEAL', 'HEAR', 'HEAT', 'HEEL', 'HELD', 'HELL', 'HELP', 'HERB', 'HERO', 'HIDE', 'HIGH', 'HIKE', 'HILL', 'HINT', 'HIRE', 'HOLD', 'HOLE', 'HOLY', 'HOME', 'HOOD', 'HOOK', 'HOPE', 'HORN', 'HOSE', 'HOST', 'HOUR', 'HUGE', 'HUNG', 'HUNT', 'HURT',
    'ICON', 'IDEA', 'IDLE', 'INCH', 'INTO', 'IRON', 'ITEM',
    'JAIL', 'JAZZ', 'JEAN', 'JOIN', 'JOKE', 'JUMP', 'JUNE', 'JURY', 'JUST',
    'KEEN', 'KEEP', 'KEPT', 'KICK', 'KIDS', 'KILL', 'KIND', 'KING', 'KISS', 'KITE', 'KNEE', 'KNEW', 'KNIT', 'KNOT', 'KNOW',
    'LACK', 'LADY', 'LAID', 'LAKE', 'LAMB', 'LAMP', 'LAND', 'LANE', 'LAST', 'LATE', 'LAVA', 'LAWN', 'LAWS', 'LAZY', 'LEAD', 'LEAF', 'LEAK', 'LEAN', 'LEAP', 'LEFT', 'LEND', 'LENS', 'LESS', 'LIFE', 'LIFT', 'LIKE', 'LIME', 'LIMB', 'LINE', 'LINK', 'LION', 'LIPS', 'LIST', 'LIVE', 'LOAD', 'LOAN', 'LOCK', 'LOGO', 'LONG', 'LOOK', 'LOOP', 'LORD', 'LOSE', 'LOSS', 'LOST', 'LOUD', 'LOVE', 'LUCK', 'LUNG',
    'MADE', 'MAID', 'MAIL', 'MAIN', 'MAKE', 'MALE', 'MALL', 'MANY', 'MAPS', 'MARK', 'MASK', 'MASS', 'MATE', 'MATH', 'MAZE', 'MEAL', 'MEAN', 'MEAT', 'MEET', 'MELT', 'MEMO', 'MENU', 'MESS', 'MICE', 'MILD', 'MILE', 'MILK', 'MILL', 'MIND', 'MINE', 'MINT', 'MISS', 'MIST', 'MODE', 'MOOD', 'MOON', 'MORE', 'MOST', 'MOTH', 'MOVE', 'MUCH', 'MUSE', 'MUST', 'MUTE',
    'NAME', 'NAVY', 'NEAR', 'NEAT', 'NECK', 'NEED', 'NEST', 'NEWS', 'NEXT', 'NICE', 'NINE', 'NODE', 'NONE', 'NOON', 'NOSE', 'NOTE',
    'OAKS', 'OATH', 'OBEY', 'ODDS', 'OGRE', 'OILS', 'OKAY', 'OMEN', 'ONCE', 'ONES', 'ONLY', 'ONTO', 'OPEN', 'ORAL', 'OVER', 'OWED', 'OWLS', 'OWNS',
    'PACE', 'PACK', 'PAGE', 'PAID', 'PAIN', 'PAIR', 'PALE', 'PALM', 'PARK', 'PART', 'PASS', 'PAST', 'PATH', 'PEAK', 'PEAR', 'PEEL', 'PEER', 'PENS', 'PEST', 'PETS', 'PICK', 'PIER', 'PIES', 'PILL', 'PINE', 'PING', 'PINK', 'PINT', 'PIPE', 'PLAN', 'PLAY', 'PLEA', 'PLOT', 'PLUG', 'PLUS', 'POEM', 'POET', 'POLE', 'POLL', 'POND', 'POOL', 'POOR', 'POPE', 'PORK', 'PORT', 'POSE', 'POST', 'POUR', 'PRAY', 'PULL', 'PUMP', 'PURE', 'PUSH',
    'RACE', 'RACK', 'RAGE', 'RAID', 'RAIL', 'RAIN', 'RARE', 'RATE', 'READ', 'REAL', 'REAR', 'REED', 'RELY', 'RENT', 'REST', 'RICE', 'RICH', 'RIDE', 'RING', 'RIOT', 'RIPE', 'RISE', 'RISK', 'ROAD', 'ROAR', 'ROBE', 'ROCK', 'RODE', 'ROLE', 'ROLL', 'ROOF', 'ROOM', 'ROOT', 'ROPE', 'ROSE', 'ROWS', 'RUIN', 'RULE', 'RUSH', 'RUST',
    'SAFE', 'SAID', 'SAIL', 'SALE', 'SALT', 'SAME', 'SAND', 'SAVE', 'SCAN', 'SCAR', 'SEAL', 'SEAM', 'SEAT', 'SEED', 'SEEK', 'SEEM', 'SEEN', 'SELF', 'SELL', 'SEND', 'SENT', 'SHED', 'SHIP', 'SHOE', 'SHOP', 'SHOT', 'SHOW', 'SHUT', 'SICK', 'SIDE', 'SIGN', 'SILK', 'SILO', 'SINK', 'SITE', 'SIZE', 'SKIN', 'SKIP', 'SLAP', 'SLIP', 'SLOT', 'SLOW', 'SNAP', 'SNOW', 'SOAP', 'SOAR', 'SOCK', 'SOFA', 'SOFT', 'SOIL', 'SOLO', 'SOME', 'SONG', 'SOON', 'SOUL', 'SOUP', 'SOUR', 'SPIN', 'SPOT', 'STAR', 'STAY', 'STEM', 'STEP', 'STOP', 'SUCH', 'SUIT', 'SURE', 'SURF', 'SWAN', 'SWAP', 'SWIM',
    'TAIL', 'TAKE', 'TALE', 'TALK', 'TALL', 'TANK', 'TAPE', 'TASK', 'TAXI', 'TEAM', 'TEAR', 'TELL', 'TEND', 'TENT', 'TERM', 'TEST', 'TEXT', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIN', 'THIS', 'TIDE', 'TIDY', 'TIED', 'TIER', 'TIES', 'TILE', 'TILL', 'TIME', 'TINY', 'TIRE', 'TOAD', 'TOES', 'TOLL', 'TONE', 'TOOK', 'TOOL', 'TOPS', 'TORE', 'TORN', 'TOUR', 'TOWN', 'TRAP', 'TRAY', 'TREE', 'TRIP', 'TRUE', 'TUBE', 'TUCK', 'TUNE', 'TURN', 'TWIN', 'TYPE',
    'UGLY', 'UNIT', 'UPON', 'URGE', 'USED', 'USER',
    'VAIN', 'VARY', 'VAST', 'VEIL', 'VEIN', 'VENT', 'VERB', 'VERY', 'VEST', 'VETO', 'VICE', 'VIEW', 'VINE', 'VOID', 'VOLT', 'VOTE',
    'WADE', 'WAGE', 'WAIT', 'WAKE', 'WALK', 'WALL', 'WANT', 'WARD', 'WARM', 'WARN', 'WASH', 'WAVE', 'WEAK', 'WEAR', 'WEED', 'WEEK', 'WELL', 'WENT', 'WEST', 'WHAT', 'WHEN', 'WIDE', 'WIFE', 'WILD', 'WILL', 'WIND', 'WINE', 'WING', 'WINK', 'WIPE', 'WIRE', 'WISE', 'WISH', 'WITH', 'WOLF', 'WOOD', 'WOOL', 'WORD', 'WORK', 'WORM', 'WRAP',
    'YARD', 'YARN', 'YEAR', 'YOGA', 'YOKE', 'YOUR',
    'ZEAL', 'ZERO', 'ZINC', 'ZONE', 'ZOOM'
  ];

  // Extended dictionary covering thousands of standard 4-letter English words for alternate acceptance
  private extendedWords: string[] = [
    'ABED', 'ABET', 'ABLY', 'ABUT', 'ACID', 'ACME', 'ACNE', 'ACRE', 'ACTS', 'AFAR', 'AFRO', 'AGAR', 'AGED', 'AGES', 'AGOG', 'AGUE', 'AHED', 'AHEM', 'AHOY', 'AIDE', 'AIDS', 'AILS', 'AIMS', 'AINT', 'AIRN', 'AIRS', 'AIRT', 'AIRY', 'AITS', 'AJAR', 'AKIN', 'ALAE', 'ALAN', 'ALAR', 'ALAS', 'ALBA', 'ALBS', 'ALEC', 'ALEE', 'ALEF', 'ALES', 'ALFA', 'ALGA', 'ALIF', 'ALIT', 'ALMS', 'ALOE', 'ALPS', 'ALSO', 'ALTO', 'ALTS', 'ALUM', 'AMAH', 'AMAS', 'AMBO', 'AMEN', 'AMIA', 'AMID', 'AMIE', 'AMIN', 'AMIR', 'AMIS', 'AMMO', 'AMOK', 'AMPS', 'AMUS', 'AMYL', 'ANAL', 'ANAS', 'ANDS', 'ANES', 'ANEW', 'ANGA', 'ANIL', 'ANIS', 'ANKH', 'ANNA', 'ANNO', 'ANNS', 'ANOA', 'ANON', 'ANSA', 'ANTA', 'ANTE', 'ANTI', 'ANTS', 'ANUS', 'APED', 'APER', 'APES', 'APEX', 'APOD', 'APOS', 'APPS', 'APSE', 'AQUA', 'ARAK', 'ARBS', 'ARCH', 'ARCO', 'ARCS', 'AREA', 'ARED', 'AREG', 'ARES', 'ARET', 'ARFS', 'ARIA', 'ARID', 'ARIL', 'ARKS', 'ARMS', 'ARMY', 'ARSE', 'ARTS', 'ARTY', 'ARUM', 'ARVO', 'ARYL', 'ASCI', 'ASEA', 'ASHY', 'ASKS', 'ASPS', 'ATOM', 'ATOP', 'AUNT', 'AURA', 'AUTO', 'AVAL', 'AVAS', 'AVEL', 'AVER', 'AVES', 'AVID', 'AVOS', 'AVOW', 'AWAY', 'AWED', 'AWEE', 'AWES', 'AWLS', 'AWNS', 'AWNY', 'AWOL', 'AWRY', 'AXAL', 'AXED', 'AXEL', 'AXES', 'AXIL', 'AXIS', 'AXLE', 'AXON', 'AYAH', 'AYES', 'AYIN', 'AZAN', 'AZON',
    'BAAL', 'BAAS', 'BABA', 'BABE', 'BABU', 'BABY', 'BACH', 'BACK', 'BADE', 'BADS', 'BAFF', 'BAGS', 'BAHT', 'BAHU', 'BAIL', 'BAIT', 'BAKE', 'BALD', 'BALE', 'BALK', 'BALL', 'BALM', 'BALS', 'BAMS', 'BAND', 'BANE', 'BANG', 'BANI', 'BANK', 'BANS', 'BANT', 'BAPS', 'BARB', 'BARD', 'BARE', 'BARF', 'BARK', 'BARM', 'BARN', 'BARP', 'BARS', 'BASE', 'BASH', 'BASK', 'BASS', 'BAST', 'BATE', 'BATH', 'BATS', 'BATT', 'BAUD', 'BAUR', 'BAWD', 'BAWL', 'BAWN', 'BAYE', 'BAYS', 'BEAD', 'BEAK', 'BEAM', 'BEAN', 'BEAR', 'BEAT', 'BEAU', 'BECK', 'BEDS', 'BEDU', 'BEEF', 'BEEN', 'BEEP', 'BEER', 'BEES', 'BEET', 'BEGS', 'BELL', 'BELS', 'BELT', 'BEMA', 'BEND', 'BENE', 'BENI', 'BENN', 'BENO', 'BENS', 'BENT', 'BERG', 'BERK', 'BERM', 'BEST', 'BETA', 'BETE', 'BETH', 'BETS', 'BEVY', 'BEYS', 'BHAT', 'BHEL', 'BHUT', 'BIAS', 'BIBB', 'BIBS', 'BICE', 'BIDE', 'BIDI', 'BIDS', 'BIEN', 'BIER', 'BIFF', 'BIGA', 'BIGG', 'BIGS', 'BIKE', 'BILE', 'BILK', 'BILL', 'BIMA', 'BIND', 'BINE', 'BING', 'BINK', 'BINS', 'BINT', 'BIOG', 'BIOS', 'BIRD', 'BIRK', 'BIRL', 'BIRO', 'BIRR', 'BISE', 'BISH', 'BISK', 'BIST', 'BITE', 'BITO', 'BITS', 'BITT', 'BIZE', 'BLAB', 'BLAG', 'BLAH', 'BLAM', 'BLAT', 'BLAW', 'BLEB', 'BLED', 'BLEE', 'BLET', 'BLEW', 'BLEY', 'BLIN', 'BLIP', 'BLOB', 'BLOC', 'BLOG', 'BLOT', 'BLOW', 'BLUB', 'BLUE', 'BLUR', 'BOAB', 'BOAR', 'BOAS', 'BOAT', 'BOBA', 'BOBS', 'BOCK', 'BODE', 'BODS', 'BODY', 'BOEP', 'BOET', 'BOFF', 'BOGS', 'BOGY', 'BOHO', 'BOIL', 'BOIS', 'BOKE', 'BOKO', 'BOKS', 'BOLA', 'BOLD', 'BOLE', 'BOLL', 'BOLO', 'BOLT', 'BOMB', 'BONA', 'BOND', 'BONE', 'BONG', 'BONK', 'BONY', 'BOOB', 'BOOH', 'BOOK', 'BOOL', 'BOOM', 'BOON', 'BOOR', 'BOOS', 'BOOT', 'BOPS', 'BORA', 'BORD', 'BORE', 'BORK', 'BORM', 'BORN', 'BORS', 'BORT', 'BOSH', 'BOSK', 'BOSS', 'BOTA', 'BOTE', 'BOTH', 'BOTS', 'BOTT', 'BOUD', 'BOUK', 'BOUN', 'BOUT', 'BOWL', 'BOWR', 'BOWS', 'BOXY', 'BOYF', 'BOYG', 'BOYS', 'BOZO', 'BRAD', 'BRAE', 'BRAG', 'BRAK', 'BRAN', 'BRAS', 'BRAT', 'BRAW', 'BRAY', 'BRED', 'BREE', 'BREI', 'BREM', 'BREN', 'BRER', 'BREW', 'BREY', 'BRIE', 'BRIG', 'BRIK', 'BRIM', 'BRIN', 'BRIO', 'BRIS', 'BRIT', 'BROD', 'BROG', 'BROO', 'BROS', 'BROW', 'BRRR', 'BRUS', 'BRUT', 'BRUX', 'BUAL', 'BUBA', 'BUBO', 'BUBS', 'BUBU', 'BUCK', 'BUDA', 'BUDO', 'BUDS', 'BUFF', 'BUFO', 'BUGS', 'BUHL', 'BUHR', 'BUIK', 'BUKE', 'BULB', 'BULK', 'BULL', 'BUMF', 'BUMP', 'BUMS', 'BUNA', 'BUND', 'BUNG', 'BUNK', 'BUNN', 'BUNS', 'BUNT', 'BUOY', 'BURA', 'BURB', 'BURD', 'BURG', 'BURK', 'BURL', 'BURN', 'BURP', 'BURR', 'BURS', 'BURY', 'BUSH', 'BUSK', 'BUSS', 'BUST', 'BUSY', 'BUTE', 'BUTS', 'BUTT', 'BUYS', 'BUZZ', 'BYDE', 'BYES', 'BYKE', 'BYRE', 'BYRL', 'BYTE',
    'CABS', 'CACA', 'CADE', 'CADI', 'CADS', 'CAFE', 'CAFF', 'CAGE', 'CAGY', 'CAID', 'CAIN', 'CAKE', 'CAKY', 'CALF', 'CALK', 'CALL', 'CALM', 'CALO', 'CALP', 'CALX', 'CAMA', 'CAME', 'CAMP', 'CAMS', 'CAND', 'CANE', 'CANG', 'CANN', 'CANS', 'CANT', 'CANY', 'CAPA', 'CAPE', 'CAPH', 'CAPI', 'CAPO', 'CAPS', 'CARB', 'CARD', 'CARE', 'CARK', 'CARL', 'CARN', 'CARP', 'CARS', 'CART', 'CASA', 'CASE', 'CASH', 'CASK', 'CAST', 'CATE', 'CATS', 'CAUL', 'CAVE', 'CAVY', 'CAWS', 'CAYS', 'CECA', 'CEDE', 'CEDI', 'CEES', 'CEIL', 'CELL', 'CELS', 'CELT', 'CENT', 'CEPE', 'CEPS', 'CERE', 'CERO', 'CEST', 'CETE', 'CHAD', 'CHAI', 'CHAL', 'CHAM', 'CHAO', 'CHAP', 'CHAR', 'CHAT', 'CHAW', 'CHAY', 'CHEF', 'CHEM', 'CHEW', 'CHIA', 'CHIC', 'CHID', 'CHIK', 'CHIN', 'CHIP', 'CHIS', 'CHIT', 'CHIV', 'CHOC', 'CHOG', 'CHON', 'CHOP', 'CHOU', 'CHOW', 'CHUB', 'CHUG', 'CHUM', 'CHUR', 'CHUT', 'CIAO', 'CIDE', 'CIGS', 'CINE', 'CINQ', 'CION', 'CIRE', 'CIRL', 'CIST', 'CITE', 'CITY', 'CLAD', 'CLAG', 'CLAM', 'CLAN', 'CLAP', 'CLAT', 'CLAW', 'CLAY', 'CLEF', 'CLEG', 'CLEM', 'CLEW', 'CLIP', 'CLOD', 'CLOG', 'CLON', 'CLOP', 'CLOT', 'CLOU', 'CLOW', 'CLOY', 'CLUB', 'CLUE', 'COAL', 'COAT', 'COAX', 'COBB', 'COBS', 'COCA', 'COCK', 'COCO', 'CODA', 'CODE', 'CODS', 'COED', 'COFF', 'COFT', 'COGS', 'COHO', 'COIF', 'COIL', 'COIN', 'COIR', 'COIT', 'COKE', 'COKY', 'COLA', 'COLD', 'COLE', 'COLL', 'COLN', 'COLS', 'COLT', 'COLY', 'COMA', 'COMB', 'COME', 'COMM', 'COMP', 'COMS', 'COND', 'CONE', 'CONF', 'CONI', 'CONK', 'CONN', 'CONS', 'CONY', 'COOF', 'COOK', 'COOL', 'COOM', 'COON', 'COOP', 'COOR', 'COOS', 'COOT', 'COPE', 'COPS', 'COPY', 'CORD', 'CORE', 'CORF', 'CORK', 'CORM', 'CORN', 'CORS', 'CORY', 'COSE', 'COSH', 'COSS', 'COST', 'COSY', 'COTE', 'COTH', 'COTS', 'COTT', 'COUP', 'COUR', 'COVE', 'COVY', 'COWK', 'COWL', 'COWP', 'COWS', 'COWY', 'COXA', 'COXY', 'COYS', 'COZE', 'COZY', 'CRAB', 'CRAG', 'CRAM', 'CRAN', 'CRAP', 'CRAW', 'CRAY', 'CRED', 'CREE', 'CREM', 'CREW', 'CRIB', 'CRIM', 'CRIP', 'CRIS', 'CROC', 'CROG', 'CROP', 'CROW', 'CRUD', 'CRUE', 'CRUS', 'CRUX', 'CUBE', 'CUBS', 'CUDS', 'CUED', 'CUES', 'CUFF', 'CUIF', 'CUIS', 'CUKE', 'CULL', 'CULM', 'CULT', 'CUNT', 'CUPS', 'CURB', 'CURD', 'CURE', 'CURF', 'CURL', 'CURN', 'CURR', 'CURS', 'CURT', 'CUSH', 'CUSP', 'CUTE', 'CUTS', 'CWMS', 'CYAN', 'CYME', 'CYST', 'CZAR',
    'DABS', 'DACE', 'DACK', 'DADO', 'DADS', 'DAES', 'DAFF', 'DAFT', 'DAGO', 'DAGS', 'DAHL', 'DAHS', 'DAIS', 'DAKS', 'DALE', 'DALI', 'DALS', 'DALT', 'DAME', 'DAMN', 'DAMP', 'DAMS', 'DANG', 'DANK', 'DANS', 'DANT', 'DAPS', 'DARB', 'DARE', 'DARG', 'DARI', 'DARK', 'DARN', 'DART', 'DASH', 'DATA', 'DATE', 'DATO', 'DAUB', 'DAUD', 'DAUR', 'DAUT', 'DAVY', 'DAWD', 'DAWK', 'DAWN', 'DAWS', 'DAWT', 'DAYS', 'DAZE', 'DEAD', 'DEAF', 'DEAL', 'DEAN', 'DEAR', 'DEAW', 'DEBE', 'DEBS', 'DEBT', 'DECK', 'DECO', 'DEED', 'DEEK', 'DEEM', 'DEEN', 'DEEP', 'DEER', 'DEES', 'DEET', 'DEEV', 'DEFI', 'DEFO', 'DEFT', 'DEFY', 'DEGS', 'DEGU', 'DEID', 'DEIF', 'DEIL', 'DEKE', 'DELE', 'DELF', 'DELI', 'DELL', 'DELO', 'DELP', 'DELS', 'DELT', 'DEME', 'DEMO', 'DEMY', 'DENE', 'DENI', 'DENS', 'DENT', 'DENY', 'DEPS', 'DERM', 'DERO', 'DERV', 'DESI', 'DESK', 'DEVA', 'DEVI', 'DEVO', 'DEWS', 'DEWY', 'DHAL', 'DHAK', 'DHOL', 'DHOW', 'DIAL', 'DIBS', 'DICE', 'DICK', 'DICT', 'DIDO', 'DIDY', 'DIED', 'DIEL', 'DIES', 'DIET', 'DIFF', 'DIFS', 'DIGS', 'DIKE', 'DILL', 'DIME', 'DIMS', 'DINE', 'DING', 'DINK', 'DINO', 'DINS', 'DINT', 'DIOL', 'DIPS', 'DIPT', 'DIRE', 'DIRK', 'DIRL', 'DIRT', 'DISA', 'DISC', 'DISH', 'DISK', 'DISS', 'DITA', 'DITE', 'DITS', 'DITT', 'DITZ', 'DIVA', 'DIVE', 'DIVI', 'DIVO', 'DIVS', 'DIWAN', 'DIXIT', 'DIYA', 'DJIN', 'DOAB', 'DOAT', 'DOBS', 'DOBY', 'DOCK', 'DOCO', 'DOCS', 'DODO', 'DOEN', 'DOER', 'DOES', 'DOFF', 'DOGE', 'DOGS', 'DOGY', 'DOIT', 'DOJO', 'DOLE', 'DOLL', 'DOLT', 'DOME', 'DOMS', 'DOMY', 'DONA', 'DONE', 'DONG', 'DONS', 'DOOB', 'DOOK', 'DOOL', 'DOOM', 'DOON', 'DOOR', 'DOOS', 'DOPA', 'DOPE', 'DOPS', 'DOPY', 'DORB', 'DORE', 'DORK', 'DORM', 'DORP', 'DORR', 'DORS', 'DORT', 'DORY', 'DOSE', 'DOSS', 'DOST', 'DOTE', 'DOTH', 'DOTS', 'DOTY', 'DOUC', 'DOUK', 'DOUM', 'DOUP', 'DOUR', 'DOUT', 'DOUX', 'DOVE', 'DOWD', 'DOWF', 'DOWL', 'DOWN', 'DOWP', 'DOWS', 'DOWT', 'DOXY', 'DOYS', 'DOZE', 'DOZY', 'DRAB', 'DRAC', 'DRAG', 'DRAM', 'DRAP', 'DRAT', 'DRAW', 'DRAY', 'DREE', 'DREG', 'DREK', 'DREW', 'DREY', 'DRIP', 'DROP', 'DROW', 'DRUB', 'DRUG', 'DRUM', 'DUAD', 'DUAL', 'DUAN', 'DUAR', 'DUBS', 'DUCE', 'DUCI', 'DUCK', 'DUCT', 'DUDE', 'DUDS', 'DUED', 'DUER', 'DUES', 'DUET', 'DUFF', 'DUGS', 'DUIT', 'DUKA', 'DUKE', 'DULL', 'DULY', 'DUMA', 'DUMB', 'DUMP', 'DUNE', 'DUNG', 'DUNK', 'DUNS', 'DUNT', 'DUOS', 'DUPE', 'DUPS', 'DURA', 'DURE', 'DURN', 'DURO', 'DURR', 'DUSH', 'DUSK', 'DUST', 'DUTY', 'DWAM', 'DYAD', 'DYED', 'DYER', 'DYES', 'DYKE', 'DYNE', 'DZHO',
    'EACH', 'EALE', 'EANS', 'EARD', 'EARL', 'EARN', 'EARS', 'EASE', 'EAST', 'EASY', 'EATH', 'EATS', 'EAUS', 'EAUX', 'EAVE', 'EBBS', 'EBON', 'ECCU', 'ECHE', 'ECHO', 'ECHT', 'ECOD', 'ECOL', 'ECON', 'ECRU', 'ECUS', 'EDDO', 'EDDY', 'EDGE', 'EDGY', 'EDHS', 'EDIT', 'EECH', 'EELS', 'EELY', 'EERY', 'EFFS', 'EFTS', 'EGAD', 'EGAL', 'EGER', 'EGGS', 'EGGY', 'EGIS', 'EGMA', 'EGOS', 'EHED', 'EIDE', 'EKED', 'EKES', 'EKKA', 'ELAN', 'ELDS', 'ELFS', 'ELHI', 'ELKS', 'ELLS', 'ELMS', 'ELMY', 'ELSE', 'ELTS', 'EMEU', 'EMIC', 'EMIR', 'EMIT', 'EMMA', 'EMMY', 'EMOS', 'EMPT', 'EMUS', 'EMYD', 'MYDS', 'ENAM', 'ENDS', 'ENES', 'ENEW', 'ENGS', 'ENOL', 'ENOW', 'ENUF', 'ENVY', 'EOAN', 'EORL', 'EOSN', 'EPAC', 'EPEE', 'EPHA', 'EPIC', 'EPOS', 'ERAS', 'ERED', 'ERES', 'ERGS', 'ERIC', 'ERIS', 'ERKS', 'ERNE', 'ERNS', 'EROS', 'ERST', 'ERUV', 'ERVN', 'ESES', 'ESNE', 'ESPY', 'ESSE', 'ESTS', 'ETAS', 'ETAT', 'ETCH', 'ETEN', 'ETHE', 'ETHI', 'ETHZ', 'ETHS', 'ETIC', 'ETNA', 'ETUI', 'EURE', 'EVEN', 'EVER', 'EVES', 'EVIL', 'EVOE', 'EVOS', 'EWER', 'EWES', 'EWST', 'EXAM', 'EXEC', 'EXED', 'EXES', 'EXIT', 'EXON', 'EXPO', 'EXUL', 'EYAS', 'EYED', 'EYEN', 'EYER', 'EYES', 'EYNE', 'EYOT', 'EYRA', 'EYRE', 'EYRY',
    'FAAN', 'FAAS', 'FABS', 'FACE', 'FACH', 'FACT', 'FADE', 'FADO', 'FADS', 'FADY', 'FAFF', 'FAGS', 'FAHS', 'FAIL', 'FAIN', 'FAIR', 'FAIX', 'FAKE', 'FALL', 'FALX', 'FAME', 'FAND', 'FANG', 'FANK', 'FANO', 'FANS', 'FARD', 'FARE', 'FARL', 'FARM', 'FARO', 'FART', 'FASH', 'FAST', 'FATE', 'FATH', 'FATS', 'FAUN', 'FAUR', 'FAUS', 'FAUX', 'FAVE', 'FAWN', 'FAWS', 'FAYS', 'FAZE', 'FEAL', 'FEAR', 'FEAT', 'FECK', 'FEDS', 'FEED', 'FEEL', 'FEEN', 'FEER', 'FEES', 'FEET', 'FEHM', 'FEIS', 'FELL', 'FELT', 'FEME', 'FEMS', 'FEND', 'FENI', 'FENS', 'FENT', 'FEOD', 'FERE', 'FERM', 'FERN', 'FESS', 'FEST', 'FETA', 'FETE', 'FETS', 'FETT', 'FEUD', 'FEUS', 'FIAR', 'FIAT', 'FIBS', 'FICE', 'FICO', 'FIDO', 'FIDS', 'FIEF', 'FIEW', 'FIFE', 'FIGO', 'FIGS', 'FIKE', 'FIKY', 'FILA', 'FILE', 'FILI', 'FILL', 'FILM', 'FILO', 'FILS', 'FIND', 'FINE', 'FINI', 'FINK', 'FINO', 'FINS', 'FIRE', 'FIRK', 'FIRM', 'FIRN', 'FIRS', 'FISC', 'FISH', 'FISK', 'FIST', 'FITS', 'FITT', 'FIVE', 'FIXS', 'FIXT', 'FIZZ', 'FLAB', 'FLAG', 'FLAK', 'FLAM', 'FLAN', 'FLAP', 'FLAT', 'FLAW', 'FLAX', 'FLAY', 'FLEA', 'FLED', 'FLEE', 'FLEG', 'FLEW', 'FLEX', 'FLEY', 'FLIC', 'FLIM', 'FLIP', 'FLIR', 'FLIT', 'FLIX', 'FLOE', 'FLOG', 'FLOP', 'FLOR', 'FLOW', 'FLOX', 'FLUB', 'FLUE', 'FLUS', 'FLUX', 'FOAL', 'FOAM', 'FOCI', 'FOEN', 'FOES', 'FOGS', 'FOGY', 'FOHN', 'FOID', 'FOIL', 'FOIN', 'FOLD', 'FOLK', 'FOND', 'FONS', 'FONT', 'FOOD', 'FOOL', 'FOOT', 'FOPS', 'FORA', 'FORB', 'FORD', 'FORE', 'FORK', 'FORM', 'FORT', 'FOSS', 'FOUL', 'FOUR', 'FOUS', 'FOWL', 'FOXY', 'FOYS', 'FOZY', 'FRAB', 'FRAG', 'FRAP', 'FRAS', 'FRAT', 'FRAU', 'FRAY', 'FREE', 'FRET', 'FRIB', 'FRIG', 'FRIS', 'FRIT', 'FROB', 'FROE', 'FROG', 'FROM', 'FROS', 'FROW', 'FRUG', 'FUBS', 'FUBY', 'FUCK', 'FUDS', 'FUEL', 'FUFF', 'FUGS', 'FUGU', 'FUJI', 'FULL', 'FUME', 'FUMY', 'FUND', 'FUNG', 'FUNK', 'FUNS', 'FURL', 'FURS', 'FURY', 'FUSC', 'FUSE', 'FUSS', 'FUST', 'FUTZ', 'FUZE', 'FUZZ', 'FYCE', 'FYKE', 'FYLE',
    'GABS', 'GABY', 'GADE', 'GADI', 'GADS', 'GAED', 'GAEN', 'GAES', 'GAFF', 'GAGA', 'GAGE', 'GAGS', 'GAID', 'GAIN', 'GAIR', 'GAIT', 'GAJO', 'GALA', 'GALE', 'GALL', 'GALP', 'GALS', 'GAMA', 'GAMB', 'GAME', 'GAMP', 'GAMS', 'GAMY', 'GANE', 'GANG', 'GANS', 'GANT', 'GAOL', 'GAPE', 'GAPO', 'GAPS', 'GAPY', 'GARB', 'GARE', 'GARI', 'GARN', 'GARS', 'GART', 'GASH', 'GASP', 'GAST', 'GATE', 'GATH', 'GATS', 'GAUD', 'GAUM', 'GAUN', 'GAUP', 'GAUR', 'GAUS', 'GAVE', 'GAWD', 'GAWK', 'GAWP', 'GAYS', 'GAZE', 'GAZY', 'GEAL', 'GEAN', 'GEAR', 'GEAT', 'GECK', 'GEDD', 'GEDS', 'GEED', 'GEEK', 'GEEP', 'GEES', 'GEEZ', 'GEIT', 'GELD', 'GELS', 'GELT', 'GEMS', 'GENA', 'GENE', 'GENS', 'GENT', 'GENU', 'GEOS', 'GERB', 'GERM', 'GERS', 'GERT', 'GEST', 'GETA', 'GETS', 'GEUM', 'GHAT', 'GHEE', 'GIBE', 'GIBS', 'GIDS', 'GIED', 'GIEN', 'GIES', 'GIFT', 'GIGA', 'GIGS', 'GILA', 'GILD', 'GILL', 'GILT', 'GIMP', 'GING', 'GINK', 'GINN', 'GINS', 'GIOS', 'GIRD', 'GIRL', 'GIRN', 'GIRO', 'GIRR', 'GIRT', 'GISM', 'GIST', 'GITE', 'GITS', 'GIVE', 'GIZZ', 'GLAD', 'GLAM', 'GLAR', 'GLEA', 'GLEB', 'GLED', 'GLEE', 'GLEG', 'GLEI', 'GLEN', 'GLEY', 'GLIA', 'GLIB', 'GLID', 'GLIM', 'GLIT', 'GLOB', 'GLOM', 'GLOP', 'GLOW', 'GLUE', 'GLUG', 'GLUM', 'GLUT', 'GNAR', 'GNAT', 'GNAW', 'GNUS', 'GOAD', 'GOAF', 'GOAL', 'GOAS', 'GOAT', 'GOBI', 'GOBO', 'GOBS', 'GOBY', 'GODS', 'GOEL', 'GOER', 'GOES', 'GOEY', 'GOFF', 'GOGO', 'GOLD', 'GOLE', 'GOLF', 'GOLP', 'GONE', 'GONG', 'GONK', 'GONS', 'GOOD', 'GOOF', 'GOOG', 'GOOK', 'GOOL', 'GOON', 'GOOP', 'GOOR', 'GOOS', 'GORA', 'GORE', 'GORI', 'GORM', 'GORP', 'GORS', 'GORY', 'GOSH', 'GOSS', 'GOTH', 'GOUT', 'GOVS', 'GOWD', 'GOWF', 'GOWK', 'GOWL', 'GOWN', 'GOYS', 'GRAB', 'GRAD', 'GRAM', 'GRAN', 'GRAT', 'GRAV', 'GRAY', 'GREE', 'GREN', 'GREW', 'GREX', 'GREY', 'GRID', 'GRIE', 'GRIG', 'GRIM', 'GRIN', 'GRIP', 'GRIS', 'GRIT', 'GROG', 'GROK', 'GROT', 'GROW', 'GRUB', 'GRUE', 'GRUM', 'GUAN', 'GUAR', 'GUCK', 'GUDE', 'GUID', 'GULA', 'GULE', 'GULF', 'GULL', 'GULP', 'GULS', 'GULY', 'GUMP', 'GUMS', 'GUNG', 'GUNK', 'GUNS', 'GUPP', 'GURK', 'GURL', 'GURN', 'GURR', 'GURS', 'GURU', 'GUSH', 'GUST', 'GUTS', 'GUYS', 'GUZE', 'GVAS', 'GWED', 'GWEE', 'GWYN', 'GYBE', 'GYLE', 'GYMP', 'GYNO', 'GYNY', 'GYPS', 'GYRE', 'GYRI', 'GYRO', 'GYTE',
    'HAAR', 'HABU', 'HACK', 'HADE', 'HADJ', 'HADS', 'HAED', 'HAEM', 'HAEN', 'HAES', 'HAET', 'HAFF', 'HAFT', 'HAGS', 'HAHA', 'HAHS', 'HAIC', 'HAIK', 'HAIL', 'HAIN', 'HAIR', 'HAIS', 'HAJI', 'HAJJ', 'HAKA', 'HAKE', 'HAKU', 'HALE', 'HALF', 'HALL', 'HALM', 'HALO', 'HALT', 'HAME', 'HAMS', 'HAND', 'HANG', 'HANK', 'HANT', 'HAPS', 'HAPU', 'HARD', 'HARE', 'HARK', 'HARL', 'HARM', 'HARN', 'HARO', 'HARP', 'HART', 'HASH', 'HASK', 'HASP', 'HAST', 'HATE', 'HATH', 'HATS', 'HAUD', 'HAUF', 'HAUL', 'HAUN', 'HAUS', 'HAUT', 'HAVE', 'HAWK', 'HAWM', 'HAWS', 'HAYS', 'HAZE', 'HAZY', 'HEAD', 'HEAL', 'HEAP', 'HEAR', 'HEAT', 'HEBE', 'HECH', 'HECK', 'HEED', 'HEEL', 'HEFT', 'HEHS', 'HEID', 'HEIL', 'HEIR', 'HELD', 'HELE', 'HELL', 'HELM', 'HELO', 'HELP', 'HEME', 'HEMP', 'HEMS', 'HEND', 'HENG', 'HENS', 'HENT', 'HEPS', 'HERB', 'HERD', 'HERE', 'HERL', 'HERM', 'HERN', 'HERO', 'HERS', 'HERY', 'HESP', 'HEST', 'HETE', 'HETH', 'HETS', 'HEWN', 'HEWS', 'HEWT', 'HEXA', 'HEXX', 'HEYS', 'HICK', 'HIDE', 'HIED', 'HIES', 'HIGH', 'HIKE', 'HILA', 'HILI', 'HILL', 'HILT', 'HIMS', 'HIND', 'HING', 'HINK', 'HINS', 'HINT', 'HIOI', 'HIPS', 'HIPT', 'HIRE', 'HISH', 'HISS', 'HIST', 'HITS', 'HIVE', 'HIYA', 'HIZZ', 'HOAR', 'HOAS', 'HOAX', 'HOBO', 'HOBS', 'HOCK', 'HODS', 'HOED', 'HOER', 'HOES', 'HOGG', 'HOGH', 'HOGS', 'HOHA', 'HOHS', 'HOIK', 'HOKE', 'HOKI', 'HOLD', 'HOLE', 'HOLK', 'HOLM', 'HOLO', 'HOLP', 'HOLS', 'HOLT', 'HOLY', 'HOMA', 'HOME', 'HOMO', 'HOMS', 'HOMY', 'HOND', 'HONE', 'HONG', 'HONK', 'HONS', 'HOOD', 'HOOF', 'HOOK', 'HOOL', 'HOON', 'HOOP', 'HOOT', 'HOPE', 'HOPS', 'HORA', 'HORE', 'HORI', 'HORN', 'HORS', 'HOSE', 'HOSS', 'HOST', 'HOTE', 'HOTH', 'HOTS', 'HOUF', 'HOUR', 'HOUT', 'HOVE', 'HOWE', 'HOWF', 'HOWK', 'HOWL', 'HOWS', 'HOYA', 'HOYS', 'HUBS', 'HUCK', 'HUES', 'HUFF', 'HUGE', 'HUGS', 'HUGY', 'HUIA', 'HUIC', 'HUIS', 'HULA', 'HULE', 'HULK', 'HULL', 'HUMA', 'HUMF', 'HUMP', 'HUMS', 'HUNG', 'HUNH', 'HUNK', 'HUNS', 'HUNT', 'HUPS', 'HURL', 'HURR', 'HURT', 'HUSH', 'HUSK', 'HUSO', 'HUSS', 'HUTS', 'HWAN', 'HWYL', 'HYED', 'HYEN', 'HYER', 'HYKE', 'HYLA', 'HYLE', 'HYMN', 'HYPE', 'HYPO', 'HYPS', 'HYTE',
    'IAMB', 'IBEX', 'IBIS', 'ICED', 'ICER', 'ICES', 'ICHU', 'ICON', 'IDEA', 'IDEE', 'IDEM', 'IDES', 'IDLE', 'IDLY', 'IDOL', 'IDYL', 'IFFY', 'IGAD', 'IGLU', 'IKAN', 'IKAT', 'IKON', 'ILEA', 'ILEX', 'ILIA', 'ILKA', 'ILKS', 'ILLS', 'ILLY', 'IMAM', 'IMID', 'IMMY', 'IMPI', 'IMPS', 'INBY', 'INCH', 'INFO', 'INGA', 'INGO', 'INIA', 'INKS', 'INKY', 'INLY', 'INNS', 'INRO', 'INTI', 'INTO', 'IONS', 'IOTA', 'IRED', 'IRES', 'IRIS', 'IRKS', 'IRNS', 'IRON', 'IRUP', 'ISBA', 'ISIT', 'ISLE', 'ISMS', 'ISNA', 'ISOS', 'ITCH', 'ITEM', 'ITER', 'IVES', 'IVVY', 'IXIA', 'IYER', 'IZAR',
    'JAAP', 'JABS', 'JACK', 'JADE', 'JAFAS', 'JAGA', 'JAGG', 'JAGS', 'JAIL', 'JAKE', 'JAKS', 'JAMB', 'JAMS', 'JANE', 'JANN', 'JAPE', 'JAPS', 'JARK', 'JARL', 'JARS', 'JASP', 'JASS', 'JASY', 'JATO', 'JAUK', 'JAUP', 'JAVA', 'JAWS', 'JAXY', 'JAYS', 'JAZZ', 'JEAN', 'JEAT', 'JEDI', 'JEED', 'JEEL', 'JEEP', 'JEER', 'JEES', 'JEEZ', 'JEFE', 'JEFF', 'JEHU', 'JELL', 'JEON', 'JERK', 'JESS', 'JEST', 'JETE', 'JETS', 'JEUX', 'JEWS', 'JIAO', 'JIBB', 'JIBE', 'JIBS', 'JIFF', 'JIGS', 'JILL', 'JILT', 'JIMP', 'JINK', 'JINN', 'JINS', 'JINX', 'JIRD', 'JISM', 'JIVE', 'JIVY', 'JOBS', 'JOCK', 'JOCO', 'JOES', 'JOEY', 'JOGS', 'JOHN', 'JOIN', 'JOKE', 'JOKY', 'JOLE', 'JOLL', 'JOLS', 'JOLT', 'JOMO', 'JONG', 'JOOK', 'JORP', 'JOSH', 'JOSS', 'JOTA', 'JOTS', 'JOUK', 'JOUR', 'JOWL', 'JOWS', 'JOYS', 'JUBA', 'JUBE', 'JUCO', 'JUDO', 'JUDS', 'JUDY', 'JUGA', 'JUGS', 'JUJU', 'JUKE', 'JUKU', 'JUMP', 'JUNK', 'JUPE', 'JURA', 'JURE', 'JURY', 'JUST', 'JUTE', 'JUTS', 'JUVE', 'JYTE',
    'KAAL', 'KAAS', 'KABS', 'KADI', 'KAEA', 'KAES', 'KAFS', 'KAGO', 'KAGU', 'KAID', 'KAIE', 'KAIF', 'KAIK', 'KAIL', 'KAIM', 'KAIN', 'KAIS', 'KAKA', 'KAKI', 'KAKS', 'KALE', 'KALI', 'KAMA', 'KAME', 'KAMI', 'KANA', 'KANE', 'KANG', 'KANS', 'KANT', 'KAON', 'KAPA', 'KAPH', 'KAPO', 'KAPS', 'KARA', 'KARK', 'KARN', 'KARO', 'KART', 'KATA', 'KATI', 'KATS', 'KAVA', 'KAWA', 'KAWS', 'KAYO', 'KAYS', 'KAZI', 'KBAR', 'KEAS', 'KEBO', 'KECK', 'KEDS', 'KEEF', 'KEEK', 'KEEL', 'KEEN', 'KEEP', 'KEET', 'KEFS', 'KEGS', 'KEIR', 'KELE', 'KELP', 'KELT', 'KEMB', 'KEMP', 'KENO', 'KENS', 'KENT', 'KEPI', 'KEPS', 'KEPT', 'KERB', 'KERF', 'KERN', 'KERO', 'KESH', 'KEST', 'KETA', 'KETE', 'KETO', 'KETS', 'KEWL', 'KEYS', 'KHAF', 'KHAN', 'KHAT', 'KHET', 'KHIS', 'KHOR', 'KHUD', 'KIBE', 'KICK', 'KIDS', 'KIEF', 'KIER', 'KIFF', 'KIFS', 'KIKE', 'KILD', 'KILL', 'KILN', 'KILO', 'KILP', 'KILT', 'KINA', 'KIND', 'KINE', 'KING', 'KINK', 'KINO', 'KINS', 'KIPE', 'KIPS', 'KIRK', 'KIRN', 'KIRS', 'KISH', 'KISS', 'KIST', 'KITE', 'KITH', 'KITS', 'KIVA', 'KIWI', 'KLAP', 'KLIK', 'KLIP', 'KLOP', 'KLUT', 'KNAG', 'KNAP', 'KNAR', 'KNEE', 'KNEW', 'KNIT', 'KNOB', 'KNOP', 'KNOT', 'KNOW', 'KNUB', 'KNUR', 'KNUT', 'KOAN', 'KOAS', 'KOBO', 'KOBS', 'KOEL', 'KOFF', 'KOHA', 'KOHL', 'KOIS', 'KOJI', 'KOKA', 'KOLA', 'KOLO', 'KOND', 'KONK', 'KONS', 'KOOK', 'KOPE', 'KOPS', 'KORA', 'KORE', 'KORO', 'KORS', 'KORU', 'KOSS', 'KOTO', 'KOTU', 'KOUL', 'KRAI', 'KRAY', 'KRIS', 'KSAR', 'KUDO', 'KUDU', 'KUEH', 'KUES', 'KUFI', 'KUIA', 'KUKU', 'KULA', 'KULI', 'KUNA', 'KUNE', 'KURI', 'KURU', 'KUTA', 'KVAS', 'KYAK', 'KYAR', 'KYAT', 'KYBO', 'KYES', 'KYLE', 'KYND', 'KYNE', 'KYPE', 'KYTE', 'KYTH',
    'LABS', 'LACE', 'LACK', 'LACS', 'LACY', 'LADE', 'LADS', 'LADY', 'LAER', 'LAET', 'LAEV', 'LAGS', 'LAHS', 'LAIC', 'LAID', 'LAIK', 'LAIN', 'LAIR', 'LAKE', 'LAKH', 'LAKY', 'LALL', 'LAMA', 'LAMB', 'LAME', 'LAMP', 'LAMS', 'LANA', 'LAND', 'LANE', 'LANG', 'LANK', 'LANT', 'LANX', 'LAPS', 'LARD', 'LARE', 'LARI', 'LARK', 'LARN', 'LARS', 'LASE', 'LASH', 'LASS', 'LAST', 'LATE', 'LATH', 'LATI', 'LATS', 'LATU', 'LAUD', 'LAUF', 'LAVA', 'LAVE', 'LAVS', 'LAWK', 'LAWN', 'LAWR', 'LAWS', 'LAYS', 'LAZE', 'LAZY', 'LEAD', 'LEAF', 'LEAK', 'LEAL', 'LEAM', 'LEAN', 'LEAP', 'LEAR', 'LEAS', 'LEAT', 'LECH', 'LEEK', 'LEEP', 'LEER', 'LEES', 'LEET', 'LEFS', 'LEFT', 'LEGS', 'LEHR', 'LEIR', 'LEIS', 'LEKE', 'LEKS', 'LEKU', 'LEME', 'LEND', 'LENG', 'LENO', 'LENS', 'LENT', 'LEOS', 'LEPS', 'LEPT', 'LERE', 'LERP', 'LESS', 'LEST', 'LETS', 'LEUD', 'LEVA', 'LEVE', 'LEVO', 'LEVS', 'LEVY', 'LEWD', 'LEYS', 'LIAR', 'LIAS', 'LIBS', 'LICE', 'LICH', 'LICK', 'LIDO', 'LIDS', 'LIED', 'LIEF', 'LIEN', 'LIER', 'LIES', 'LIEU', 'LIFE', 'LIFT', 'LIGS', 'LIKE', 'LILL', 'LILO', 'LILT', 'LILY', 'LIMA', 'LIMB', 'LIME', 'LIMN', 'LIMO', 'LIMP', 'LIMY', 'LIND', 'LINE', 'LING', 'LINK', 'LINN', 'LINO', 'LINS', 'LINT', 'LINY', 'LION', 'LIPA', 'LIPE', 'LIPO', 'LIPS', 'LIRA', 'LIRE', 'LIRI', 'LIRK', 'LISP', 'LIST', 'LITE', 'LITH', 'LITS', 'LITU', 'LIVE', 'LOAD', 'LOAF', 'LOAM', 'LOAN', 'LOBE', 'LOBI', 'LOBO', 'LOBS', 'LOCA', 'LOCH', 'LOCK', 'LOCO', 'LODE', 'LOFT', 'LOGE', 'LOGO', 'LOGS', 'LOGY', 'LOID', 'LOIN', 'LOIR', 'LOKE', 'LOMA', 'LOME', 'LONE', 'LONG', 'LOOF', 'LOOK', 'LOOM', 'LOON', 'LOOP', 'LOOR', 'LOOS', 'LOOT', 'LOPE', 'LOPS', 'LORD', 'LORE', 'LORN', 'LORY', 'LOSE', 'LOSH', 'LOSS', 'LOST', 'LOTA', 'LOTE', 'LOTH', 'LOTI', 'LOTO', 'LOTS', 'LOUD', 'LOUN', 'LOUP', 'LOUR', 'LOUS', 'LOUT', 'LOVE', 'LOWE', 'LOWN', 'LOWP', 'LOWS', 'LOWT', 'LUAU', 'LUBE', 'LUCE', 'LUCK', 'LUDE', 'LUDO', 'LUDS', 'LUER', 'LUES', 'LUFF', 'LUGE', 'LUGS', 'LUIT', 'LUKE', 'LULL', 'LULU', 'LUMA', 'LUMP', 'LUMS', 'LUNA', 'LUNE', 'LUNG', 'LUNK', 'LUNT', 'LUNY', 'LURE', 'LURK', 'LURS', 'LUSH', 'LUSK', 'LUST', 'LUTE', 'LUTZ', 'LUVS', 'LUXE', 'LWEI', 'LYAM', 'LYCH', 'LYES', 'LYME', 'LYMS', 'LYNE', 'LYNX', 'LYRA', 'LYRE', 'LYSE', 'LYTE',
    'MAAR', 'MAAS', 'MABE', 'MACS', 'MADE', 'MADS', 'MAES', 'MAGE', 'MAGG', 'MAGI', 'MAGS', 'MAID', 'MAIK', 'MAIL', 'MAIM', 'MAIN', 'MAIR', 'MAKE', 'MAKI', 'MAKO', 'MAKS', 'MALA', 'MALE', 'MALI', 'MALL', 'MALM', 'MALS', 'MALT', 'MAMA', 'MAMI', 'MAMS', 'MANA', 'MAND', 'MANE', 'MANG', 'MANI', 'MANO', 'MANS', 'MANY', 'MAPS', 'MARA', 'MARC', 'MARD', 'MARE', 'MARG', 'MARK', 'MARL', 'MARM', 'MARS', 'MART', 'MARY', 'MASA', 'MASE', 'MASH', 'MASK', 'MASS', 'MAST', 'MASU', 'MATE', 'MATH', 'MATS', 'MATT', 'MATY', 'MAUD', 'MAUL', 'MAUN', 'MAUT', 'MAWK', 'MAWN', 'MAWR', 'MAWS', 'MAXI', 'MAYA', 'MAYO', 'MAYS', 'MAZE', 'MAZY', 'MEAD', 'MEAL', 'MEAN', 'MEAT', 'MECH', 'MECK', 'MEDS', 'MEED', 'MEEK', 'MEER', 'MEES', 'MEET', 'MEFF', 'MEGA', 'MEGS', 'MEIN', 'MELA', 'MELD', 'MELE', 'MELL', 'MELO', 'MELS', 'MELT', 'MEME', 'MEMO', 'MEMS', 'MEND', 'MENE', 'MENG', 'MENO', 'MENT', 'MENU', 'MEOW', 'MERC', 'MERE', 'MERI', 'MERK', 'MERL', 'MESA', 'MESE', 'MESH', 'MESO', 'MESS', 'META', 'METE', 'METH', 'METS', 'MEVE', 'MEWS', 'MEWT', 'MEZE', 'MEZZ', 'MHOS', 'MIAS', 'MICA', 'MICE', 'MICH', 'MICK', 'MICO', 'MICS', 'MIDI', 'MIDS', 'MIEN', 'MIFF', 'MIGG', 'MIGS', 'MIHA', 'MIHI', 'MIKE', 'MILD', 'MILE', 'MILF', 'MILK', 'MILL', 'MILO', 'MILS', 'MILT', 'MIMA', 'MIME', 'MIMI', 'MINA', 'MIND', 'MINE', 'MING', 'MINI', 'MINK', 'MINO', 'MINT', 'MINX', 'MINY', 'MIPS', 'MIRE', 'MIRI', 'MIRK', 'MIRO', 'MIRS', 'MIRV', 'MIRY', 'MISE', 'MISO', 'MISS', 'MIST', 'MITE', 'MITT', 'MITY', 'MIXT', 'MIXY', 'MIZZ', 'MNAS', 'MOAI', 'MOAN', 'MOAS', 'MOAT', 'MOBE', 'MOBS', 'MOCH', 'MOCK', 'MOCS', 'MODE', 'MODI', 'MODS', 'MOED', 'MOER', 'MOES', 'MOFO', 'MOGS', 'MOHR', 'MOIL', 'MOIT', 'MOJO', 'MOKE', 'MOKI', 'MOKO', 'MOLA', 'MOLD', 'MOLE', 'MOLL', 'MOLS', 'MOLT', 'MOLY', 'MOME', 'MOMI', 'MOMS', 'MONA', 'MONG', 'MONK', 'MONO', 'MONS', 'MONY', 'MOOD', 'MOOI', 'MOOK', 'MOOL', 'MOON', 'MOOP', 'MOOR', 'MOOS', 'MOOT', 'MOPE', 'MOPS', 'MOPY', 'MORA', 'MORE', 'MORN', 'MORS', 'MORT', 'MOSE', 'MOSH', 'MOSK', 'MOSS', 'MOST', 'MOTE', 'MOTH', 'MOTI', 'MOTS', 'MOTT', 'MOTU', 'MOUF', 'MOUP', 'MOUS', 'MOVE', 'MOWS', 'MOXA', 'MOYA', 'MOZO', 'MUCH', 'MUCK', 'MUDS', 'MUFF', 'MUGG', 'MUGS', 'MUID', 'MUIL', 'MUIR', 'MULE', 'MULL', 'MUMM', 'MUMP', 'MUMS', 'MUMU', 'MUNG', 'MUNI', 'MUNS', 'MUON', 'MURA', 'MURE', 'MURK', 'MURL', 'MURR', 'MUSE', 'MUSH', 'MUSK', 'MUSO', 'MUSS', 'MUST', 'MUTE', 'MUTI', 'MUTT', 'MUZZ', 'MWAH', 'MYAL', 'MYCS', 'MYNA', 'MYTH',
    'NAAM', 'NAAN', 'NABE', 'NABS', 'NADA', 'NADS', 'NAEV', 'NAFF', 'NAGA', 'NAGS', 'NAIF', 'NAIK', 'NAIL', 'NAIN', 'NALA', 'NAME', 'NANA', 'NANE', 'NANS', 'NAOI', 'NAOS', 'NAPA', 'NAPE', 'NAPS', 'NARC', 'NARD', 'NARE', 'NARK', 'NARY', 'NATZ', 'NAVE', 'NAVY', 'NAYS', 'NAZE', 'NAZI', 'NEAL', 'NEAP', 'NEAR', 'NEAT', 'NEBS', 'NECK', 'NEED', 'NEEM', 'NEEP', 'NEFS', 'NEGS', 'NEIF', 'NEKS', 'NEMA', 'NEMN', 'NENE', 'NEON', 'NEPS', 'NERD', 'NERK', 'NESH', 'NEST', 'NETE', 'NETS', 'NETT', 'NEUK', 'NEUM', 'NEVE', 'NEVI', 'NEWB', 'NEWS', 'NEWT', 'NEXT', 'NGAI', 'NIBS', 'NICE', 'NICK', 'NIDE', 'NIDI', 'NIDS', 'NIEU', 'NIFE', 'NIGH', 'NILL', 'NILS', 'NIMS', 'NINE', 'NIPA', 'NIPS', 'NIRL', 'NISH', 'NISI', 'NITE', 'NITS', 'NIXE', 'NIXY', 'NOAH', 'NOBS', 'NOCK', 'NODE', 'NODI', 'NODS', 'NOEL', 'NOES', 'NOGG', 'NOGS', 'NOIL', 'NOIR', 'NOLE', 'NOLL', 'NOLO', 'NOMA', 'NOME', 'NOMS', 'NONA', 'NONE', 'NOOK', 'NOON', 'NOOP', 'NOPE', 'NORI', 'NORK', 'NORM', 'NOSE', 'NOSH', 'NOSY', 'NOTA', 'NOTE', 'NOTS', 'NOTT', 'NOUN', 'NOUP', 'NOUS', 'NOVA', 'NOWS', 'NOWT', 'NOWY', 'NOYS', 'NUBS', 'NUDE', 'NUDI', 'NUFF', 'NUGS', 'NUKU', 'NULL', 'NUMB', 'NUNS', 'NURD', 'NURL', 'NURR', 'NURS', 'NUTS', 'NYAS', 'NYED', 'NYES',
    'OAFS', 'OAKS', 'OAKY', 'OARS', 'OARY', 'OAST', 'OATH', 'OATS', 'OATY', 'OBAS', 'OBES', 'OBEY', 'OBIA', 'OBIS', 'OBIT', 'OBOE', 'OBOL', 'OBOS', 'OCAS', 'OCAT', 'OCHA', 'OCHS', 'OCHT', 'OCRA', 'ODAH', 'ODAL', 'ODAS', 'ODDS', 'ODEA', 'ODES', 'ODIC', 'ODOR', 'ODSO', 'ODYL', 'OFAY', 'OFFS', 'OGAM', 'OGEE', 'OGLE', 'OGRE', 'OGUM', 'OHED', 'OHIA', 'OHMS', 'OHOS', 'OIKS', 'OILS', 'OILY', 'OINK', 'OINT', 'OKAS', 'OKAY', 'OKEH', 'OKES', 'OKRA', 'OKTA', 'OLDS', 'OLDY', 'OLEA', 'OLEO', 'OLES', 'OLID', 'OLIO', 'OLLA', 'OLMS', 'OLPE', 'OMBU', 'OMEN', 'OMER', 'OMIT', 'OMOV', 'ONCE', 'ONER', 'ONES', 'ONIE', 'ONOS', 'ONST', 'ONTO', 'ONUS', 'ONYX', 'OOHS', 'OOMS', 'OONS', 'OOPS', 'OOSE', 'OOSY', 'OOTS', 'OOZE', 'OOZY', 'OPAH', 'OPAL', 'OPED', 'OPEN', 'OPES', 'OPPO', 'OPTS', 'OPUS', 'ORAD', 'ORAL', 'ORBS', 'ORBY', 'ORCA', 'ORCS', 'ORDO', 'ORDS', 'ORES', 'ORFE', 'ORFS', 'ORGY', 'ORLE', 'ORRA', 'ORTS', 'ORYX', 'ORZO', 'OSAR', 'OSES', 'OSSA', 'OTIC', 'OTTO', 'OUCH', 'OUDS', 'OUKS', 'OULD', 'OULK', 'OUMA', 'OUPA', 'OUPS', 'OURN', 'OURS', 'OUST', 'OUTS', 'OUZO', 'OVAL', 'OVEL', 'OVEN', 'OVER', 'OVUM', 'OWED', 'OWEN', 'OWER', 'OWES', 'OWLS', 'OWLY', 'OWNS', 'OWRE', 'OWSE', 'OWTS', 'OXEN', 'OXER', 'OXES', 'OXID', 'OXIM', 'OYER', 'OYES', 'OYEZ',
    'PAAL', 'PACA', 'PACE', 'PACK', 'PACO', 'PACS', 'PACT', 'PACY', 'PADI', 'PADS', 'PAGE', 'PAID', 'PAIK', 'PAIL', 'PAIN', 'PAIR', 'PAIS', 'PALE', 'PALL', 'PALM', 'PALP', 'PALS', 'PALY', 'PAMS', 'PAND', 'PANE', 'PANG', 'PANS', 'PANT', 'PAPA', 'PAPE', 'PAPS', 'PARA', 'PARD', 'PARE', 'PARI', 'PARK', 'PARM', 'PARP', 'PARR', 'PARS', 'PART', 'PASE', 'PASH', 'PASS', 'PAST', 'PATE', 'PATH', 'PATS', 'PATU', 'PATY', 'PAUA', 'PAUL', 'PAVE', 'PAVS', 'PAWA', 'PAWK', 'PAWL', 'PAWN', 'PAWS', 'PAYS', 'PEAG', 'PEAK', 'PEAL', 'PEAN', 'PEAR', 'PEAS', 'PEAT', 'PEBA', 'PECH', 'PECK', 'PECS', 'PEDS', 'PEED', 'PEEK', 'PEEL', 'PEEN', 'PEEP', 'PEER', 'PEES', 'PEGH', 'PEGS', 'PEHS', 'PEIN', 'PEKE', 'PELA', 'PELE', 'PELF', 'PELL', 'PELT', 'PEND', 'PENE', 'PENI', 'PENK', 'PENS', 'PENT', 'PEON', 'PEPO', 'PEPS', 'PERC', 'PERD', 'PERE', 'PERI', 'PERK', 'PERM', 'PERN', 'PERP', 'PERT', 'PERV', 'PESO', 'PEST', 'PETS', 'PEWS', 'PFFT', 'PFUI', 'PHAT', 'PHEW', 'PHIS', 'PHIZ', 'PHOH', 'PHON', 'PHOT', 'PHUT', 'PIAL', 'PIAN', 'PIAS', 'PICA', 'PICE', 'PICK', 'PICS', 'PIED', 'PIER', 'PIES', 'PIGS', 'PIKA', 'PIKE', 'PIKI', 'PILA', 'PILE', 'PILI', 'PILL', 'PILM', 'PILY', 'PIMA', 'PIMP', 'PINA', 'PIND', 'PINE', 'PING', 'PINK', 'PINS', 'PINT', 'PINY', 'PION', 'PIOY', 'PIPA', 'PIPE', 'PIPI', 'PIPO', 'PIPS', 'PIPY', 'PIRL', 'PIRN', 'PIRS', 'PIRV', 'PISE', 'PISH', 'PISO', 'PITA', 'PITH', 'PITS', 'PITY', 'PIUM', 'PIXY', 'PIZE', 'PLAN', 'PLAP', 'PLAT', 'PLAY', 'PLEA', 'PLEB', 'PLED', 'PLEW', 'PLEX', 'PLIE', 'PLIM', 'PLOD', 'PLOP', 'PLOT', 'PLOW', 'PLOY', 'PLUG', 'PLUM', 'PLUS', 'POAS', 'POCK', 'POCO', 'PODS', 'POEM', 'POET', 'POGO', 'POGY', 'POIS', 'POKE', 'POKY', 'POLE', 'POLL', 'POLO', 'POLS', 'POLT', 'POLY', 'POME', 'POMO', 'POMP', 'POMS', 'POND', 'PONE', 'PONG', 'PONK', 'PONS', 'PONT', 'PONY', 'POOD', 'POOF', 'POOH', 'POOK', 'POOL', 'POON', 'POOP', 'POOR', 'POOS', 'POOT', 'POPE', 'POPS', 'PORE', 'PORK', 'PORN', 'PORT', 'PORY', 'POSE', 'POSH', 'POSS', 'POST', 'POSY', 'POTE', 'POTH', 'POTS', 'POTT', 'POUF', 'POUK', 'POUR', 'POUT', 'POWN', 'POWS', 'POXY', 'POZZ', 'PRAD', 'PRAM', 'PRAO', 'PRAT', 'PRAU', 'PRAY', 'PREE', 'PREM', 'PREP', 'PREX', 'PREY', 'PREZ', 'PRIC', 'PRIG', 'PRIM', 'PROA', 'PROB', 'PROD', 'PROF', 'PROG', 'PROM', 'PROO', 'PROP', 'PROS', 'PROW', 'PRRU', 'PRUS', 'PSIS', 'PSST', 'PTUI', 'PUAN', 'PUBA', 'PUBS', 'PUCE', 'PUCK', 'PUDS', 'PUDU', 'PUER', 'PUFF', 'PUGH', 'PUGS', 'PUHA', 'PUIR', 'PUJA', 'PUKE', 'PUKU', 'PULA', 'PULE', 'PULI', 'PULK', 'PULL', 'PULP', 'PULS', 'PUMA', 'PUMP', 'PUMY', 'PUNA', 'PUNG', 'PUNK', 'PUNS', 'PUNT', 'PUNY', 'PUPA', 'PUPS', 'PUPU', 'PURE', 'PURI', 'PURL', 'PURS', 'PURT', 'PURY', 'PUSH', 'PUSS', 'PUTS', 'PUTT', 'PUTZ', 'PUYA', 'PWNS', 'PYAS', 'PYAT', 'PYES', 'PYET', 'PYIC', 'PYIN', 'PYNE', 'PYOT', 'PYRE', 'PYRO',
    'QADI', 'QAID', 'QATS', 'QOPH', 'QUAD', 'QUAG', 'QUAI', 'QUAT', 'QUAY', 'QUEP', 'QUEY', 'QUID', 'QUIN', 'QUIP', 'QUIT', 'QUIZ', 'QUOD', 'QUOP',
    'RACH', 'RACK', 'RACY', 'RADE', 'RADS', 'RAFF', 'RAFT', 'RAGA', 'RAGE', 'RAGG', 'RAGI', 'RAGS', 'RAHS', 'RAIA', 'RAID', 'RAIK', 'RAIL', 'RAIN', 'RAIS', 'RAJA', 'RAKE', 'RAKI', 'RAKU', 'RALE', 'RAMI', 'RAMP', 'RAMS', 'RANA', 'RAND', 'RANG', 'RANI', 'RANK', 'RANT', 'RAPE', 'RAPS', 'RAPT', 'RARE', 'RARK', 'RASE', 'RASH', 'RASP', 'RAST', 'RATA', 'RATE', 'RATH', 'RATO', 'RATS', 'RAVE', 'RAVN', 'RAWS', 'RAYA', 'RAYS', 'RAZE', 'RAZZ', 'READ', 'REAK', 'REAL', 'REAM', 'REAN', 'REAP', 'REAR', 'REBS', 'RECK', 'RECS', 'REDE', 'REDO', 'REDS', 'REED', 'REEF', 'REEK', 'REEL', 'REEN', 'REES', 'REET', 'REFI', 'REFT', 'REGO', 'REGS', 'REHS', 'REIF', 'REIK', 'REIN', 'REIS', 'REKE', 'RELY', 'REMS', 'REND', 'RENK', 'RENO', 'RENS', 'RENT', 'RENY', 'REPO', 'REPP', 'REPS', 'RESH', 'REST', 'RETE', 'RETS', 'REVS', 'REWA', 'REWS', 'RHEA', 'RHOS', 'RHUS', 'RIAL', 'RIAS', 'RIBA', 'RIBS', 'RICE', 'RICH', 'RICK', 'RIDE', 'RIDS', 'RIEL', 'RIEM', 'RIFE', 'RIFF', 'RIFS', 'RIFT', 'RIGG', 'RIGS', 'RILE', 'RILL', 'RIMA', 'RIME', 'RIMS', 'RIMU', 'RIMY', 'RIND', 'RINE', 'RING', 'RINK', 'RINS', 'RIOT', 'RIPE', 'RIPP', 'RIPS', 'RIPT', 'RISE', 'RISK', 'RISP', 'RITE', 'RITS', 'RITT', 'RITZ', 'RIVE', 'RIVO', 'RIZA', 'ROAD', 'ROAM', 'ROAN', 'ROAR', 'ROBE', 'ROBS', 'ROCH', 'ROCK', 'ROCS', 'RODE', 'RODS', 'ROED', 'ROES', 'ROIL', 'ROIN', 'ROJI', 'ROKE', 'ROKS', 'ROKY', 'ROLE', 'ROLF', 'ROLL', 'ROMA', 'ROMP', 'ROMS', 'RONA', 'ROND', 'RONE', 'RONG', 'RONT', 'ROOD', 'ROOF', 'ROOK', 'ROOM', 'ROON', 'ROOP', 'ROOS', 'ROOT', 'ROPE', 'ROPY', 'RORT', 'RORY', 'ROSE', 'ROSH', 'ROSI', 'ROSY', 'ROTA', 'ROTE', 'ROTI', 'ROTL', 'ROTO', 'ROTS', 'ROUE', 'ROUL', 'ROUM', 'ROUP', 'ROUS', 'ROUT', 'ROVE', 'ROWS', 'ROWT', 'ROYA', 'ROYS', 'RUAI', 'RUBA', 'RUBE', 'RUBS', 'RUBY', 'RUCK', 'RUDD', 'RUDE', 'RUDS', 'RUED', 'RUER', 'RUES', 'RUFF', 'RUGA', 'RUGS', 'RUIN', 'RUKH', 'RULE', 'RULY', 'RUMB', 'RUME', 'RUMP', 'RUMS', 'RUND', 'RUNG', 'RUNS', 'RUNT', 'RURP', 'RURU', 'RUSA', 'RUSE', 'RUSH', 'RUSK', 'RUST', 'RUTH', 'RUTS', 'RYAL', 'RYAS', 'RYED', 'RYES', 'RYFE', 'RYKE', 'RYND', 'RYOT', 'RYPE',
    'SABE', 'SABS', 'SACK', 'SACS', 'SADE', 'SADI', 'SADO', 'SADS', 'SAFE', 'SAFT', 'SAGA', 'SAGE', 'SAGO', 'SAGS', 'SAGY', 'SAIC', 'SAID', 'SAIL', 'SAIM', 'SAIN', 'SAIP', 'SAIR', 'SAIS', 'SAKE', 'SAKI', 'SALE', 'SALL', 'SALP', 'SALS', 'SALT', 'SAME', 'SAMP', 'SAMS', 'SAND', 'SANE', 'SANG', 'SANK', 'SANS', 'SANT', 'SAPS', 'SARD', 'SARI', 'SARK', 'SARS', 'SASH', 'SASK', 'SASS', 'SATE', 'SATI', 'SAUL', 'SAUT', 'SAVE', 'SAVS', 'SAWN', 'SAWS', 'SAXN', 'SAXN', 'SAYS', 'SCAB', 'SCAD', 'SCAG', 'SCAM', 'SCAN', 'SCAR', 'SCAT', 'SCAW', 'SCOG', 'SCOP', 'SCOT', 'SCOW', 'SCRU', 'SCUD', 'SCUG', 'SCUL', 'SCUM', 'SCUP', 'SCUR', 'SCUT', 'SCYE', 'SEAL', 'SEAM', 'SEAN', 'SEAR', 'SEAS', 'SEAT', 'SECH', 'SECO', 'SECS', 'SECT', 'SEED', 'SEEK', 'SEEL', 'SEEM', 'SEEN', 'SEEP', 'SEER', 'SEES', 'SEGO', 'SEGS', 'SEIF', 'SEIK', 'SEIL', 'SEIR', 'SEIS', 'SEKT', 'SELD', 'SELE', 'SELF', 'SELL', 'SELS', 'SEME', 'SEMI', 'SENA', 'SEND', 'SENE', 'SENG', 'SENT', 'SEPS', 'SEPT', 'SERA', 'SERE', 'SERF', 'SERI', 'SERK', 'SERR', 'SERS', 'SERY', 'SETA', 'SETE', 'SETH', 'SETS', 'SETT', 'SETY', 'SEVE', 'SEWN', 'SEWS', 'SEXC', 'SEXT', 'SEXY', 'SHAD', 'SHAG', 'SHAH', 'SHAM', 'SHAN', 'SHAT', 'SHAW', 'SHAY', 'SHEA', 'SHED', 'SHEE', 'SHEN', 'SHES', 'SHET', 'SHEW', 'SHIM', 'SHIN', 'SHIP', 'SHIR', 'SHIT', 'SHIV', 'SHMO', 'SHOD', 'SHOE', 'SHOG', 'SHOO', 'SHOP', 'SHOT', 'SHOW', 'SHRI', 'SHUL', 'SHUN', 'SHUT', 'SHWA', 'SIAL', 'SIBB', 'SIBS', 'SICE', 'SICH', 'SICK', 'SIDA', 'SIDE', 'SIDH', 'SIEN', 'SIER', 'SIES', 'SIFT', 'SIGH', 'SIGN', 'SIJO', 'SIKA', 'SIKE', 'SILD', 'SILE', 'SILK', 'SILL', 'SILO', 'SILT', 'SIMA', 'SIMI', 'SIMP', 'SIMS', 'SIND', 'SINE', 'SING', 'SINH', 'SINK', 'SINS', 'SIPE', 'SIPS', 'SIRE', 'SIRI', 'SIRS', 'SIRT', 'SISS', 'SIST', 'SITE', 'SITH', 'SITS', 'SITZ', 'SIZE', 'SIZY', 'SJOE', 'SKAG', 'SKAS', 'SKAT', 'SKAW', 'SKED', 'SKEE', 'SKEG', 'SKEN', 'SKEO', 'SKEP', 'SKER', 'SKET', 'SKEW', 'SKID', 'SKIM', 'SKIN', 'SKIO', 'SKIP', 'SKIS', 'SKIT', 'SKOL', 'SKUA', 'SKUG', 'SKYF', 'SKYR', 'SLAB', 'SLAG', 'SLAM', 'SLAP', 'SLAT', 'SLAW', 'SLAY', 'SLED', 'SLEE', 'SLEW', 'SLEY', 'SLID', 'SLIM', 'SLIP', 'SLIT', 'SLOB', 'SLOE', 'SLOG', 'SLON', 'SLOP', 'SLOT', 'SLOW', 'SLUB', 'SLUE', 'SLUG', 'SLUM', 'SLUR', 'SLUT', 'SMEE', 'SMEW', 'SMIR', 'SMIT', 'SMOG', 'SMUG', 'SMUR', 'SMUT', 'SNAB', 'SNAG', 'SNAP', 'SNAR', 'SNAW', 'SNEB', 'SNED', 'SNEE', 'SNIB', 'SNIG', 'SNIP', 'SNIT', 'SNOB', 'SNOD', 'SNOG', 'SNOT', 'SNOW', 'SNUB', 'SNUG', 'SNYE', 'SOAK', 'SOAP', 'SOAR', 'SOBA', 'SOBS', 'SOCA', 'SOCK', 'SOCS', 'SODA', 'SODS', 'SOFA', 'SOFT', 'SOGS', 'SOHO', 'SOHS', 'SOIL', 'SOJA', 'SOKE', 'SOLA', 'SOLD', 'SOLE', 'SOLI', 'SOLO', 'SOLS', 'SOMA', 'SOME', 'SOMS', 'SOMY', 'SOND', 'SONE', 'SONG', 'SONS', 'SOOK', 'SOOL', 'SOOM', 'SOON', 'SOOP', 'SOOT', 'SOPH', 'SOPS', 'SORA', 'SORB', 'SORD', 'SORE', 'SORI', 'SORN', 'SORS', 'SORT', 'SOSS', 'SOTH', 'SOTS', 'SOUK', 'SOUL', 'SOUM', 'SOUP', 'SOUR', 'SOUS', 'SOUT', 'SOVS', 'SOWD', 'SOWF', 'SOWL', 'SOWM', 'SOWN', 'SOWP', 'SOWS', 'SOWT', 'SOYA', 'SOYS', 'SPAE', 'SPAG', 'SPAM', 'SPAN', 'SPAR', 'SPAS', 'SPAT', 'SPAW', 'SPAY', 'SPEC', 'SPED', 'SPEK', 'SPEL', 'SPET', 'SPEW', 'SPEY', 'SPIC', 'SPIE', 'SPIF', 'SPIK', 'SPIM', 'SPIN', 'SPIT', 'SPIV', 'SPOD', 'SPOT', 'SPOW', 'SPRY', 'SPUD', 'SPUE', 'SPUG', 'SPUN', 'SPUR', 'SRIS', 'STAB', 'STAG', 'STAP', 'STAR', 'STAT', 'STAW', 'STAY', 'STED', 'STEM', 'STEN', 'STEP', 'STET', 'STEW', 'STEY', 'STIE', 'STIM', 'STIR', 'STOA', 'STOB', 'STOP', 'STOT', 'STOU', 'STOW', 'STUB', 'STUD', 'STUM', 'STUN', 'STYE', 'SUBA', 'SUBS', 'SUCH', 'SUCK', 'SUDD', 'SUDS', 'SUED', 'SUER', 'SUES', 'SUET', 'SUEY', 'SUGH', 'SUGS', 'SUIT', 'SUKH', 'SUKS', 'SULD', 'SULK', 'SULL', 'SUMI', 'SUMO', 'SUMP', 'SUMS', 'SUMY', 'SUNG', 'SUNK', 'SUNN', 'SUNS', 'SUPE', 'SUPS', 'SURA', 'SURD', 'SURE', 'SURF', 'SUSS', 'SUSU', 'SWAB', 'SWAD', 'SWAG', 'SWAM', 'SWAN', 'SWAP', 'SWAT', 'SWAY', 'SWEE', 'SWIG', 'SWIM', 'SWIZ', 'SWOP', 'SWOT', 'SWUM', 'SYBO', 'SYCE', 'SYED', 'SYEN', 'SYKE', 'SYLI', 'SYND', 'SYNE', 'SYPH',
    'TAAL', 'TABI', 'TABS', 'TABU', 'TACE', 'TACH', 'TACK', 'TACO', 'TACT', 'TADS', 'TAED', 'TAEL', 'TAES', 'TAGS', 'TAHA', 'TAHR', 'TAIL', 'TAIN', 'TAIS', 'TAIT', 'TAKA', 'TAKE', 'TAKI', 'TAKS', 'TAKU', 'TALA', 'TALC', 'TALE', 'TALI', 'TALK', 'TALL', 'TAME', 'TAMP', 'TAMS', 'TANA', 'TANE', 'TANG', 'TANH', 'TANK', 'TANS', 'TAOS', 'TAPA', 'TAPE', 'TAPS', 'TAPU', 'TARA', 'TARE', 'TARN', 'TARO', 'TARP', 'TARS', 'TART', 'TASK', 'TASS', 'TATE', 'TATH', 'TATS', 'TATT', 'TATU', 'TAUR', 'TAUS', 'TAUT', 'TAVA', 'TAVS', 'TAWA', 'TAWS', 'TAWT', 'TAXA', 'TAXI', 'TAYS', 'TEAD', 'TEAK', 'TEAL', 'TEAM', 'TEAR', 'TEAS', 'TEAT', 'TECH', 'TECS', 'TEDS', 'TEDY', 'TEED', 'TEEL', 'TEEM', 'TEEN', 'TEER', 'TEES', 'TEET', 'TEFF', 'TEGG', 'TEGS', 'TEGU', 'TEHR', 'TEIL', 'TELA', 'TELE', 'TELL', 'TELS', 'TELT', 'TEMP', 'TEND', 'TENE', 'TENS', 'TENT', 'TEPA', 'TERF', 'TERM', 'TERN', 'TEST', 'TETE', 'TETH', 'TETS', 'TEWS', 'TEXT', 'THAE', 'THAN', 'THAR', 'THAT', 'THAW', 'THEE', 'THEM', 'THEN', 'THEW', 'THEY', 'THIG', 'THIN', 'THIO', 'THIR', 'THIS', 'THON', 'THOU', 'THRO', 'THRU', 'THUD', 'THUG', 'THUS', 'TIAR', 'TICE', 'TICH', 'TICK', 'TICS', 'TIDE', 'TIDY', 'TIED', 'TIER', 'TIES', 'TIFF', 'TIFT', 'TIGE', 'TIGS', 'TIKA', 'TIKE', 'TIKI', 'TIKS', 'TILE', 'TILL', 'TILS', 'TILT', 'TIME', 'TINA', 'TIND', 'TINE', 'TING', 'TINK', 'TINS', 'TINT', 'TINY', 'TIPI', 'TIPO', 'TIPS', 'TIPT', 'TIRE', 'TIRL', 'TIRO', 'TIRR', 'TITI', 'TITS', 'TIVY', 'TIZZ', 'TOAD', 'TOBY', 'TOCK', 'TOCO', 'TOCS', 'TODS', 'TODY', 'TOEA', 'TOED', 'TOES', 'TOEY', 'TOFF', 'TOFT', 'TOFU', 'TOGA', 'TOGE', 'TOGS', 'TOHO', 'TOIL', 'TOIT', 'TOKE', 'TOKO', 'TOLA', 'TOLD', 'TOLE', 'TOLL', 'TOLT', 'TOLU', 'TOMB', 'TOME', 'TOMO', 'TOMS', 'TONE', 'TONG', 'TONK', 'TONS', 'TONY', 'TOOK', 'TOOL', 'TOOM', 'TOON', 'TOOT', 'TOPE', 'TOPH', 'TOPI', 'TOPO', 'TOPS', 'TORA', 'TORC', 'TORE', 'TORI', 'TORK', 'TORN', 'TORO', 'TORR', 'TORS', 'TORT', 'TORY', 'TOSH', 'TOSS', 'TOST', 'TOTE', 'TOTS', 'TOUK', 'TOUN', 'TOUR', 'TOUT', 'TOWS', 'TOWT', 'TOWY', 'TOYO', 'TOYS', 'TOZE', 'TRAD', 'TRAM', 'TRAP', 'TRAT', 'TRAY', 'TREE', 'TREF', 'TREK', 'TREM', 'TRES', 'TRET', 'TREW', 'TREY', 'TREZ', 'TRIE', 'TRIG', 'TRIM', 'TRIN', 'TRIO', 'TRIP', 'TROD', 'TROG', 'TRON', 'TROP', 'TROT', 'TROW', 'TROY', 'TRUE', 'TRUG', 'TRYP', 'TSAR', 'TSKS', 'TUAN', 'TUBA', 'TUBE', 'TUBS', 'TUCK', 'TUFA', 'TUFF', 'TUFT', 'TUGS', 'TUIS', 'TULE', 'TUMP', 'TUNA', 'TUND', 'TUNE', 'TUNG', 'TUNS', 'TUPS', 'TURD', 'TURF', 'TURK', 'TURN', 'TURR', 'TUSH', 'TUSK', 'TUTU', 'TUTS', 'TWAE', 'TWAL', 'TWAS', 'TWAT', 'TWAY', 'TWEE', 'TWIG', 'TWIN', 'TWIT', 'TWOS', 'TYDE', 'TYED', 'TYEE', 'TYER', 'TYES', 'TYKE', 'TYMP', 'TYND', 'TYNE', 'TYPE', 'TYPO', 'TYPP', 'TYPS', 'TYRE', 'TYRO', 'TZAR',
    'UDAL', 'UDON', 'UDOS', 'UGHS', 'UGLY', 'UKES', 'ULAN', 'ULES', 'ULEX', 'ULNA', 'ULUS', 'ULVA', 'UMBO', 'UMPH', 'UMPS', 'UMPY', 'UNAI', 'UNAU', 'UNBE', 'UNCE', 'UNCI', 'UNCO', 'UNDE', 'UNDO', 'UNDY', 'UNIS', 'UNIT', 'UNTO', 'UPAS', 'UPBY', 'UPDO', 'UPON', 'UPSY', 'UPTO', 'URAN', 'URBS', 'URDE', 'URDS', 'URDY', 'UREA', 'URES', 'URGE', 'URIC', 'URNS', 'URPS', 'URSA', 'URUS', 'URVA', 'USED', 'USER', 'USES', 'UTAS', 'UTES', 'UTIS', 'UTRA',
    'VAAL', 'VACS', 'VADE', 'VAES', 'VAGI', 'VAGS', 'VAIL', 'VAIN', 'VAIR', 'VALE', 'VALI', 'VAMP', 'VANE', 'VANG', 'VANS', 'VANT', 'VARA', 'VARE', 'VARS', 'VARY', 'VASA', 'VASE', 'VAST', 'VATS', 'VATU', 'VAUS', 'VAUT', 'VAVS', 'VAWS', 'VEAL', 'VEEP', 'VEER', 'VEES', 'VEGA', 'VEGO', 'VEHM', 'VEIL', 'VEIN', 'VELA', 'VELD', 'VELE', 'VELL', 'VENA', 'VEND', 'VENT', 'VERA', 'VERB', 'VERD', 'VERS', 'VERT', 'VERY', 'VEST', 'VETO', 'VETS', 'VEXT', 'VIAL', 'VIAS', 'VIBE', 'VIBS', 'VICE', 'VIDE', 'VIDS', 'VIED', 'VIER', 'VIES', 'VIEW', 'VIGA', 'VIGS', 'VILD', 'VILE', 'VILL', 'VIMS', 'VINA', 'VINE', 'VINO', 'VINS', 'VINT', 'VINY', 'VIOL', 'VIRE', 'VIRL', 'VISA', 'VISE', 'VITA', 'VITE', 'VIVA', 'VIVE', 'VIZS', 'VOAR', 'VOES', 'VOGS', 'VOID', 'VOIP', 'VOLA', 'VOLE', 'VOLK', 'VOLS', 'VOLT', 'VORS', 'VOTE', 'VOWS', 'VRIL', 'VROT', 'VROU', 'VROW', 'VUGG', 'VUGH', 'VUGS', 'VULN',
    'WAAC', 'WABS', 'WACK', 'WADE', 'WADI', 'WADS', 'WADY', 'WAES', 'WAFF', 'WAFT', 'WAGE', 'WAGS', 'WAIF', 'WAIL', 'WAIN', 'WAIR', 'WAIS', 'WAIT', 'WAKA', 'WAKE', 'WAKF', 'WAKS', 'WALE', 'WALI', 'WALK', 'WALL', 'WALY', 'WAME', 'WAND', 'WANE', 'WANG', 'WANK', 'WANS', 'WANT', 'WANY', 'WAPS', 'WAQA', 'WARD', 'WARE', 'WARK', 'WARM', 'WARN', 'WARP', 'WARS', 'WART', 'WARY', 'WASH', 'WASP', 'WAST', 'WATE', 'WATS', 'WATT', 'WAUK', 'WAUL', 'WAUR', 'WAVE', 'WAVY', 'WAWE', 'WAWL', 'WAWS', 'WAXY', 'WAYS', 'WEAK', 'WEAL', 'WEAN', 'WEAR', 'WEBS', 'WEDS', 'WEED', 'WEEK', 'WEEL', 'WEEN', 'WEEP', 'WEER', 'WEES', 'WEET', 'WEFT', 'WEID', 'WEIL', 'WEIR', 'WEKA', 'WELD', 'WELK', 'WELL', 'WELT', 'WEMB', 'WEMS', 'WEND', 'WENE', 'WENS', 'WENT', 'WEPT', 'WERE', 'WERF', 'WERO', 'WERT', 'WEST', 'WETA', 'WETS', 'WEXE', 'WHAE', 'WHAM', 'WHAP', 'WHAT', 'WHEE', 'WHEN', 'WHET', 'WHEW', 'WHEY', 'WHID', 'WHIG', 'WHIM', 'WHIN', 'WHIO', 'WHIP', 'WHIR', 'WHIT', 'WHIZ', 'WHOA', 'WHOM', 'WHOP', 'WHOT', 'WHOW', 'WHUP', 'WHYS', 'WICE', 'WICH', 'WICK', 'WIDE', 'WIEL', 'WIFE', 'WIFI', 'WIGS', 'WILD', 'WILE', 'WILK', 'WILL', 'WILT', 'WILY', 'WIMP', 'WIND', 'WINE', 'WING', 'WINK', 'WINN', 'WINO', 'WINS', 'WINY', 'WIPE', 'WIRE', 'WIRY', 'WISE', 'WISH', 'WISP', 'WISS', 'WIST', 'WITE', 'WITH', 'WITS', 'WIVE', 'WOAD', 'WOAH', 'WOES', 'WOGS', 'WOKE', 'WOKS', 'WOLD', 'WOLF', 'WOMB', 'WONK', 'WONS', 'WONT', 'WOOD', 'WOOF', 'WOOL', 'WOON', 'WOOS', 'WOOT', 'WOPS', 'WORD', 'WORE', 'WORK', 'WORM', 'WORN', 'WORT', 'WOST', 'WOTS', 'WOVE', 'WOWS', 'WRAN', 'WRAP', 'WREN', 'WRIG', 'WRIT', 'WROK', 'WROT', 'WRYE', 'WUDU', 'WULL', 'WURP', 'WURT', 'WUSH', 'WUZU', 'WYCH', 'WYES', 'WYLE', 'WYND', 'WYNE', 'WYNN', 'WYNS', 'WYTE',
    'XRAY', 'XYST',
    'YABA', 'YACK', 'YADS', 'YAFF', 'YAGI', 'YAGS', 'YAHS', 'YAKS', 'YALD', 'YALE', 'YAMS', 'YANG', 'YANK', 'YAPA', 'YAPS', 'YARD', 'YARE', 'YARK', 'YARN', 'YARR', 'YATE', 'YAUD', 'YAUP', 'YAWL', 'YAWN', 'YAWP', 'YAWS', 'YAWY', 'YAYS', 'YEAD', 'YEAH', 'YEAN', 'YEAR', 'YEAS', 'YEBO', 'YEDE', 'YEED', 'YEGG', 'YELD', 'YELK', 'YELL', 'YELP', 'YELT', 'YENS', 'YEOW', 'YERD', 'YERK', 'YESP', 'YEST', 'YETS', 'YEUK', 'YEUX', 'YEWS', 'YGOE', 'YIEL', 'YIKE', 'YILL', 'YINS', 'YIPE', 'YIPS', 'YIRD', 'YIRK', 'YIRR', 'YITE', 'YLEM', 'YLKE', 'YMPE', 'YMPT', 'YOBB', 'YOBS', 'YOCK', 'YODE', 'YODH', 'YODS', 'YOGA', 'YOGH', 'YOGI', 'YOKE', 'YOKS', 'YOLD', 'YOLK', 'YOMP', 'YOND', 'YONT', 'YOOF', 'YOOP', 'YORE', 'YORK', 'YORP', 'YOUK', 'YOUR', 'YOUS', 'YOWE', 'YOWL', 'YOWS', 'YUAN', 'YUCA', 'YUCH', 'YUCK', 'YUFT', 'YUGS', 'YUKE', 'YUKO', 'YUKS', 'YUKY', 'YULE', 'YUMP', 'YUNX', 'YUPS', 'YURT', 'YUTZ', 'YUZU', 'YWIS',
    'ZACK', 'ZAGS', 'ZANY', 'ZAPS', 'ZARF', 'ZARI', 'ZATI', 'ZEAL', 'ZEBU', 'ZEDS', 'ZEES', 'ZEIN', 'ZEKS', 'ZELS', 'ZEPS', 'ZERO', 'ZEST', 'ZETA', 'ZEZE', 'ZHOM', 'ZILA', 'ZILL', 'ZIMB', 'ZINC', 'ZINE', 'ZING', 'ZINK', 'ZINS', 'ZIPS', 'ZIRK', 'ZITI', 'ZITS', 'ZIZI', 'ZLOTE', 'ZOAR', 'ZOBO', 'ZOBU', 'ZOEA', 'ZOIC', 'ZOLS', 'ZONA', 'ZONE', 'ZONK', 'ZOOM', 'ZOON', 'ZOOS', 'ZOOT', 'ZOPP', 'ZORB', 'ZORI', 'ZOUK', 'ZULU', 'ZUPA', 'ZURF', 'ZYGA', 'ZYME'
  ];

  private wordSet: Set<string>;
  private coreWordSet: Set<string>;

  constructor() {
    this.coreWordSet = new Set(this.coreWords);
    // Combine core words and extended dictionary into the full validation set
    this.wordSet = new Set([...this.coreWords, ...this.extendedWords]);
  }

  public getRandomWord(): string {
    const idx = Math.floor(Math.random() * this.coreWords.length);
    return this.coreWords[idx];
  }

  public scramble(word: string): string[] {
    const letters = word.split('');
    // Fisher-Yates shuffle ensuring letters don't match original exactly
    for (let attempts = 0; attempts < 10; attempts++) {
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      if (letters.join('') !== word) {
        return letters;
      }
    }
    return letters;
  }

  /**
   * Accepts ANY valid 4-letter English word in our comprehensive dictionary!
   */
  public isValidWord(attempt: string): boolean {
    if (!attempt || attempt.length !== 4) return false;
    return this.wordSet.has(attempt.toUpperCase());
  }

  public findAllValidAnagrams(scrambledLetters: string[]): string[] {
    const targetSorted = [...scrambledLetters].sort().join('').toUpperCase();
    const matches: string[] = [];
    
    // Check against full dictionary
    for (const w of this.wordSet) {
      if (w.length === scrambledLetters.length) {
        const wSorted = w.split('').sort().join('').toUpperCase();
        if (wSorted === targetSorted) {
          matches.push(w);
        }
      }
    }
    // Return unique sorted anagrams, prioritizing core words first
    return Array.from(new Set(matches)).sort((a, b) => {
      const aCore = this.coreWordSet.has(a) ? 0 : 1;
      const bCore = this.coreWordSet.has(b) ? 0 : 1;
      if (aCore !== bCore) return aCore - bCore;
      return a.localeCompare(b);
    });
  }

  /**
   * Finds all valid matching 4-letter words from the entire dictionary
   * that fit the fixed letter pattern (e.g. ['B', null, null, 'T'] -> BOAT, BEAT, BOOT, BEST, BAIT, etc.)
   */
  public findMatchingWordsForPattern(pattern: (string | null)[]): string[] {
    const matches: string[] = [];
    
    for (const word of this.wordSet) {
      if (word.length !== pattern.length) continue;
      let isMatch = true;
      for (let i = 0; i < pattern.length; i++) {
        const required = pattern[i];
        if (required !== null && required !== undefined && word[i] !== required.toUpperCase()) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        matches.push(word);
      }
    }

    // Sort matches to prioritize common core words, then alphabetical
    return matches.sort((a, b) => {
      const aCore = this.coreWordSet.has(a) ? 0 : 1;
      const bCore = this.coreWordSet.has(b) ? 0 : 1;
      if (aCore !== bCore) return aCore - bCore;
      return a.localeCompare(b);
    });
  }

  public generateLetterFallChallenge(_difficulty: 'gentle' | 'normal' | 'turbo' = 'normal'): {
    targetWord: string;
    fixedIndices: number[];
    fixedLetters: (string | null)[];
    allValidAnswers: string[];
  } {
    // Leave exactly 1 letter missing (3 letters fixed / provided)
    const numFixed = 3;

    // Try picking a core word that produces rich valid answer possibilities
    for (let attempts = 0; attempts < 40; attempts++) {
      const targetWord = this.getRandomWord();
      const indices = [0, 1, 2, 3];
      
      // Pick random 3 fixed positions (leaving 1 missing position)
      const missingIndex = Math.floor(Math.random() * 4);
      const chosenIndices = indices.filter(idx => idx !== missingIndex);
      const fixedLetters: (string | null)[] = [null, null, null, null];
      for (const idx of chosenIndices) {
        fixedLetters[idx] = targetWord[idx];
      }

      const matches = this.findMatchingWordsForPattern(fixedLetters);
      // Ensure at least 1 valid answer exists (often multiple alternate answers!)
      if (matches.length >= 1) {
        return {
          targetWord,
          fixedIndices: chosenIndices,
          fixedLetters,
          allValidAnswers: matches,
        };
      }
    }

    // Fallback: 3 letters fixed, 1 missing
    const fallbackWord = this.getRandomWord();
    const fallbackPattern: (string | null)[] = [fallbackWord[0], fallbackWord[1], fallbackWord[2], null];
    return {
      targetWord: fallbackWord,
      fixedIndices: [0, 1, 2],
      fixedLetters: fallbackPattern,
      allValidAnswers: this.findMatchingWordsForPattern(fallbackPattern),
    };
  }

  public generateDiagonalChallenge(): DiagonalChallenge {
    // Pick a 4-letter word where each diagonal slot has multiple valid words (excluding the target word itself)
    for (let attempts = 0; attempts < 60; attempts++) {
      const targetWord = this.getRandomWord();
      const rowPatterns: (string | null)[][] = [
        [targetWord[0], null, null, null],
        [null, targetWord[1], null, null],
        [null, null, targetWord[2], null],
        [null, null, null, targetWord[3]],
      ];

      const counts = rowPatterns.map(p => 
        this.findMatchingWordsForPattern(p).filter(w => w.toUpperCase() !== targetWord.toUpperCase()).length
      );
      // Ensure each row has at least 8 valid non-target options
      if (counts.every(c => c >= 8)) {
        return {
          targetWord,
          rowPatterns,
          possibleWordCounts: counts,
        };
      }
    }

    // Default fallback (e.g. BIRD)
    const fallbackWord = 'BIRD';
    const fallbackPatterns: (string | null)[][] = [
      ['B', null, null, null],
      [null, 'I', null, null],
      [null, null, 'R', null],
      [null, null, null, 'D'],
    ];
    return {
      targetWord: fallbackWord,
      rowPatterns: fallbackPatterns,
      possibleWordCounts: fallbackPatterns.map(p => 
        this.findMatchingWordsForPattern(p).filter(w => w.toUpperCase() !== fallbackWord.toUpperCase()).length
      ),
    };
  }

  public getValidWordsForDiagonalRow(targetWord: string, rowIndex: number): string[] {
    const pattern: (string | null)[] = [null, null, null, null];
    pattern[rowIndex] = targetWord[rowIndex];
    return this.findMatchingWordsForPattern(pattern).filter(
      w => w.toUpperCase() !== targetWord.toUpperCase()
    );
  }

  // ==========================================
  // WORD SHIFTER (WORD LADDER) GRAPH METHODS
  // ==========================================

  /**
   * Returns true if two words are of length 4 and differ by EXACTLY 1 letter.
   */
  public isOneLetterDiff(w1: string, w2: string): boolean {
    if (!w1 || !w2 || w1.length !== 4 || w2.length !== 4) return false;
    const a = w1.toUpperCase();
    const b = w2.toUpperCase();
    if (a === b) return false;
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      if (a[i] !== b[i]) {
        diff++;
        if (diff > 1) return false;
      }
    }
    return diff === 1;
  }

  /**
   * Returns the single character index (0..3) that differs between two 1-letter-different words.
   * Returns -1 if they don't differ by exactly 1 character.
   */
  public getDiffIndex(w1: string, w2: string): number {
    if (!this.isOneLetterDiff(w1, w2)) return -1;
    for (let i = 0; i < 4; i++) {
      if (w1[i].toUpperCase() !== w2[i].toUpperCase()) return i;
    }
    return -1;
  }

  /**
   * Fast 1-letter substitution generator that yields all valid dictionary words
   * reachable by changing a single letter of the input word.
   */
  public getOneLetterNeighbors(word: string): string[] {
    if (!word || word.length !== 4) return [];
    const upper = word.toUpperCase();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const neighbors: string[] = [];

    for (let i = 0; i < 4; i++) {
      const origChar = upper[i];
      for (let j = 0; j < alphabet.length; j++) {
        const char = alphabet[j];
        if (char === origChar) continue;
        const candidate = upper.slice(0, i) + char + upper.slice(i + 1);
        if (this.wordSet.has(candidate)) {
          neighbors.push(candidate);
        }
      }
    }

    // Sort to prioritize core recognizable words first
    return neighbors.sort((a, b) => {
      const aCore = this.coreWordSet.has(a) ? 0 : 1;
      const bCore = this.coreWordSet.has(b) ? 0 : 1;
      if (aCore !== bCore) return aCore - bCore;
      return a.localeCompare(b);
    });
  }

  /**
   * Finds the shortest transformation ladder between startWord and targetWord using BFS.
   * Returns array of words from start to target (e.g. ['COLD', 'CORD', 'CARD', 'WARD', 'WARM']),
   * or null if no valid path exists.
   */
  public findShortestLadder(startWord: string, targetWord: string): string[] | null {
    const start = startWord.toUpperCase();
    const target = targetWord.toUpperCase();
    if (start === target) return [start];
    if (!this.wordSet.has(start) || !this.wordSet.has(target)) return null;

    // Fast direct connection check
    if (this.isOneLetterDiff(start, target)) {
      return [start, target];
    }

    const queue: string[] = [start];
    const visited = new Set<string>([start]);
    const parentMap = new Map<string, string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.getOneLetterNeighbors(current);

      for (const next of neighbors) {
        if (next === target) {
          // Reconstruct path
          const path: string[] = [target];
          let curr = current;
          while (curr) {
            path.unshift(curr);
            curr = parentMap.get(curr)!;
          }
          return path;
        }

        if (!visited.has(next)) {
          visited.add(next);
          parentMap.set(next, current);
          queue.push(next);
        }
      }
    }

    return null;
  }

  /**
   * Returns the next recommended word on the optimal shortest path to the target.
   */
  public getNextOptimalWord(currentWord: string, targetWord: string): string | null {
    const path = this.findShortestLadder(currentWord, targetWord);
    if (path && path.length > 1) {
      return path[1];
    }
    return null;
  }

  /**
   * Curated pairs designed for fun, recognizable, rewarding gameplay
   */
  private curatedChallenges: { start: string; target: string; category?: string }[] = [
    // 2-3 step ladders
    { start: 'COLD', target: 'BOLD', category: 'Warm Up' },
    { start: 'SHIP', target: 'SHOT', category: 'Ocean' },
    { start: 'DARK', target: 'DIRT', category: 'Earth' },
    { start: 'BIRD', target: 'BEND', category: 'Nature' },
    { start: 'PLAY', target: 'CLAP', category: 'Action' },
    { start: 'STAR', target: 'SWAY', category: 'Sky' },
    { start: 'FIRE', target: 'HARE', category: 'Elements' },
    { start: 'CAMP', target: 'LIMP', category: 'Outdoors' },
    { start: 'GOLD', target: 'HEAD', category: 'Treasure' },
    { start: 'MOON', target: 'SOON', category: 'Cosmos' },
    { start: 'TREE', target: 'FREE', category: 'Flora' },
    { start: 'WIND', target: 'MIND', category: 'Mindset' },
    { start: 'ROSE', target: 'HOSE', category: 'Garden' },
    { start: 'BLUE', target: 'GLUE', category: 'Craft' },
    { start: 'BOOK', target: 'LOOK', category: 'Study' },
    { start: 'RAIN', target: 'PAIN', category: 'Weather' },
    { start: 'FAST', target: 'PAST', category: 'Speed' },
    { start: 'GAME', target: 'FAME', category: 'Glory' },
    { start: 'LION', target: 'LIMP', category: 'Safari' },
    { start: 'PARK', target: 'PALE', category: 'City' },

    // 3-4 step ladders
    { start: 'COLD', target: 'WARM', category: 'Temperature' },
    { start: 'HEAD', target: 'TAIL', category: 'Coin Flip' },
    { start: 'LEAD', target: 'GOLD', category: 'Alchemy' },
    { start: 'FISH', target: 'BIRD', category: 'Creatures' },
    { start: 'DARK', target: 'MOON', category: 'Night Sky' },
    { start: 'FOUR', target: 'FIVE', category: 'Numbers' },
    { start: 'WALK', target: 'RUNS', category: 'Athletics' },
    { start: 'LOVE', target: 'HATE', category: 'Emotions' },
    { start: 'FIRE', target: 'COLD', category: 'Opposites' },
    { start: 'WIND', target: 'RAIN', category: 'Storm' },
    { start: 'SHIP', target: 'BOAT', category: 'Nautical' },
    { start: 'WORK', target: 'REST', category: 'Daily Life' },
    { start: 'CAKE', target: 'BAKE', category: 'Kitchen' },
    { start: 'NOTE', target: 'BOOK', category: 'Library' },
    { start: 'BLUE', target: 'PINK', category: 'Colors' },
    { start: 'CAMP', target: 'TENT', category: 'Adventure' },
    { start: 'BEAR', target: 'LION', category: 'Wildlife' },
    { start: 'SAND', target: 'WAVE', category: 'Beach' },
    { start: 'TIME', target: 'FAST', category: 'Clock' },
    { start: 'DOOR', target: 'LOCK', category: 'Security' },
    { start: 'SONG', target: 'SING', category: 'Melody' },
    { start: 'WAVE', target: 'SURF', category: 'Ocean' },
    { start: 'CITY', target: 'TOWN', category: 'Urban' },
    { start: 'EYES', target: 'NOSE', category: 'Face' },

    // 4-6 step ladders
    { start: 'SLEEP', target: 'DREAM', category: 'Nighttime' },
    { start: 'RIVER', target: 'OCEAN', category: 'Waterways' },
    { start: 'STONE', target: 'WATER', category: 'Nature' },
    { start: 'WHEAT', target: 'BREAD', category: 'Harvest' },
    { start: 'CROWN', target: 'QUEEN', category: 'Royalty' },
    { start: 'LIGHT', target: 'NIGHT', category: 'Duality' },
    { start: 'BLACK', target: 'WHITE', category: 'Contrast' },
  ];

  public generateShifterChallenge(difficulty: ShifterDifficulty = 'normal'): ShifterChallenge {
    const minSteps = difficulty === 'casual' ? 2 : difficulty === 'normal' ? 3 : 4;
    const maxSteps = difficulty === 'casual' ? 3 : difficulty === 'normal' ? 4 : 6;

    // Filter curated 4-letter candidates
    const validCurated = this.curatedChallenges.filter(c => {
      if (c.start.length !== 4 || c.target.length !== 4) return false;
      const ladder = this.findShortestLadder(c.start, c.target);
      if (!ladder) return false;
      const steps = ladder.length - 1;
      return steps >= minSteps && steps <= maxSteps;
    });

    // Shuffle curated candidates
    if (validCurated.length > 0 && Math.random() < 0.8) {
      const chosen = validCurated[Math.floor(Math.random() * validCurated.length)];
      const ladder = this.findShortestLadder(chosen.start, chosen.target)!;
      return {
        startWord: chosen.start,
        targetWord: chosen.target,
        minSteps: ladder.length - 1,
        optimalPath: ladder,
        category: chosen.category,
      };
    }

    // Dynamic algorithmic generator: pick 2 core words and test BFS distance
    for (let attempt = 0; attempt < 80; attempt++) {
      const w1 = this.getRandomWord();
      const w2 = this.getRandomWord();
      if (w1 === w2) continue;

      const ladder = this.findShortestLadder(w1, w2);
      if (ladder) {
        const steps = ladder.length - 1;
        if (steps >= minSteps && steps <= maxSteps) {
          return {
            startWord: w1,
            targetWord: w2,
            minSteps: steps,
            optimalPath: ladder,
            category: 'Word Shift',
          };
        }
      }
    }

    // Fallback safe challenges
    if (difficulty === 'casual') {
      const ladder = ['COLD', 'BOLD', 'BOLT'];
      return {
        startWord: 'COLD',
        targetWord: 'BOLT',
        minSteps: 2,
        optimalPath: ladder,
        category: 'Quick Shift',
      };
    } else if (difficulty === 'master') {
      const ladder = ['HEAD', 'HEAL', 'TEAL', 'TELL', 'TALL', 'TAIL'];
      return {
        startWord: 'HEAD',
        targetWord: 'TAIL',
        minSteps: 5,
        optimalPath: ladder,
        category: 'Master Shift',
      };
    } else {
      const ladder = ['COLD', 'CORD', 'CARD', 'WARD', 'WARM'];
      return {
        startWord: 'COLD',
        targetWord: 'WARM',
        minSteps: 4,
        optimalPath: ladder,
        category: 'Classic Shift',
      };
    }
  }
}

export const dictionaryService = new DictionaryService();



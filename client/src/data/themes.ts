import { Theme } from "@/contexts/ThemeContext";

// Helper function to create team theme with watermark logo
const createTeamTheme = (
  id: string,
  name: string,
  category: "nfl" | "mlb" | "nba" | "nhl" | "mls" | "wsl" | "epl" | "laliga" | "bundesliga" | "seriea" | "ligue1" | "college" | "golf",
  logoUrl: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string
): Theme => ({
  id,
  name,
  category,
  watermark: logoUrl,
  colors: {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: primaryColor.includes("black") ? "bg-black" : primaryColor.includes("white") || primaryColor.includes("slate-100") ? "bg-slate-50" : "bg-slate-950",
    cardBg: primaryColor.includes("black") ? "bg-zinc-950" : primaryColor.includes("white") ? "bg-white" : "bg-slate-900",
    textPrimary: primaryColor.includes("white") || primaryColor.includes("slate-100") ? "text-slate-900" : "text-white",
    textSecondary: primaryColor.includes("white") || primaryColor.includes("slate-100") ? "text-slate-600" : "text-slate-300"
  }
});

export const allThemes: Theme[] = [
  // ============ SOLID COLORS ============
  {
    id: "light",
    name: "☀️ Light Mode",
    category: "classic",
    colors: {
      primary: "from-slate-100 via-slate-50 to-white",
      secondary: "from-blue-500 to-purple-500",
      accent: "bg-blue-500",
      background: "bg-slate-50",
      cardBg: "bg-white",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600"
    }
  },
  {
    id: "pure-black",
    name: "⚫ Pure Black",
    category: "classic",
    colors: {
      primary: "from-black via-zinc-950 to-black",
      secondary: "from-blue-600 to-purple-600",
      accent: "bg-blue-600",
      background: "bg-black",
      cardBg: "bg-zinc-950",
      textPrimary: "text-white",
      textSecondary: "text-zinc-300"
    }
  },
  {
    id: "classic-dark",
    name: "🌙 Classic Dark",
    category: "classic",
    colors: {
      primary: "from-slate-900 via-slate-800 to-slate-900",
      secondary: "from-blue-600 to-purple-600",
      accent: "bg-blue-600",
      background: "bg-slate-900",
      cardBg: "bg-slate-800",
      textPrimary: "text-white",
      textSecondary: "text-slate-300"
    }
  },

  // ============ NFL TEAMS (ALL 32) ============
  // AFC East
  createTeamTheme("bills", "Buffalo Bills", "nfl", "https://content.sportslogos.net/logos/7/149/full/n0fd1z6xmhigb0eej3323ebwq.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("dolphins", "Miami Dolphins", "nfl", "https://content.sportslogos.net/logos/7/150/full/4105_miami_dolphins-primary-2018.png", "from-teal-900 via-orange-700 to-teal-900", "from-teal-500 to-orange-500", "bg-teal-600"),
  createTeamTheme("patriots", "New England Patriots", "nfl", "https://content.sportslogos.net/logos/7/151/full/y71myf8mlwlk8lbgagh3fd5e0.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("jets", "New York Jets", "nfl", "https://content.sportslogos.net/logos/7/152/full/9116_new_york_jets-primary-2019.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  // AFC North
  createTeamTheme("ravens", "Baltimore Ravens", "nfl", "https://content.sportslogos.net/logos/7/153/full/318.png", "from-purple-900 via-black to-purple-900", "from-purple-600 to-black", "bg-purple-700"),
  createTeamTheme("bengals", "Cincinnati Bengals", "nfl", "https://content.sportslogos.net/logos/7/154/full/403.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  createTeamTheme("browns", "Cleveland Browns", "nfl", "https://content.sportslogos.net/logos/7/155/full/2645_cleveland_browns-primary-2015.png", "from-orange-900 via-amber-800 to-orange-900", "from-orange-600 to-amber-600", "bg-orange-700"),
  createTeamTheme("steelers", "Pittsburgh Steelers", "nfl", "https://content.sportslogos.net/logos/7/156/full/970.png", "from-black via-yellow-800 to-black", "from-yellow-500 to-black", "bg-yellow-500"),
  // AFC South
  createTeamTheme("texans", "Houston Texans", "nfl", "https://content.sportslogos.net/logos/7/157/full/593.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-700 to-red-600", "bg-blue-800"),
  createTeamTheme("colts", "Indianapolis Colts", "nfl", "https://content.sportslogos.net/logos/7/158/full/593.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("jaguars", "Jacksonville Jaguars", "nfl", "https://content.sportslogos.net/logos/7/159/full/8856_jacksonville_jaguars-alternate-2013.png", "from-teal-900 via-yellow-700 to-teal-900", "from-teal-600 to-yellow-500", "bg-teal-700"),
  createTeamTheme("titans", "Tennessee Titans", "nfl", "https://content.sportslogos.net/logos/7/160/full/1053.png", "from-blue-900 via-blue-800 to-blue-900", "from-blue-500 to-red-500", "bg-blue-600"),
  // AFC West
  createTeamTheme("broncos", "Denver Broncos", "nfl", "https://content.sportslogos.net/logos/7/161/full/9ebzja2zfeigaziee8y605aqp.png", "from-orange-900 via-blue-800 to-orange-900", "from-orange-600 to-blue-600", "bg-orange-600"),
  createTeamTheme("chiefs", "Kansas City Chiefs", "nfl", "https://content.sportslogos.net/logos/7/162/full/857.png", "from-red-900 via-red-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("raiders", "Las Vegas Raiders", "nfl", "https://content.sportslogos.net/logos/7/163/full/g9mgk6x3ge26t44cccm9oq1vl.png", "from-black via-slate-800 to-black", "from-slate-600 to-black", "bg-slate-700"),
  createTeamTheme("chargers", "Los Angeles Chargers", "nfl", "https://content.sportslogos.net/logos/7/6446/full/1660_los_angeles__chargers-primary-20201.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-600"),
  // NFC East
  createTeamTheme("cowboys", "Dallas Cowboys", "nfl", "https://content.sportslogos.net/logos/7/165/full/406.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-600"),
  createTeamTheme("giants", "New York Giants", "nfl", "https://content.sportslogos.net/logos/7/166/full/919.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("eagles", "Philadelphia Eagles", "nfl", "https://content.sportslogos.net/logos/7/167/full/960.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-slate-600", "bg-green-700"),
  createTeamTheme("commanders", "Washington Commanders", "nfl", "https://content.sportslogos.net/logos/7/6832/full/washington_commanders_logo_primary_20226702.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  // NFC North
  createTeamTheme("bears", "Chicago Bears", "nfl", "https://content.sportslogos.net/logos/7/169/full/364.png", "from-blue-900 via-orange-800 to-blue-900", "from-blue-700 to-orange-600", "bg-blue-800"),
  createTeamTheme("lions", "Detroit Lions", "nfl", "https://content.sportslogos.net/logos/7/170/full/cwuyv0w15ruuk34j9qnfuodf9.png", "from-blue-900 via-slate-700 to-blue-900", "from-blue-600 to-slate-500", "bg-blue-700"),
  createTeamTheme("packers", "Green Bay Packers", "nfl", "https://content.sportslogos.net/logos/7/171/full/dcy03myfhffbki5d7il3.png", "from-green-900 via-yellow-800 to-green-900", "from-green-600 to-yellow-500", "bg-green-600"),
  createTeamTheme("vikings", "Minnesota Vikings", "nfl", "https://content.sportslogos.net/logos/7/172/full/2704_minnesota_vikings-primary-2013.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-700"),
  // NFC South
  createTeamTheme("falcons", "Atlanta Falcons", "nfl", "https://content.sportslogos.net/logos/7/173/full/299.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("panthers", "Carolina Panthers", "nfl", "https://content.sportslogos.net/logos/7/174/full/f1wggq2k8ql88fe33jzhw641u.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("saints", "New Orleans Saints", "nfl", "https://content.sportslogos.net/logos/7/175/full/907.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("buccaneers", "Tampa Bay Buccaneers", "nfl", "https://content.sportslogos.net/logos/7/176/full/tampa_bay_buccaneers_logo_primary_20207125.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  // NFC West
  createTeamTheme("cardinals", "Arizona Cardinals", "nfl", "https://content.sportslogos.net/logos/7/177/full/kwth8f1cfa2sch5xhjjfaof90.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("rams", "Los Angeles Rams", "nfl", "https://content.sportslogos.net/logos/7/5941/full/8334_los_angeles_rams-primary-20201.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("49ers", "San Francisco 49ers", "nfl", "https://content.sportslogos.net/logos/7/179/full/9455_san_francisco_49ers-primary-2009.png", "from-red-900 via-yellow-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("seahawks", "Seattle Seahawks", "nfl", "https://content.sportslogos.net/logos/7/180/full/pfiobtreaq7j0pzvadktsc6jv.png", "from-blue-900 via-green-800 to-blue-900", "from-blue-600 to-green-600", "bg-blue-600"),

  // ============ MLB TEAMS (ALL 30) ============
  // AL East
  createTeamTheme("orioles", "Baltimore Orioles", "mlb", "https://content.sportslogos.net/logos/53/52/full/orioles_cap_2019_full.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  createTeamTheme("redsox", "Boston Red Sox", "mlb", "https://content.sportslogos.net/logos/53/53/full/c0whx9c2cyjay4c3acgv7cikt.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("yankees", "New York Yankees", "mlb", "https://content.sportslogos.net/logos/53/68/full/1256.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-800"),
  createTeamTheme("rays", "Tampa Bay Rays", "mlb", "https://content.sportslogos.net/logos/53/2535/full/2706_tampa_bay_rays-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("bluejays", "Toronto Blue Jays", "mlb", "https://content.sportslogos.net/logos/53/78/full/1702_toronto_blue_jays-primary-2020.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  // AL Central
  createTeamTheme("whitesox", "Chicago White Sox", "mlb", "https://content.sportslogos.net/logos/53/55/full/382.png", "from-black via-slate-800 to-black", "from-slate-600 to-black", "bg-slate-800"),
  createTeamTheme("guardians", "Cleveland Guardians", "mlb", "https://content.sportslogos.net/logos/53/57/full/3251_cleveland_guardians-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("tigers", "Detroit Tigers", "mlb", "https://content.sportslogos.net/logos/53/59/full/5765_detroit_tigers-primary-2016.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-700 to-orange-600", "bg-blue-800"),
  createTeamTheme("royals", "Kansas City Royals", "mlb", "https://content.sportslogos.net/logos/53/62/full/1105.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("twins", "Minnesota Twins", "mlb", "https://content.sportslogos.net/logos/53/65/full/5765_minnesota_twins-primary-2023.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  // AL West
  createTeamTheme("astros", "Houston Astros", "mlb", "https://content.sportslogos.net/logos/53/4929/full/ffnz3wdbpzkpfb4fznk5ln0fu.png", "from-orange-900 via-blue-800 to-orange-900", "from-orange-600 to-blue-600", "bg-orange-600"),
  createTeamTheme("angels", "Los Angeles Angels", "mlb", "https://content.sportslogos.net/logos/53/6521/full/3785_los_angeles_angels-primary-2016.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("athletics", "Oakland Athletics", "mlb", "https://content.sportslogos.net/logos/53/69/full/1075.png", "from-green-900 via-yellow-700 to-green-900", "from-green-600 to-yellow-500", "bg-green-700"),
  createTeamTheme("mariners", "Seattle Mariners", "mlb", "https://content.sportslogos.net/logos/53/75/full/2455_seattle_mariners-primary-2022.png", "from-blue-900 via-teal-800 to-blue-900", "from-blue-600 to-teal-500", "bg-blue-800"),
  createTeamTheme("rangers", "Texas Rangers", "mlb", "https://content.sportslogos.net/logos/53/77/full/9584_texas_rangers-primary-2020.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  // NL East
  createTeamTheme("braves", "Atlanta Braves", "mlb", "https://content.sportslogos.net/logos/54/51/full/6xyh4ufs6wzwtr4lh7rb81mi8.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("marlins", "Miami Marlins", "mlb", "https://content.sportslogos.net/logos/54/3637/full/8566_miami_marlins-primary-2019.png", "from-blue-900 via-red-700 to-blue-900", "from-blue-600 to-red-500", "bg-blue-700"),
  createTeamTheme("mets", "New York Mets", "mlb", "https://content.sportslogos.net/logos/54/67/full/m01gfgeorgvbfw15fy04alujm.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("phillies", "Philadelphia Phillies", "mlb", "https://content.sportslogos.net/logos/54/70/full/5765_philadelphia_phillies-primary-2019.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("nationals", "Washington Nationals", "mlb", "https://content.sportslogos.net/logos/54/578/full/rcehf4ozugo71dit8m3h.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  // NL Central
  createTeamTheme("cubs", "Chicago Cubs", "mlb", "https://content.sportslogos.net/logos/54/54/full/c1l1h78e43949ggnb7n5xq7l6.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("reds", "Cincinnati Reds", "mlb", "https://content.sportslogos.net/logos/54/56/full/1809_cincinnati_reds-primary-2013.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("brewers", "Milwaukee Brewers", "mlb", "https://content.sportslogos.net/logos/54/64/full/8333_milwaukee_brewers-primary-2020.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  createTeamTheme("pirates", "Pittsburgh Pirates", "mlb", "https://content.sportslogos.net/logos/54/71/full/1250.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("cardinals-mlb", "St. Louis Cardinals", "mlb", "https://content.sportslogos.net/logos/54/72/full/3zhma0aeq17tktge1huh.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  // NL West
  createTeamTheme("diamondbacks", "Arizona Diamondbacks", "mlb", "https://content.sportslogos.net/logos/54/50/full/arizona_diamondbacks_logo_primary_20239847.png", "from-red-900 via-teal-800 to-red-900", "from-red-600 to-teal-500", "bg-red-700"),
  createTeamTheme("rockies", "Colorado Rockies", "mlb", "https://content.sportslogos.net/logos/54/58/full/5765_colorado_rockies-primary-2017.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-black", "bg-purple-800"),
  createTeamTheme("dodgers", "Los Angeles Dodgers", "mlb", "https://content.sportslogos.net/logos/54/63/full/oioet9dkhgerb14tojkl.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("padres", "San Diego Padres", "mlb", "https://content.sportslogos.net/logos/54/73/full/san_diego_padres_logo_primary_20207829.png", "from-amber-900 via-slate-800 to-amber-900", "from-amber-600 to-slate-600", "bg-amber-700"),
  createTeamTheme("giants-mlb", "San Francisco Giants", "mlb", "https://content.sportslogos.net/logos/54/74/full/cpqj6up5bvgpoedg5fwsk0hvo.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),

  // ============ NBA TEAMS (ALL 30) ============
  // Atlantic Division
  createTeamTheme("celtics", "Boston Celtics", "nba", "https://content.sportslogos.net/logos/6/213/full/slhg02hbef3j1ov4lsnwyol5o.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("nets", "Brooklyn Nets", "nba", "https://content.sportslogos.net/logos/6/3786/full/brooklyn_nets_logo_primary_20135763.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("knicks", "New York Knicks", "nba", "https://content.sportslogos.net/logos/6/216/full/2nn48xofg0hms8k326cqdmuis.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("76ers", "Philadelphia 76ers", "nba", "https://content.sportslogos.net/logos/6/218/full/7034_philadelphia_76ers-primary-2016.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("raptors", "Toronto Raptors", "nba", "https://content.sportslogos.net/logos/6/227/full/8756_toronto_raptors-primary-2021.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  // Central Division
  createTeamTheme("bulls", "Chicago Bulls", "nba", "https://content.sportslogos.net/logos/6/221/full/hj3gmh82w9hffmeh3fjm5h874.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("cavaliers", "Cleveland Cavaliers", "nba", "https://content.sportslogos.net/logos/6/222/full/cleveland_cavaliers_logo_primary_2023_sportslogosnet-3339.png", "from-red-900 via-blue-800 to-red-900", "from-red-700 to-yellow-500", "bg-red-800"),
  createTeamTheme("pistons", "Detroit Pistons", "nba", "https://content.sportslogos.net/logos/6/223/full/detroit_pistons_logo_primary_2018_sportslogosnet-5765.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("pacers", "Indiana Pacers", "nba", "https://content.sportslogos.net/logos/6/224/full/4812_indiana_pacers-primary-2018.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("bucks", "Milwaukee Bucks", "nba", "https://content.sportslogos.net/logos/6/225/full/7463_milwaukee_bucks-primary-2016.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-slate-600", "bg-green-700"),
  // Southeast Division
  createTeamTheme("hawks", "Atlanta Hawks", "nba", "https://content.sportslogos.net/logos/6/220/full/8190_atlanta_hawks-primary-2021.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("hornets", "Charlotte Hornets", "nba", "https://content.sportslogos.net/logos/6/5120/full/1926_charlotte__hornets_-primary-2015.png", "from-teal-900 via-purple-800 to-teal-900", "from-teal-500 to-purple-500", "bg-teal-700"),
  createTeamTheme("heat", "Miami Heat", "nba", "https://content.sportslogos.net/logos/6/214/full/burm5gh2wvjti3xhei5h16k8e.png", "from-red-900 via-black to-red-900", "from-red-600 to-yellow-500", "bg-red-600"),
  createTeamTheme("magic", "Orlando Magic", "nba", "https://content.sportslogos.net/logos/6/217/full/orlando_magic_logo_primary_20117178.png", "from-blue-900 via-black to-blue-900", "from-blue-600 to-black", "bg-blue-700"),
  createTeamTheme("wizards", "Washington Wizards", "nba", "https://content.sportslogos.net/logos/6/219/full/5765_washington_wizards-primary-2015.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  // Northwest Division
  createTeamTheme("nuggets", "Denver Nuggets", "nba", "https://content.sportslogos.net/logos/6/229/full/8926_denver_nuggets-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("timberwolves", "Minnesota Timberwolves", "nba", "https://content.sportslogos.net/logos/6/232/full/minnesota_timberwolves_logo_primary_20189413.png", "from-blue-900 via-green-800 to-blue-900", "from-blue-600 to-green-500", "bg-blue-800"),
  createTeamTheme("thunder", "Oklahoma City Thunder", "nba", "https://content.sportslogos.net/logos/6/2687/full/khmovcnezy06c3nm05ccn0oj2.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("blazers", "Portland Trail Blazers", "nba", "https://content.sportslogos.net/logos/6/239/full/9725_portland_trail_blazers-primary-2018.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("jazz", "Utah Jazz", "nba", "https://content.sportslogos.net/logos/6/234/full/utah_jazz_logo_primary_20238259.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-600 to-blue-600", "bg-yellow-700"),
  // Pacific Division
  createTeamTheme("warriors", "Golden State Warriors", "nba", "https://content.sportslogos.net/logos/6/235/full/qhhir6fj8zp30f33s7sfz4822.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-600"),
  createTeamTheme("clippers", "Los Angeles Clippers", "nba", "https://content.sportslogos.net/logos/6/236/full/los_angeles_clippers_logo_primary_20245765.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("lakers", "Los Angeles Lakers", "nba", "https://content.sportslogos.net/logos/6/237/full/uig7aiht8jnpl1szbi57zzlsh.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-600"),
  createTeamTheme("suns", "Phoenix Suns", "nba", "https://content.sportslogos.net/logos/6/238/full/phoenix_suns_logo_primary_20143696.png", "from-purple-900 via-orange-700 to-purple-900", "from-purple-600 to-orange-500", "bg-purple-700"),
  createTeamTheme("kings", "Sacramento Kings", "nba", "https://content.sportslogos.net/logos/6/240/full/4043_sacramento_kings-primary-2017.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-slate-600", "bg-purple-700"),
  // Southwest Division
  createTeamTheme("mavericks", "Dallas Mavericks", "nba", "https://content.sportslogos.net/logos/6/228/full/3463_dallas_mavericks-primary-2018.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("rockets", "Houston Rockets", "nba", "https://content.sportslogos.net/logos/6/230/full/6830_houston_rockets-primary-2020.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("grizzlies", "Memphis Grizzlies", "nba", "https://content.sportslogos.net/logos/6/231/full/4373_memphis_grizzlies-primary-2019.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  createTeamTheme("pelicans", "New Orleans Pelicans", "nba", "https://content.sportslogos.net/logos/6/4962/full/2681_new_orleans_pelicans-primary-2014.png", "from-blue-900 via-red-700 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("spurs", "San Antonio Spurs", "nba", "https://content.sportslogos.net/logos/6/233/full/2547_san_antonio_spurs-primary-2018.png", "from-slate-900 via-black to-slate-900", "from-slate-600 to-black", "bg-slate-800"),

  // ============ NHL TEAMS (ALL 32) ============
  // Atlantic Division
  createTeamTheme("bruins", "Boston Bruins", "nhl", "https://content.sportslogos.net/logos/1/3/full/venf9fmhgnsawnxxvehf.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("sabres", "Buffalo Sabres", "nhl", "https://content.sportslogos.net/logos/1/4/full/4622_buffalo_sabres-primary-2021.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("redwings", "Detroit Red Wings", "nhl", "https://content.sportslogos.net/logos/1/11/full/yo3wysbjtagzmwj37tb11u0fh.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("panthers-nhl", "Florida Panthers", "nhl", "https://content.sportslogos.net/logos/1/13/full/1380_florida_panthers-primary-2017.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("canadiens", "Montreal Canadiens", "nhl", "https://content.sportslogos.net/logos/1/16/full/124.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("senators", "Ottawa Senators", "nhl", "https://content.sportslogos.net/logos/1/21/full/ottawa_senators_logo_primary_20218487.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("lightning", "Tampa Bay Lightning", "nhl", "https://content.sportslogos.net/logos/1/27/full/97hhvk8e5if0riepvq97hqbve.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("maple-leafs", "Toronto Maple Leafs", "nhl", "https://content.sportslogos.net/logos/1/28/full/8557_toronto_maple_leafs-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  // Metropolitan Division
  createTeamTheme("hurricanes", "Carolina Hurricanes", "nhl", "https://content.sportslogos.net/logos/1/6/full/fotih31tnumce54l6kooo5d3e.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("bluejackets", "Columbus Blue Jackets", "nhl", "https://content.sportslogos.net/logos/1/9/full/jhepegs329pc7ugyypebl1yok.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("devils", "New Jersey Devils", "nhl", "https://content.sportslogos.net/logos/1/18/full/7561_new_jersey_devils-primary-2000.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("islanders", "New York Islanders", "nhl", "https://content.sportslogos.net/logos/1/19/full/7289_new_york_islanders-primary-1998.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("rangers-nhl", "New York Rangers", "nhl", "https://content.sportslogos.net/logos/1/20/full/144.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("flyers", "Philadelphia Flyers", "nhl", "https://content.sportslogos.net/logos/1/22/full/161.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-600"),
  createTeamTheme("penguins", "Pittsburgh Penguins", "nhl", "https://content.sportslogos.net/logos/1/24/full/4393_pittsburgh_penguins-primary-2017.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-500"),
  createTeamTheme("capitals", "Washington Capitals", "nhl", "https://content.sportslogos.net/logos/1/30/full/llrs2zxi127vkqpe2361.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  // Central Division
  createTeamTheme("coyotes", "Arizona Coyotes", "nhl", "https://content.sportslogos.net/logos/1/5/full/8277_arizona_coyotes-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-500", "bg-red-700"),
  createTeamTheme("blackhawks", "Chicago Blackhawks", "nhl", "https://content.sportslogos.net/logos/1/7/full/56.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("avalanche", "Colorado Avalanche", "nhl", "https://content.sportslogos.net/logos/1/8/full/5765_colorado_avalanche-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("stars", "Dallas Stars", "nhl", "https://content.sportslogos.net/logos/1/10/full/7939_dallas_stars-primary-2022.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-slate-600", "bg-green-700"),
  createTeamTheme("wild", "Minnesota Wild", "nhl", "https://content.sportslogos.net/logos/1/15/full/1588_minnesota_wild-primary-2014.png", "from-green-900 via-red-800 to-green-900", "from-green-600 to-red-600", "bg-green-700"),
  createTeamTheme("predators", "Nashville Predators", "nhl", "https://content.sportslogos.net/logos/1/17/full/auvbet0k0q8asx55ffmhskvbc.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-600 to-blue-600", "bg-yellow-600"),
  createTeamTheme("blues", "St. Louis Blues", "nhl", "https://content.sportslogos.net/logos/1/25/full/99.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("winnipeg-jets", "Winnipeg Jets", "nhl", "https://content.sportslogos.net/logos/1/3050/full/z9qyy9xqoxfjn0njxgzoy2rwk.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  // Pacific Division
  createTeamTheme("ducks", "Anaheim Ducks", "nhl", "https://content.sportslogos.net/logos/1/1736/full/5765_anaheim_ducks-primary-2014.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-700"),
  createTeamTheme("flames", "Calgary Flames", "nhl", "https://content.sportslogos.net/logos/1/5/full/6382_calgary_flames-primary-2021.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("oilers", "Edmonton Oilers", "nhl", "https://content.sportslogos.net/logos/1/12/full/8558_edmonton_oilers-primary-2018.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("kings-nhl", "Los Angeles Kings", "nhl", "https://content.sportslogos.net/logos/1/14/full/5765_los_angeles_kings-primary-2020.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("sharks", "San Jose Sharks", "nhl", "https://content.sportslogos.net/logos/1/26/full/dmo1ej9ulfwxf76jblxh.png", "from-teal-900 via-black to-teal-900", "from-teal-500 to-black", "bg-teal-700"),
  createTeamTheme("kraken", "Seattle Kraken", "nhl", "https://content.sportslogos.net/logos/1/6740/full/3384_seattle_kraken-primary-2022.png", "from-blue-900 via-teal-700 to-blue-900", "from-blue-600 to-teal-500", "bg-blue-800"),
  createTeamTheme("canucks", "Vancouver Canucks", "nhl", "https://content.sportslogos.net/logos/1/29/full/3uxb7ecqvguwma1grvngg4u8j.png", "from-blue-900 via-green-800 to-blue-900", "from-blue-600 to-green-600", "bg-blue-700"),
  createTeamTheme("golden-knights", "Vegas Golden Knights", "nhl", "https://content.sportslogos.net/logos/1/6114/full/3983_vegas_golden_knights-primary-2018.png", "from-slate-900 via-yellow-700 to-slate-900", "from-yellow-500 to-black", "bg-slate-800"),

  // ============ MLS TEAMS (ALL 29) ============
  createTeamTheme("atlanta-united", "Atlanta United FC", "mls", "https://content.sportslogos.net/logos/9/6440/full/3554_atlanta_united_fc-primary-2017.png", "from-red-900 via-black to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("austin-fc", "Austin FC", "mls", "https://content.sportslogos.net/logos/9/6656/full/8977_austin_fc-primary-2021.png", "from-green-900 via-black to-green-900", "from-green-600 to-black", "bg-green-700"),
  createTeamTheme("charlotte-fc", "Charlotte FC", "mls", "https://content.sportslogos.net/logos/9/6684/full/3988_charlotte_fc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("chicago-fire", "Chicago Fire FC", "mls", "https://content.sportslogos.net/logos/9/323/full/1857_chicago_fire_fc-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("fc-cincinnati", "FC Cincinnati", "mls", "https://content.sportslogos.net/logos/9/6453/full/7189_fc_cincinnati-primary-2019.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("colorado-rapids", "Colorado Rapids", "mls", "https://content.sportslogos.net/logos/9/324/full/5765_colorado_rapids-primary-2021.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("columbus-crew", "Columbus Crew", "mls", "https://content.sportslogos.net/logos/9/325/full/8432_columbus_crew-primary-2021.png", "from-yellow-900 via-black to-yellow-900", "from-yellow-500 to-black", "bg-yellow-700"),
  createTeamTheme("dc-united", "D.C. United", "mls", "https://content.sportslogos.net/logos/9/326/full/823.png", "from-black via-red-800 to-black", "from-red-600 to-black", "bg-slate-900"),
  createTeamTheme("fc-dallas", "FC Dallas", "mls", "https://content.sportslogos.net/logos/9/327/full/fc_dallas_logo_primary_2022_sportslogosnet-3968.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("houston-dynamo", "Houston Dynamo FC", "mls", "https://content.sportslogos.net/logos/9/6326/full/4986_houston_dynamo_fc-primary-2021.png", "from-orange-900 via-slate-800 to-orange-900", "from-orange-600 to-slate-600", "bg-orange-700"),
  createTeamTheme("sporting-kc", "Sporting Kansas City", "mls", "https://content.sportslogos.net/logos/9/5261/full/1231_sporting_kansas_city-primary-2011.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("la-galaxy", "LA Galaxy", "mls", "https://content.sportslogos.net/logos/9/329/full/5765_la_galaxy-primary-2021.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("lafc", "Los Angeles FC", "mls", "https://content.sportslogos.net/logos/9/6451/full/8070_los_angeles_fc-primary-2018.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-black"),
  createTeamTheme("inter-miami", "Inter Miami CF", "mls", "https://content.sportslogos.net/logos/9/6617/full/5765_inter_miami_cf-primary-2021.png", "from-pink-900 via-black to-pink-900", "from-pink-500 to-black", "bg-pink-800"),
  createTeamTheme("minnesota-united", "Minnesota United FC", "mls", "https://content.sportslogos.net/logos/9/6439/full/6391_minnesota_united_fc-primary-2017.png", "from-slate-900 via-blue-800 to-slate-900", "from-blue-600 to-slate-600", "bg-slate-800"),
  createTeamTheme("cf-montreal", "CF Montréal", "mls", "https://content.sportslogos.net/logos/9/330/full/9884_cf_montreal-primary-2021.png", "from-blue-900 via-black to-blue-900", "from-blue-600 to-black", "bg-blue-800"),
  createTeamTheme("nashville-sc", "Nashville SC", "mls", "https://content.sportslogos.net/logos/9/6615/full/3529_nashville_sc-primary-2020.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-500 to-blue-600", "bg-yellow-700"),
  createTeamTheme("ne-revolution", "New England Revolution", "mls", "https://content.sportslogos.net/logos/9/331/full/8139_new_england_revolution-primary-2021.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("nycfc", "New York City FC", "mls", "https://content.sportslogos.net/logos/9/5765/full/3118_new_york_city_fc-primary-2015.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-500 to-orange-500", "bg-blue-600"),
  createTeamTheme("ny-red-bulls", "New York Red Bulls", "mls", "https://content.sportslogos.net/logos/9/1876/full/i9ni847kriagxdlb7xewa6dl8.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("orlando-city", "Orlando City SC", "mls", "https://content.sportslogos.net/logos/9/5765/full/5765_orlando_city_sc-primary-2015.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-700"),
  createTeamTheme("philadelphia-union", "Philadelphia Union", "mls", "https://content.sportslogos.net/logos/9/2571/full/5265_philadelphia_union-primary-2018.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("portland-timbers", "Portland Timbers", "mls", "https://content.sportslogos.net/logos/9/2567/full/5765_portland_timbers-primary-2019.png", "from-green-900 via-yellow-700 to-green-900", "from-green-600 to-yellow-500", "bg-green-700"),
  createTeamTheme("real-salt-lake", "Real Salt Lake", "mls", "https://content.sportslogos.net/logos/9/333/full/5099_real_salt_lake-primary-2010.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("san-jose-earthquakes", "San Jose Earthquakes", "mls", "https://content.sportslogos.net/logos/9/334/full/san_jose_earthquakes_logo_primary_2014_sportslogosnet-2986.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-black", "bg-blue-800"),
  createTeamTheme("seattle-sounders", "Seattle Sounders FC", "mls", "https://content.sportslogos.net/logos/9/2568/full/9066_seattle_sounders_fc-primary-2019.png", "from-green-900 via-blue-800 to-green-900", "from-green-600 to-blue-600", "bg-green-700"),
  createTeamTheme("stl-city", "St. Louis City SC", "mls", "https://content.sportslogos.net/logos/9/6724/full/9629_st_louis_city_sc-primary-2023.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("toronto-fc", "Toronto FC", "mls", "https://content.sportslogos.net/logos/9/6327/full/toronto_fc_logo_primary_20072857.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("vancouver-whitecaps", "Vancouver Whitecaps FC", "mls", "https://content.sportslogos.net/logos/9/2569/full/5765_vancouver_whitecaps_fc-primary-2021.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),

  // ============ WSL TEAMS (ALL 12) ============
  createTeamTheme("arsenal-wsl", "Arsenal Women", "wsl", "https://content.sportslogos.net/logos/130/4286/full/5992_arsenal_wfc-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("aston-villa-wsl", "Aston Villa Women", "wsl", "https://content.sportslogos.net/logos/130/4284/full/3568_aston_villa_wfc-primary-2021.png", "from-purple-900 via-blue-800 to-purple-900", "from-purple-600 to-blue-500", "bg-purple-700"),
  createTeamTheme("brighton-wsl", "Brighton & Hove Albion Women", "wsl", "https://content.sportslogos.net/logos/130/4290/full/3990_brighton__hove_albion_wfc-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("chelsea-wsl", "Chelsea Women", "wsl", "https://content.sportslogos.net/logos/130/4287/full/5873_chelsea_fc_women-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("everton-wsl", "Everton Women", "wsl", "https://content.sportslogos.net/logos/130/4288/full/6050_everton_wfc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("leicester-wsl", "Leicester City Women", "wsl", "https://content.sportslogos.net/logos/130/9310/full/2918_leicester_city_wfc-primary-2021.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("liverpool-wsl", "Liverpool Women", "wsl", "https://content.sportslogos.net/logos/130/4289/full/6099_liverpool_fc_women-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("man-city-wsl", "Manchester City Women", "wsl", "https://content.sportslogos.net/logos/130/4291/full/5943_manchester_city_wfc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("man-united-wsl", "Manchester United Women", "wsl", "https://content.sportslogos.net/logos/130/4292/full/2461_manchester_united_women-primary-2018.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("tottenham-wsl", "Tottenham Hotspur Women", "wsl", "https://content.sportslogos.net/logos/130/4293/full/8215_tottenham_hotspur_women-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("west-ham-wsl", "West Ham United Women", "wsl", "https://content.sportslogos.net/logos/130/4294/full/5961_west_ham_united_wfc-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-700 to-blue-600", "bg-red-800"),
  createTeamTheme("crystal-palace-wsl", "Crystal Palace Women", "wsl", "https://content.sportslogos.net/logos/130/9312/full/6890_crystal_palace_women-primary-2024.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),

  // ============ PREMIER LEAGUE (ALL 20) ============
  createTeamTheme("arsenal-epl", "Arsenal", "epl", "https://content.sportslogos.net/logos/9/82/full/3930_arsenal-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("aston-villa-epl", "Aston Villa", "epl", "https://content.sportslogos.net/logos/9/83/full/2089_aston_villa-primary-2023.png", "from-purple-900 via-blue-800 to-purple-900", "from-purple-600 to-blue-500", "bg-purple-700"),
  createTeamTheme("bournemouth", "AFC Bournemouth", "epl", "https://content.sportslogos.net/logos/9/2832/full/8329_afc_bournemouth-primary-2013.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("brentford", "Brentford", "epl", "https://content.sportslogos.net/logos/9/93/full/4817_brentford_fc-primary-2017.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("brighton-epl", "Brighton & Hove Albion", "epl", "https://content.sportslogos.net/logos/9/94/full/4802_brighton__hove_albion-primary-2011.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("chelsea-epl", "Chelsea", "epl", "https://content.sportslogos.net/logos/9/85/full/2891_chelsea_fc-primary-2006.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("crystal-palace", "Crystal Palace", "epl", "https://content.sportslogos.net/logos/9/96/full/4651_crystal_palace_fc-primary-2022.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("everton-epl", "Everton", "epl", "https://content.sportslogos.net/logos/9/86/full/8755_everton_fc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("fulham", "Fulham", "epl", "https://content.sportslogos.net/logos/9/87/full/ik7kfpqztwzrxi7yq1bz.png", "from-slate-900 via-slate-800 to-slate-900", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("ipswich", "Ipswich Town", "epl", "https://content.sportslogos.net/logos/9/88/full/2961_ipswich_town_fc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("leicester-epl", "Leicester City", "epl", "https://content.sportslogos.net/logos/9/2851/full/9070_leicester_city_fc-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("liverpool-epl", "Liverpool", "epl", "https://content.sportslogos.net/logos/9/98/full/4426_liverpool_fc-primary-2012.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("man-city-epl", "Manchester City", "epl", "https://content.sportslogos.net/logos/9/99/full/3209_manchester_city_fc-primary-2016.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("man-united-epl", "Manchester United", "epl", "https://content.sportslogos.net/logos/9/100/full/8085_manchester_united_fc-primary-2021.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("newcastle", "Newcastle United", "epl", "https://content.sportslogos.net/logos/9/101/full/1252_newcastle_united_fc-primary-2020.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("nottingham-forest", "Nottingham Forest", "epl", "https://content.sportslogos.net/logos/9/102/full/2931_nottingham_forest_fc-primary-2019.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("southampton", "Southampton", "epl", "https://content.sportslogos.net/logos/9/104/full/6623_southampton_fc-primary-2018.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("tottenham-epl", "Tottenham Hotspur", "epl", "https://content.sportslogos.net/logos/9/105/full/8756_tottenham_hotspur_fc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("west-ham-epl", "West Ham United", "epl", "https://content.sportslogos.net/logos/9/106/full/2909_west_ham_united_fc-primary-2019.png", "from-red-900 via-blue-800 to-red-900", "from-red-700 to-blue-600", "bg-red-800"),
  createTeamTheme("wolves", "Wolverhampton Wanderers", "epl", "https://content.sportslogos.net/logos/9/107/full/2920_wolverhampton_wanderers_fc-primary-2019.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-700"),

  // ============ LA LIGA (ALL 20) ============
  createTeamTheme("barcelona", "FC Barcelona", "laliga", "https://content.sportslogos.net/logos/10/111/full/1189_fc_barcelona-primary-2019.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("real-madrid", "Real Madrid", "laliga", "https://content.sportslogos.net/logos/10/121/full/5885_real_madrid_cf-primary-2022.png", "from-slate-900 via-slate-800 to-slate-900", "from-slate-600 to-yellow-500", "bg-slate-800"),
  createTeamTheme("atletico-madrid", "Atlético Madrid", "laliga", "https://content.sportslogos.net/logos/10/110/full/6976_club_atltico_de_madrid-primary-2024.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("athletic-bilbao", "Athletic Bilbao", "laliga", "https://content.sportslogos.net/logos/10/109/full/3907_athletic_club-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("villarreal", "Villarreal CF", "laliga", "https://content.sportslogos.net/logos/10/122/full/1093_villarreal_cf-primary-2021.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-500 to-blue-600", "bg-yellow-600"),
  createTeamTheme("real-sociedad", "Real Sociedad", "laliga", "https://content.sportslogos.net/logos/10/119/full/qxcpwdhpvcrp4ljvt0t2.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("real-betis", "Real Betis", "laliga", "https://content.sportslogos.net/logos/10/118/full/2935_real_betis_balompi-primary-2019.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("sevilla", "Sevilla FC", "laliga", "https://content.sportslogos.net/logos/10/120/full/9127_sevilla_fc-primary-2020.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("girona", "Girona FC", "laliga", "https://content.sportslogos.net/logos/10/6339/full/4659_girona_fc-primary-2017.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("valencia", "Valencia CF", "laliga", "https://content.sportslogos.net/logos/10/123/full/1241_valencia_cf-primary-2022.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-700"),
  createTeamTheme("celta-vigo", "Celta Vigo", "laliga", "https://content.sportslogos.net/logos/10/113/full/1111_rc_celta_de_vigo-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("getafe", "Getafe CF", "laliga", "https://content.sportslogos.net/logos/10/6337/full/8356_getafe_cf-primary-2018.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("osasuna", "CA Osasuna", "laliga", "https://content.sportslogos.net/logos/10/6341/full/8653_ca_osasuna-primary-2018.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("rayo-vallecano", "Rayo Vallecano", "laliga", "https://content.sportslogos.net/logos/10/6342/full/6356_rayo_vallecano_de_madrid-primary-2014.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("mallorca", "RCD Mallorca", "laliga", "https://content.sportslogos.net/logos/10/6340/full/9116_rcd_mallorca-primary-2019.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("las-palmas", "UD Las Palmas", "laliga", "https://content.sportslogos.net/logos/10/6343/full/9099_ud_las_palmas-primary-2017.png", "from-yellow-900 via-blue-800 to-yellow-900", "from-yellow-500 to-blue-600", "bg-yellow-600"),
  createTeamTheme("alaves", "Deportivo Alavés", "laliga", "https://content.sportslogos.net/logos/10/6338/full/1125_deportivo_alavs-primary-2020.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("espanyol", "RCD Espanyol", "laliga", "https://content.sportslogos.net/logos/10/6344/full/2938_rcd_espanyol_de_barcelona-primary-2020.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("valladolid", "Real Valladolid", "laliga", "https://content.sportslogos.net/logos/10/6345/full/2940_real_valladolid_cf-primary-2020.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("leganes", "CD Leganés", "laliga", "https://content.sportslogos.net/logos/10/6346/full/7018_cd_legans-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),

  // ============ BUNDESLIGA (ALL 18) ============
  createTeamTheme("bayern-munich", "Bayern Munich", "bundesliga", "https://content.sportslogos.net/logos/11/125/full/879.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("bayer-leverkusen", "Bayer Leverkusen", "bundesliga", "https://content.sportslogos.net/logos/11/124/full/8659_bayer_04_leverkusen-primary-2022.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("borussia-dortmund", "Borussia Dortmund", "bundesliga", "https://content.sportslogos.net/logos/11/126/full/2958_borussia_dortmund-primary-2021.png", "from-yellow-900 via-black to-yellow-900", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("rb-leipzig", "RB Leipzig", "bundesliga", "https://content.sportslogos.net/logos/11/6109/full/9442_rb_leipzig-primary-2014.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("vfb-stuttgart", "VfB Stuttgart", "bundesliga", "https://content.sportslogos.net/logos/11/130/full/8768_vfb_stuttgart-primary-2021.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("eintracht-frankfurt", "Eintracht Frankfurt", "bundesliga", "https://content.sportslogos.net/logos/11/127/full/8676_eintracht_frankfurt-primary-2022.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("wolfsburg", "VfL Wolfsburg", "bundesliga", "https://content.sportslogos.net/logos/11/131/full/8651_vfl_wolfsburg-primary-2022.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("sc-freiburg", "SC Freiburg", "bundesliga", "https://content.sportslogos.net/logos/11/128/full/8656_sc_freiburg-primary-2022.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("hoffenheim", "TSG Hoffenheim", "bundesliga", "https://content.sportslogos.net/logos/11/6108/full/8748_tsg_1899_hoffenheim-primary-2017.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("werder-bremen", "Werder Bremen", "bundesliga", "https://content.sportslogos.net/logos/11/132/full/1087_sv_werder_bremen-primary-2021.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("borussia-mg", "Borussia M'gladbach", "bundesliga", "https://content.sportslogos.net/logos/11/129/full/8692_borussia_mnchengladbach-primary-2022.png", "from-black via-green-800 to-black", "from-green-600 to-black", "bg-slate-800"),
  createTeamTheme("union-berlin", "Union Berlin", "bundesliga", "https://content.sportslogos.net/logos/11/6110/full/8689_1_fc_union_berlin-primary-2022.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("fc-augsburg", "FC Augsburg", "bundesliga", "https://content.sportslogos.net/logos/11/6106/full/8698_fc_augsburg-primary-2022.png", "from-red-900 via-green-800 to-red-900", "from-red-600 to-green-600", "bg-red-700"),
  createTeamTheme("mainz-05", "Mainz 05", "bundesliga", "https://content.sportslogos.net/logos/11/6107/full/8730_1_fsv_mainz_05-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("vfl-bochum", "VfL Bochum", "bundesliga", "https://content.sportslogos.net/logos/11/6111/full/8714_vfl_bochum_1848-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("heidenheim", "1. FC Heidenheim", "bundesliga", "https://content.sportslogos.net/logos/11/6112/full/1_fc_heidenheim_1846_logo_primary_2022_sportslogosnet-7962.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("st-pauli", "FC St. Pauli", "bundesliga", "https://content.sportslogos.net/logos/11/6113/full/8704_fc_st_pauli-primary-2022.png", "from-amber-900 via-slate-800 to-amber-900", "from-amber-600 to-white", "bg-amber-700"),
  createTeamTheme("holstein-kiel", "Holstein Kiel", "bundesliga", "https://content.sportslogos.net/logos/11/6114/full/8720_holstein_kiel-primary-2022.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),

  // ============ SERIE A (ALL 20) ============
  createTeamTheme("napoli", "SSC Napoli", "seriea", "https://content.sportslogos.net/logos/12/139/full/9467_ssc_napoli-primary-2021.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-500 to-white", "bg-blue-600"),
  createTeamTheme("inter-milan", "Inter Milan", "seriea", "https://content.sportslogos.net/logos/12/136/full/8503_fc_internazionale_milano-primary-2021.png", "from-blue-900 via-black to-blue-900", "from-blue-600 to-black", "bg-blue-700"),
  createTeamTheme("juventus", "Juventus", "seriea", "https://content.sportslogos.net/logos/12/141/full/9094_juventus_fc-primary-2017.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("ac-milan", "AC Milan", "seriea", "https://content.sportslogos.net/logos/12/142/full/8509_ac_milan-primary-2021.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("atalanta", "Atalanta", "seriea", "https://content.sportslogos.net/logos/12/133/full/8530_atalanta_bc-primary-2022.png", "from-blue-900 via-black to-blue-900", "from-blue-600 to-black", "bg-blue-700"),
  createTeamTheme("lazio", "SS Lazio", "seriea", "https://content.sportslogos.net/logos/12/137/full/8476_ss_lazio-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("fiorentina", "ACF Fiorentina", "seriea", "https://content.sportslogos.net/logos/12/134/full/8490_acf_fiorentina-primary-2022.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("bologna", "Bologna FC", "seriea", "https://content.sportslogos.net/logos/12/135/full/8460_bologna_fc_1909-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("as-roma", "AS Roma", "seriea", "https://content.sportslogos.net/logos/12/143/full/8600_as_roma-primary-2022.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("torino", "Torino FC", "seriea", "https://content.sportslogos.net/logos/12/140/full/8514_torino_fc-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-800"),
  createTeamTheme("genoa", "Genoa CFC", "seriea", "https://content.sportslogos.net/logos/12/146/full/8596_genoa_cfc-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("udinese", "Udinese Calcio", "seriea", "https://content.sportslogos.net/logos/12/144/full/8533_udinese_calcio-primary-2022.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("empoli", "Empoli FC", "seriea", "https://content.sportslogos.net/logos/12/147/full/8548_empoli_fc-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("cagliari", "Cagliari Calcio", "seriea", "https://content.sportslogos.net/logos/12/148/full/8565_cagliari_calcio-primary-2022.png", "from-red-900 via-blue-800 to-red-900", "from-red-600 to-blue-600", "bg-red-700"),
  createTeamTheme("hellas-verona", "Hellas Verona", "seriea", "https://content.sportslogos.net/logos/12/149/full/8570_hellas_verona_fc-primary-2022.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("lecce", "US Lecce", "seriea", "https://content.sportslogos.net/logos/12/150/full/8582_us_lecce-primary-2022.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("parma", "Parma Calcio", "seriea", "https://content.sportslogos.net/logos/12/151/full/parma_calcio_1913_logo_primary_2020_sportslogosnet-3697.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("como", "Como 1907", "seriea", "https://content.sportslogos.net/logos/12/152/full/8588_como_1907-primary-2019.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("venezia", "Venezia FC", "seriea", "https://content.sportslogos.net/logos/12/153/full/8593_venezia_fc-primary-2021.png", "from-green-900 via-orange-700 to-green-900", "from-green-600 to-orange-500", "bg-green-700"),
  createTeamTheme("monza", "AC Monza", "seriea", "https://content.sportslogos.net/logos/12/154/full/ac_monza_logo_primary_2019_sportslogosnet-8524.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),

  // ============ LIGUE 1 (TOP 18) ============
  createTeamTheme("psg", "Paris Saint-Germain", "ligue1", "https://content.sportslogos.net/logos/18/184/full/paris_saint_germain_fc_logo_primary_2024_sportslogosnet-3379.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("monaco", "AS Monaco", "ligue1", "https://content.sportslogos.net/logos/18/175/full/9448_as_monaco_fc-primary-2021.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("marseille", "Olympique Marseille", "ligue1", "https://content.sportslogos.net/logos/18/180/full/8948_olympique_de_marseille-primary-2023.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("lyon", "Olympique Lyon", "ligue1", "https://content.sportslogos.net/logos/18/179/full/8956_olympique_lyonnais-primary-2022.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("lille", "Lille OSC", "ligue1", "https://content.sportslogos.net/logos/18/178/full/8935_losc_lille_mtropole-primary-2022.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("nice", "OGC Nice", "ligue1", "https://content.sportslogos.net/logos/18/181/full/8975_ogc_nice-primary-2022.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("lens", "RC Lens", "ligue1", "https://content.sportslogos.net/logos/18/182/full/8989_rc_lens-primary-2020.png", "from-red-900 via-yellow-700 to-red-900", "from-red-600 to-yellow-500", "bg-red-700"),
  createTeamTheme("rennes", "Stade Rennais", "ligue1", "https://content.sportslogos.net/logos/18/183/full/9002_stade_rennais_fc-primary-2021.png", "from-red-900 via-black to-red-900", "from-red-600 to-black", "bg-red-700"),
  createTeamTheme("toulouse", "Toulouse FC", "ligue1", "https://content.sportslogos.net/logos/18/186/full/9008_toulouse_fc-primary-2021.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("strasbourg", "RC Strasbourg", "ligue1", "https://content.sportslogos.net/logos/18/185/full/9022_racing_club_de_strasbourg_alsace-primary-2020.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("nantes", "FC Nantes", "ligue1", "https://content.sportslogos.net/logos/18/176/full/fc_nantes_logo_primary_2019_sportslogosnet-8869.png", "from-yellow-900 via-green-800 to-yellow-900", "from-yellow-500 to-green-600", "bg-yellow-600"),
  createTeamTheme("brest", "Stade Brestois", "ligue1", "https://content.sportslogos.net/logos/18/187/full/stade_brestois_29_logo_primary_2019_sportslogosnet-9016.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("montpellier", "Montpellier HSC", "ligue1", "https://content.sportslogos.net/logos/18/188/full/montpellier_hsc_logo_primary_2019_sportslogosnet-8883.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("reims", "Stade de Reims", "ligue1", "https://content.sportslogos.net/logos/18/189/full/stade_de_reims_logo_primary_2020_sportslogosnet-8895.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("angers", "Angers SCO", "ligue1", "https://content.sportslogos.net/logos/18/190/full/angers_sco_logo_primary_2019_sportslogosnet-8908.png", "from-black via-slate-800 to-black", "from-slate-600 to-white", "bg-slate-800"),
  createTeamTheme("auxerre", "AJ Auxerre", "ligue1", "https://content.sportslogos.net/logos/18/191/full/aj_auxerre_logo_primary_2022_sportslogosnet-9035.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("saint-etienne", "AS Saint-Étienne", "ligue1", "https://content.sportslogos.net/logos/18/192/full/as_saint_etienne_logo_primary_2022_sportslogosnet-9049.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("le-havre", "Le Havre AC", "ligue1", "https://content.sportslogos.net/logos/18/193/full/le_havre_ac_logo_primary_2019_sportslogosnet-9062.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),

  // ============ NCAA DIVISION 1 COLLEGE (134+ TEAMS) ============
  // SEC
  createTeamTheme("alabama", "Alabama Crimson Tide", "college", "https://content.sportslogos.net/logos/31/596/full/3255_alabama_crimson_tide-alternate-2001.png", "from-red-900 via-red-800 to-red-900", "from-red-700 to-slate-700", "bg-red-700"),
  createTeamTheme("auburn", "Auburn Tigers", "college", "https://content.sportslogos.net/logos/31/600/full/1114_auburn_tigers-primary-2003.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("arkansas", "Arkansas Razorbacks", "college", "https://content.sportslogos.net/logos/31/598/full/arkansas_razorbacks_logo_primary_2021_sportslogosnet-5765.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("florida", "Florida Gators", "college", "https://content.sportslogos.net/logos/31/670/full/9285_florida_gators-primary-2013.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("georgia", "Georgia Bulldogs", "college", "https://content.sportslogos.net/logos/31/675/full/7493_georgia_bulldogs-alternate-2013.png", "from-red-900 via-black to-red-900", "from-red-700 to-slate-900", "bg-red-700"),
  createTeamTheme("kentucky-college", "Kentucky Wildcats", "college", "https://content.sportslogos.net/logos/33/729/full/2851_kentucky_wildcats-primary-2016.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("lsu", "LSU Tigers", "college", "https://content.sportslogos.net/logos/32/718/full/3372_lsu_tigers-primary-2014.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-700"),
  createTeamTheme("mississippi-state", "Mississippi State Bulldogs", "college", "https://content.sportslogos.net/logos/31/687/full/mississippi_state_bulldogs_logo_primary_2014_sportslogosnet-8942.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-800"),
  createTeamTheme("missouri", "Missouri Tigers", "college", "https://content.sportslogos.net/logos/31/689/full/missouri_tigers_logo_primary_2016_sportslogosnet-3089.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("ole-miss", "Ole Miss Rebels", "college", "https://content.sportslogos.net/logos/31/688/full/ole_miss_rebels_logo_primary_2020_sportslogosnet-7612.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("oklahoma-college", "Oklahoma Sooners", "college", "https://content.sportslogos.net/logos/33/722/full/oklahoma_sooners_logo_primary_2019_sportslogosnet-9286.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("south-carolina", "South Carolina Gamecocks", "college", "https://content.sportslogos.net/logos/31/696/full/south_carolina_gamecocks_logo_primary_2016_sportslogosnet-3092.png", "from-red-900 via-black to-red-900", "from-red-700 to-black", "bg-red-800"),
  createTeamTheme("tennessee", "Tennessee Volunteers", "college", "https://content.sportslogos.net/logos/32/627/full/0kld4t09biwe3g7g6rl0.png", "from-orange-900 via-slate-800 to-orange-900", "from-orange-600 to-white", "bg-orange-600"),
  createTeamTheme("texas-college", "Texas Longhorns", "college", "https://content.sportslogos.net/logos/32/628/full/2771_texas_longhorns-primary-2014.png", "from-orange-900 via-slate-800 to-orange-900", "from-orange-600 to-white", "bg-orange-700"),
  createTeamTheme("texas-am", "Texas A&M Aggies", "college", "https://content.sportslogos.net/logos/32/629/full/texas_am_aggies_logo_primary_2022_sportslogosnet-3283.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-800"),
  createTeamTheme("vanderbilt", "Vanderbilt Commodores", "college", "https://content.sportslogos.net/logos/31/703/full/vanderbilt_commodores_logo_primary_2022_sportslogosnet-8789.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-slate-800"),
  // Big Ten
  createTeamTheme("ohio-state", "Ohio State Buckeyes", "college", "https://content.sportslogos.net/logos/32/723/full/959.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-slate-600", "bg-red-700"),
  createTeamTheme("michigan", "Michigan Wolverines", "college", "https://content.sportslogos.net/logos/32/720/full/1125.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  createTeamTheme("penn-state", "Penn State Nittany Lions", "college", "https://content.sportslogos.net/logos/32/625/full/penn_state_nittany_lions_logo_primary_2005_sportslogosnet-9287.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("usc", "USC Trojans", "college", "https://content.sportslogos.net/logos/33/940/full/usc_trojans_logo_primary_2016_sportslogosnet-3096.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("ucla", "UCLA Bruins", "college", "https://content.sportslogos.net/logos/33/930/full/ucla_bruins_logo_primary_2017_sportslogosnet-1871.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-500 to-yellow-500", "bg-blue-600"),
  createTeamTheme("oregon", "Oregon Ducks", "college", "https://content.sportslogos.net/logos/32/621/full/oregon_ducks_logo_primary_2024_sportslogosnet-8942.png", "from-green-900 via-yellow-700 to-green-900", "from-green-600 to-yellow-500", "bg-green-700"),
  createTeamTheme("washington", "Washington Huskies", "college", "https://content.sportslogos.net/logos/33/937/full/washington_huskies_logo_primary_2016_sportslogosnet-3100.png", "from-purple-900 via-yellow-700 to-purple-900", "from-purple-600 to-yellow-500", "bg-purple-700"),
  createTeamTheme("wisconsin", "Wisconsin Badgers", "college", "https://content.sportslogos.net/logos/33/938/full/wisconsin_badgers_logo_primary_2017_sportslogosnet-2842.png", "from-red-900 via-slate-800 to-red-900", "from-red-600 to-white", "bg-red-700"),
  createTeamTheme("iowa", "Iowa Hawkeyes", "college", "https://content.sportslogos.net/logos/32/714/full/iowa_hawkeyes_logo_primary_2012_sportslogosnet-9288.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-yellow-600"),
  createTeamTheme("indiana", "Indiana Hoosiers", "college", "https://content.sportslogos.net/logos/33/712/full/indiana_hoosiers_logo_primary_2021_sportslogosnet-5268.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("michigan-state", "Michigan State Spartans", "college", "https://content.sportslogos.net/logos/32/724/full/michigan_state_spartans_logo_primary_2019_sportslogosnet-1873.png", "from-green-900 via-slate-800 to-green-900", "from-green-600 to-white", "bg-green-700"),
  createTeamTheme("minnesota", "Minnesota Golden Gophers", "college", "https://content.sportslogos.net/logos/32/719/full/minnesota_golden_gophers_logo_primary_2021_sportslogosnet-5269.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("nebraska", "Nebraska Cornhuskers", "college", "https://content.sportslogos.net/logos/32/721/full/nebraska_cornhuskers_logo_primary_2016_sportslogosnet-3097.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("purdue", "Purdue Boilermakers", "college", "https://content.sportslogos.net/logos/33/891/full/purdue_boilermakers_logo_primary_2024_sportslogosnet-8796.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-slate-800"),
  createTeamTheme("illinois", "Illinois Fighting Illini", "college", "https://content.sportslogos.net/logos/32/710/full/illinois_fighting_illini_logo_primary_2021_sportslogosnet-5270.png", "from-orange-900 via-blue-800 to-orange-900", "from-orange-600 to-blue-600", "bg-orange-700"),
  createTeamTheme("northwestern", "Northwestern Wildcats", "college", "https://content.sportslogos.net/logos/33/810/full/northwestern_wildcats_logo_primary_2024_sportslogosnet-8797.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("rutgers", "Rutgers Scarlet Knights", "college", "https://content.sportslogos.net/logos/33/892/full/rutgers_scarlet_knights_logo_primary_2020_sportslogosnet-9289.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("maryland", "Maryland Terrapins", "college", "https://content.sportslogos.net/logos/33/738/full/maryland_terrapins_logo_primary_2018_sportslogosnet-9290.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  // ACC
  createTeamTheme("clemson", "Clemson Tigers", "college", "https://content.sportslogos.net/logos/32/648/full/1044_clemson_tigers-primary-2007.png", "from-orange-900 via-purple-800 to-orange-900", "from-orange-600 to-purple-600", "bg-orange-600"),
  createTeamTheme("florida-state", "Florida State Seminoles", "college", "https://content.sportslogos.net/logos/32/671/full/florida_state_seminoles_logo_primary_2014_sportslogosnet-9291.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("miami-fl", "Miami Hurricanes", "college", "https://content.sportslogos.net/logos/32/757/full/miami_hurricanes_logo_primary_2021_sportslogosnet-5271.png", "from-orange-900 via-green-800 to-orange-900", "from-orange-600 to-green-600", "bg-orange-700"),
  createTeamTheme("nc-state", "NC State Wolfpack", "college", "https://content.sportslogos.net/logos/33/807/full/nc_state_wolfpack_logo_primary_2018_sportslogosnet-9292.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("unc", "UNC Tar Heels", "college", "https://content.sportslogos.net/logos/33/783/full/3068_north_carolina_tar_heels-primary-2015.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-400 to-white", "bg-blue-600"),
  createTeamTheme("duke", "Duke Blue Devils", "college", "https://content.sportslogos.net/logos/32/666/full/5719_duke_blue_devils-primary-2022.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("virginia", "Virginia Cavaliers", "college", "https://content.sportslogos.net/logos/33/932/full/virginia_cavaliers_logo_primary_2020_sportslogosnet-9293.png", "from-blue-900 via-orange-700 to-blue-900", "from-blue-600 to-orange-500", "bg-blue-700"),
  createTeamTheme("virginia-tech", "Virginia Tech Hokies", "college", "https://content.sportslogos.net/logos/33/933/full/virginia_tech_hokies_logo_primary_2017_sportslogosnet-3101.png", "from-red-900 via-orange-800 to-red-900", "from-red-700 to-orange-600", "bg-red-700"),
  createTeamTheme("louisville", "Louisville Cardinals", "college", "https://content.sportslogos.net/logos/33/731/full/louisville_cardinals_logo_primary_2020_sportslogosnet-5272.png", "from-red-900 via-black to-red-900", "from-red-700 to-black", "bg-red-700"),
  createTeamTheme("pittsburgh", "Pittsburgh Panthers", "college", "https://content.sportslogos.net/logos/33/813/full/pittsburgh_panthers_logo_primary_2022_sportslogosnet-8800.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("syracuse", "Syracuse Orange", "college", "https://content.sportslogos.net/logos/33/926/full/syracuse_orange_logo_primary_2022_sportslogosnet-8801.png", "from-orange-900 via-slate-800 to-orange-900", "from-orange-600 to-white", "bg-orange-700"),
  createTeamTheme("boston-college", "Boston College Eagles", "college", "https://content.sportslogos.net/logos/32/611/full/boston_college_eagles_logo_primary_2020_sportslogosnet-9294.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("wake-forest", "Wake Forest Demon Deacons", "college", "https://content.sportslogos.net/logos/33/935/full/wake_forest_demon_deacons_logo_primary_2019_sportslogosnet-5273.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-slate-800"),
  createTeamTheme("georgia-tech", "Georgia Tech Yellow Jackets", "college", "https://content.sportslogos.net/logos/32/674/full/georgia_tech_yellow_jackets_logo_primary_2016_sportslogosnet-3099.png", "from-yellow-900 via-slate-800 to-yellow-900", "from-yellow-500 to-white", "bg-yellow-600"),
  createTeamTheme("cal", "California Golden Bears", "college", "https://content.sportslogos.net/logos/33/650/full/california_golden_bears_logo_primary_2017_sportslogosnet-2846.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("stanford", "Stanford Cardinal", "college", "https://content.sportslogos.net/logos/33/925/full/stanford_cardinal_logo_primary_2016_sportslogosnet-3102.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("smu", "SMU Mustangs", "college", "https://content.sportslogos.net/logos/33/920/full/smu_mustangs_logo_primary_2019_sportslogosnet-5274.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  // Big 12
  createTeamTheme("kansas", "Kansas Jayhawks", "college", "https://content.sportslogos.net/logos/33/726/full/3090_kansas_jayhawks-primary-2006.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("kansas-state", "Kansas State Wildcats", "college", "https://content.sportslogos.net/logos/33/728/full/kansas_state_wildcats_logo_primary_2019_sportslogosnet-5275.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("iowa-state", "Iowa State Cyclones", "college", "https://content.sportslogos.net/logos/33/713/full/iowa_state_cyclones_logo_primary_2021_sportslogosnet-5276.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("baylor", "Baylor Bears", "college", "https://content.sportslogos.net/logos/33/607/full/baylor_bears_logo_primary_2019_sportslogosnet-5277.png", "from-green-900 via-yellow-700 to-green-900", "from-green-600 to-yellow-500", "bg-green-700"),
  createTeamTheme("tcu", "TCU Horned Frogs", "college", "https://content.sportslogos.net/logos/33/928/full/tcu_horned_frogs_logo_primary_2021_sportslogosnet-5278.png", "from-purple-900 via-slate-800 to-purple-900", "from-purple-600 to-white", "bg-purple-700"),
  createTeamTheme("texas-tech", "Texas Tech Red Raiders", "college", "https://content.sportslogos.net/logos/33/929/full/texas_tech_red_raiders_logo_primary_2019_sportslogosnet-5279.png", "from-red-900 via-black to-red-900", "from-red-700 to-black", "bg-red-700"),
  createTeamTheme("oklahoma-state", "Oklahoma State Cowboys", "college", "https://content.sportslogos.net/logos/33/811/full/oklahoma_state_cowboys_logo_primary_2021_sportslogosnet-5280.png", "from-orange-900 via-black to-orange-900", "from-orange-600 to-black", "bg-orange-700"),
  createTeamTheme("west-virginia", "West Virginia Mountaineers", "college", "https://content.sportslogos.net/logos/33/936/full/west_virginia_mountaineers_logo_primary_2016_sportslogosnet-3103.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("byu", "BYU Cougars", "college", "https://content.sportslogos.net/logos/33/641/full/byu_cougars_logo_primary_2020_sportslogosnet-9295.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("ucf", "UCF Knights", "college", "https://content.sportslogos.net/logos/33/931/full/ucf_knights_logo_primary_2022_sportslogosnet-8805.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-slate-800"),
  createTeamTheme("cincinnati", "Cincinnati Bearcats", "college", "https://content.sportslogos.net/logos/33/656/full/cincinnati_bearcats_logo_primary_2018_sportslogosnet-9296.png", "from-red-900 via-black to-red-900", "from-red-700 to-black", "bg-red-700"),
  createTeamTheme("houston", "Houston Cougars", "college", "https://content.sportslogos.net/logos/33/911/full/houston_cougars_logo_primary_2017_sportslogosnet-2854.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  createTeamTheme("colorado", "Colorado Buffaloes", "college", "https://content.sportslogos.net/logos/33/662/full/colorado_buffaloes_logo_primary_2022_sportslogosnet-8806.png", "from-black via-yellow-700 to-black", "from-yellow-500 to-black", "bg-slate-800"),
  createTeamTheme("arizona", "Arizona Wildcats", "college", "https://content.sportslogos.net/logos/33/597/full/arizona_wildcats_logo_primary_2021_sportslogosnet-5281.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("arizona-state", "Arizona State Sun Devils", "college", "https://content.sportslogos.net/logos/33/599/full/arizona_state_sun_devils_logo_primary_2011_sportslogosnet-9297.png", "from-red-900 via-yellow-700 to-red-900", "from-red-700 to-yellow-500", "bg-red-700"),
  createTeamTheme("utah", "Utah Utes", "college", "https://content.sportslogos.net/logos/33/939/full/utah_utes_logo_primary_2021_sportslogosnet-5282.png", "from-red-900 via-slate-800 to-red-900", "from-red-700 to-white", "bg-red-700"),
  // Independent
  createTeamTheme("notre-dame", "Notre Dame Fighting Irish", "college", "https://content.sportslogos.net/logos/32/722/full/5312_notre_dame_fighting_irish-primary-2014.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-800"),
  // Top Basketball Programs
  createTeamTheme("villanova", "Villanova Wildcats", "college", "https://content.sportslogos.net/logos/33/934/full/3240_villanova_wildcats-primary-2004.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("gonzaga", "Gonzaga Bulldogs", "college", "https://content.sportslogos.net/logos/33/908/full/gonzaga_bulldogs_logo_primary_2013_sportslogosnet-8658.png", "from-blue-900 via-red-800 to-blue-900", "from-blue-600 to-red-600", "bg-blue-700"),
  createTeamTheme("uconn", "UConn Huskies", "college", "https://content.sportslogos.net/logos/33/666/full/uconn_huskies_logo_primary_2013_sportslogosnet-9298.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("creighton", "Creighton Bluejays", "college", "https://content.sportslogos.net/logos/33/665/full/creighton_bluejays_logo_primary_2013_sportslogosnet-9299.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-700"),
  createTeamTheme("memphis", "Memphis Tigers", "college", "https://content.sportslogos.net/logos/33/754/full/memphis_tigers_logo_primary_2021_sportslogosnet-5283.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-slate-600", "bg-blue-700"),
  createTeamTheme("xavier", "Xavier Musketeers", "college", "https://content.sportslogos.net/logos/33/942/full/xavier_musketeers_logo_primary_2024_sportslogosnet-8808.png", "from-blue-900 via-slate-800 to-blue-900", "from-blue-600 to-white", "bg-blue-800"),
  createTeamTheme("marquette", "Marquette Golden Eagles", "college", "https://content.sportslogos.net/logos/33/737/full/marquette_golden_eagles_logo_primary_2021_sportslogosnet-5284.png", "from-blue-900 via-yellow-700 to-blue-900", "from-blue-600 to-yellow-500", "bg-blue-700"),
  createTeamTheme("san-diego-state", "San Diego State Aztecs", "college", "https://content.sportslogos.net/logos/33/918/full/san_diego_state_aztecs_logo_primary_2018_sportslogosnet-9300.png", "from-red-900 via-black to-red-900", "from-red-700 to-black", "bg-red-700"),

  // ============ GOLF/PGA ============
  {
    id: "pga-tour",
    name: "⛳ PGA Golf Classic",
    category: "golf",
    watermark: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-green-900 via-emerald-800 to-green-900",
      secondary: "from-green-600 to-yellow-500",
      accent: "bg-green-600",
      background: "bg-green-950",
      cardBg: "bg-green-900",
      textPrimary: "text-white",
      textSecondary: "text-green-100"
    }
  },
  {
    id: "masters",
    name: "🏌️ Masters Green",
    category: "golf",
    watermark: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=500&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-green-900 via-green-800 to-black",
      secondary: "from-green-700 to-yellow-600",
      accent: "bg-green-700",
      background: "bg-green-950",
      cardBg: "bg-green-900",
      textPrimary: "text-white",
      textSecondary: "text-green-100"
    }
  },

  // ============ NATURE THEMES ============
  {
    id: "cherry-blossom",
    name: "🌸 Cherry Blossom",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-pink-900 via-rose-800 to-pink-900",
      secondary: "from-pink-500 to-rose-500",
      accent: "bg-pink-500",
      background: "bg-pink-950",
      cardBg: "bg-pink-900",
      textPrimary: "text-white",
      textSecondary: "text-pink-100"
    }
  },
  {
    id: "sunny-day",
    name: "☀️ Sunny Day",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-yellow-900 via-orange-800 to-yellow-900",
      secondary: "from-yellow-500 to-orange-500",
      accent: "bg-yellow-500",
      background: "bg-yellow-950",
      cardBg: "bg-yellow-900",
      textPrimary: "text-white",
      textSecondary: "text-yellow-100"
    }
  },
  {
    id: "space-galaxy",
    name: "🌌 Space Galaxy",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-indigo-900 via-purple-900 to-black",
      secondary: "from-purple-600 to-indigo-600",
      accent: "bg-purple-600",
      background: "bg-black",
      cardBg: "bg-indigo-950",
      textPrimary: "text-white",
      textSecondary: "text-indigo-200"
    }
  },
  {
    id: "deep-ocean",
    name: "🌊 Deep Ocean",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-blue-950 via-blue-900 to-black",
      secondary: "from-blue-600 to-cyan-600",
      accent: "bg-blue-500",
      background: "bg-blue-950",
      cardBg: "bg-blue-900",
      textPrimary: "text-white",
      textSecondary: "text-blue-100"
    }
  },
  {
    id: "mountain-sunset",
    name: "🏔️ Mountain Sunset",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-orange-900 via-purple-900 to-black",
      secondary: "from-orange-600 to-purple-600",
      accent: "bg-orange-600",
      background: "bg-slate-950",
      cardBg: "bg-slate-900",
      textPrimary: "text-white",
      textSecondary: "text-orange-100"
    }
  },
  {
    id: "northern-lights",
    name: "🌌 Northern Lights",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-green-900 via-blue-900 to-black",
      secondary: "from-green-500 to-blue-500",
      accent: "bg-green-500",
      background: "bg-black",
      cardBg: "bg-slate-950",
      textPrimary: "text-white",
      textSecondary: "text-green-100"
    }
  },
  {
    id: "tropical-vibes",
    name: "🌴 Tropical Paradise",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-teal-900 via-cyan-800 to-teal-900",
      secondary: "from-teal-500 to-cyan-500",
      accent: "bg-teal-500",
      background: "bg-teal-950",
      cardBg: "bg-teal-900",
      textPrimary: "text-white",
      textSecondary: "text-teal-100"
    }
  },
  {
    id: "autumn-forest",
    name: "🍂 Autumn Forest",
    category: "nature",
    watermark: "https://images.unsplash.com/photo-1476973422084-e0fa66ff9456?w=800&auto=format&fit=crop&q=60",
    colors: {
      primary: "from-orange-900 via-red-800 to-orange-900",
      secondary: "from-orange-600 to-yellow-600",
      accent: "bg-orange-600",
      background: "bg-orange-950",
      cardBg: "bg-orange-900",
      textPrimary: "text-white",
      textSecondary: "text-orange-100"
    }
  }
];

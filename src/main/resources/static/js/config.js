const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZDI0NjRjMWRhZWU5MGViMDg1YjMzYWI1MmNmOGM2MSIsIm5iZiI6MTc4NTA4NTYyOS4yNzAwMDAyLCJzdWIiOiI2YTY2M2ViZDI1ZTU4NWQxMjZiZDk0MjgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.4ab1FI96JkD-ZNYl4FVBDDWcVYi7AXvABAdcohNESsU";
const BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function getApiUrl(path) {
    if (window.location.protocol === "file:") {
        return "http://localhost:8080" + (path.startsWith("/") ? path : "/" + path);
    }
    return path;
}

function isUnder18User(user) {
    if (!user) return false;
    if (user.isAdult === false) return true;
    const age = parseInt(user.age);
    if (!isNaN(age) && age < 18) return true;
    if (user.dob) {
        try {
            const b = new Date(user.dob);
            const now = new Date();
            let calcAge = now.getFullYear() - b.getFullYear();
            const m = now.getMonth() - b.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < b.getDate())) calcAge--;
            if (calcAge < 18) return true;
        } catch (_) {}
    }
    return false;
}

const ADULT_KEYWORDS = [
    "sex", "sexy", "erotic", "erotica", "porn", "porno", "pornography",
    "xxx", "nude", "nudity", "sensual", "lust", "strip", "stripper",
    "escort", "playboy", "orgasm", "intercourse", "kamasutra", "intimate",
    "seduction", "bdsm", "fetish", "adults only", "hardcore", "softcore",
    "penetration", "brothel", "prostitute", "prostitution", "incest",
    "taboo", "voyeur", "voyeurism", "provocative", "carnal", "unrated",
    "nsfw", "erotism", "steamy", "nympho", "nymphomaniac", "sensuous",
    "sexual", "sexuality", "seductress"
];

const KNOWN_ADULT_TITLES = [
    "arjun reddy", "kabir singh", "animal", "rx 100", "aitraaz",
    "murder", "murder 2", "murder 3", "jism", "jism 2", "hate story",
    "hate story 2", "hate story 3", "hate story 4", "lust stories",
    "lust stories 2", "grand masti", "masti", "great grand masti",
    "mastizaade", "kyaa kool hain hum", "kyaa super kool hain hum",
    "delhi belly", "gangs of wasseypur", "sacred games", "mirzapur",
    "fifty shades of grey", "fifty shades darker", "fifty shades freed",
    "fifty shades", "365 days", "365 dni", "basic instinct", "eyes wide shut",
    "nymphomaniac", "the wolf of wall street", "american psycho",
    "caligula", "wild things", "unfaithful", "fatal attraction",
    "cruel intentions", "showgirls", "body heat", "blue is the warmest color",
    "the dreamers", "love", "lie with me", "original sin", "quills",
    "deadpool", "deadpool 2", "deadpool & wolverine", "oppenheimer",
    "joker", "the conjuring", "it chapter two", "a quiet place",
    "a quiet place part ii", "evil dead", "evil dead rise", "saw",
    "insidious", "annabelle", "smile", "the nun", "terrifier",
    "sinister", "hereditary", "midsommar", "the exorcist", "paranormal activity",
    "poor things", "saltburn", "the idol", "euphoria", "babygirl", "challengers"
];

function isAdultOrRestrictedMovie(m) {
    if (!m) return false;
    if (m.isAdult === true || m.isHorror === true) return true;

    // Check age rating
    if (m.ageRating) {
        const ar = String(m.ageRating).toUpperCase();
        if (ar.includes("18+") || ar === "A" || ar === "R" || ar === "NC-17" || ar === "TV-MA" || ar === "X") {
            return true;
        }
    }

    // Check horror genre
    if (m.genreIds && m.genreIds.includes(27)) return true;
    if (m.genre && String(m.genre).toLowerCase().includes("horror")) return true;

    const titleLower = (m.title || "").toLowerCase();
    const overviewLower = (m.overview || "").toLowerCase();

    // Check known adult titles
    for (const title of KNOWN_ADULT_TITLES) {
        if (titleLower.includes(title)) {
            return true;
        }
    }

    // Check adult keywords using word boundaries
    for (const kw of ADULT_KEYWORDS) {
        const regex = new RegExp("\\b" + kw + "\\b", "i");
        if (regex.test(titleLower) || regex.test(overviewLower)) {
            return true;
        }
    }

    return false;
}

function containsAdultSearchTerm(query) {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    for (const title of KNOWN_ADULT_TITLES) {
        if (q.includes(title)) return true;
    }
    for (const kw of ADULT_KEYWORDS) {
        const regex = new RegExp("\\b" + kw + "\\b", "i");
        if (regex.test(q)) return true;
    }
    return false;
}

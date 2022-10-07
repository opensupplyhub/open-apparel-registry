import { check, sleep, group } from "k6";
import http from "k6/http";
import { SharedArray } from "k6/data";

const randElem = l => l[Math.floor(Math.random() * l.length)];

const addresses = new SharedArray("addresses", function() {
    const a = open("./addresses.csv").split("\n");
    a.shift();
    return a;
});

const randomUnit = () => {
    if (Math.random() > 0.5) {
        return `Unit ${Math.floor(Math.random() * 100)}`;
    }
    return "";
};

const catchPhraseWords = [
    "Adaptive",
    "Advanced",
    "Ameliorated",
    "Assimilated",
    "Automated",
    "Balanced",
    "Business-focused",
    "Centralized",
    "Cloned",
    "Compatible",
    "Configurable",
    "Cross-group",
    "Cross-platform",
    "Customer-focused",
    "Customizable",
    "Decentralized",
    "De-engineered",
    "Devolved",
    "Digitized",
    "Distributed",
    "Diverse",
    "Down-sized",
    "Enhanced",
    "Enterprise-wide",
    "Ergonomic",
    "Exclusive",
    "Expanded",
    "Extended",
    "Face-to-face",
    "Focused",
    "Front-line",
    "Fully-configurable",
    "Function-based",
    "Fundamental",
    "Future-proofed",
    "Grass-roots",
    "Horizontal",
    "Implemented",
    "Innovative",
    "Integrated",
    "Intuitive",
    "Inverse",
    "Managed",
    "Mandatory",
    "Monitored",
    "Multi-channeled",
    "Multi-lateral",
    "Multi-layered",
    "Multi-tiered",
    "Networked",
    "Object-based",
    "Open-architected",
    "Open-source",
    "Operative",
    "Optimized",
    "Optional",
    "Organic",
    "Organized",
    "Persevering",
    "Persistent",
    "Phased",
    "Polarized",
    "Pre-emptive",
    "Proactive",
    "Profit-focused",
    "Profound",
    "Programmable",
    "Progressive",
    "Public-key",
    "Quality-focused",
    "Reactive",
    "Realigned",
    "Re-contextualized",
    "Re-engineered",
    "Reduced",
    "Reverse-engineered",
    "Right-sized",
    "Robust",
    "Seamless",
    "Secured",
    "Self-enabling",
    "Sharable",
    "Stand-alone",
    "Streamlined",
    "Switchable",
    "Synchronized",
    "Synergistic",
    "Synergized",
    "Team-oriented",
    "Total",
    "Triple-buffered",
    "Universal",
    "Up-sized",
    "Upgradable",
    "User-centric",
    "User-friendly",
    "Versatile",
    "Virtual",
    "Visionary",
    "Vision-oriented"
];

const processingTypes = [
    "headquarters",
    "no processing",
    "office",
    "office hq",
    "sourcing agent",
    "trading",
    "packing",
    "warehousing distribution",
    "assembly",
    "cutting",
    "cut & sew",
    "embellishment",
    "embroidery",
    "final product assembly",
    "finished goods",
    "ironing",
    "knitwear assembly",
    "knit composite",
    "linking",
    "manufacturing",
    "making up",
    "marker making",
    "molding",
    "pattern grading",
    "pleating",
    "product finishing",
    "ready made garment",
    "sample making",
    "seam taping",
    "sewing",
    "steaming",
    "stitching",
    "tailoring",
    "batch dyeing",
    "coating",
    "continuous dyeing",
    "direct digital ink printing",
    "dyeing",
    "fabric all over print",
    "fabric chemical finishing",
    "finishing",
    "fiber dye",
    "flat screen printing",
    "garment dyeing",
    "garment place print",
    "garment wash",
    "garment finishing",
    "hand dye",
    "laundering",
    "laundry",
    "pre treatment",
    "printing",
    "printing product dyeing and laundering",
    "product dyeing",
    "rotary printing",
    "screen printing",
    "spray dye",
    "sublimation",
    "textile dyeing",
    "textile printing",
    "textile chemical finishing",
    "textile mechanical finishing",
    "tye dye",
    "washing",
    "wet processing",
    "wet roller printing",
    "yarn dyeing",
    "blending",
    "bonding",
    "buffing",
    "components",
    "doubling",
    "embossing",
    "fabric mill",
    "flat knit",
    "fusing",
    "garment accessories manufacturing",
    "knitting",
    "circular knitting",
    "lace knitting",
    "knitting seamless",
    "knitting v bed",
    "knitting warp",
    "laminating",
    "material creation",
    "material production",
    "mill",
    "non woven manufacturing",
    "non woven processing",
    "straight bar knitting",
    "textile or material production",
    "textile mill",
    "weaving",
    "biological recycling",
    "boiling",
    "breeding",
    "chemical recycling",
    "chemical synthesis",
    "collecting",
    "concentrating",
    "disassembly",
    "down processing",
    "dry spinning",
    "extrusion",
    "ginning",
    "hatchery",
    "mechanical recycling",
    "melt spinning",
    "preparation",
    "preparatory",
    "processing site",
    "pulp making",
    "raw material processing or production",
    "retting",
    "scouring",
    "shredding",
    "slaughterhouse",
    "slaughtering",
    "sorting",
    "spinning",
    "standardization chemical finishing",
    "synthetic leather production",
    "tannery",
    "tanning",
    "textile recycling",
    "top making",
    "twisting texturizing facility",
    "wet spinning",
    "yarn spinning"
];

const suffixes = ["Inc", "and Associates", "LLC", "Group", "PLC", "Ltd"];

const randomSuffix = () => {
    if (Math.random() > 0.3) {
        return randElem(suffixes);
    }
    return "";
};

const randomName = () => {
    return `${randElem(catchPhraseWords)} ${randElem(
        processingTypes
    )} ${randomSuffix()} ${randomUnit()}`;
};

const randomFacilityObject = () => {
    const line = randElem(addresses);
    const country = line.substring(1, 3);
    const address = line.substring(6, line.length - 1);
    const name = randomName();
    const number_of_workers = Math.ceil(Math.random() * 20000);
    const processing_type = randElem(processingTypes);
    return {
        country,
        name,
        address,
        number_of_workers,
        processing_type
    };
};

export const options = {
    userAgent: "k6LoadTest"
};

const check2xx = res => {
    const resArray = Array.isArray(res) ? res : [res];
    resArray.forEach(res =>
        check(res, {
            "is status 2xx": r => r.status >= 200 && r.status < 300
        })
    );
};

const referer = "https://prd.fb84e0f7529f2737.openapparel.org/";

// rootUrl should NOT have a trailing slash
const rootUrl = "https://prd.fb84e0f7529f2737.openapparel.org";

const token = __ENV.TOKEN || "NOT_SPECIFIED";

const headers = {
    "content-type": "application/json",
    referer,
    authorization: `Token ${token}`
};

const url = `${rootUrl}/api/facilities/`;

export default function main() {
    const payload = JSON.stringify(randomFacilityObject());
    const response = http.post(url, payload, { headers });
    check2xx(response);
}

import {
    Partner,
    getPartnerStore
} from "./data";
import {v5} from "uuid";
import {ok} from "../is";

const firstSeedingDate = new Date(1683589864494).toISOString();
const createdAt = firstSeedingDate;
const updatedAt = new Date().toISOString()

// Stable uuid namespace
const namespace = "1bb7a6c2-3542-47d8-9c3a-97d5b37b1bee";

const approvedAt = createdAt;
const partners: Partner[] = [
    {
        partnerName: "Open Network",
        website: "https://opennetwork.dev",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    },
    {
        partnerName: "Virtual State",
        website: "https://virtualstate.dev",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    },
    {
        partnerName: "Social Baking",
        website: "https://www.reddit.com/r/MedicalCannabisNZ/",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    },
    {
        partnerName: "Example",
        website: "https://example.gen.nz",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    },
    {
        partnerName: "Develop NZ",
        website: "https://dev.elop.nz",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    },
    {
        partnerName: "Patient NZ",
        website: "https://patient.nz",
        approvedAt,
        approved: true,
        countryCode: "NZ"
    }
]
    .map((data): Partner => ({
        ...data,
        partnerId: v5(data.partnerName, namespace),
        createdAt,
        updatedAt
    }));


function getPartner(name: string) {
    const found = partners.find(partner => partner.partnerName === name);
    ok(found, `Expected partner ${name}`);
    return found;
}

export async function seedPartners() {
    const partnerStore = getPartnerStore();


    async function putPartner(data: Partner) {
        const { partnerId } = data;
        const existing = await partnerStore.get(partnerId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const partner: Partner = {
            ...existing,
            ...data,
            updatedAt
        };
        await partnerStore.set(partnerId, partner);
    }

    await Promise.all(
        partners.map(putPartner)
    );

}


export async function seed() {
    await seedPartners();
}

const IGNORE_KEYS: string[] = ["updatedAt", "createdAt"];

function isChange(left: Record<string, unknown>, right: Record<string, unknown>) {
    return !Object.entries(left)
        .filter((pair) => !IGNORE_KEYS.includes(pair[0]))
        .every(([key, value]) => right[key] === value);
}

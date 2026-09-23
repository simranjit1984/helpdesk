import type { ChildOrgInheritance } from "@/components/organizations/idp/types";

// ─── Generate 100 child organizations for the "Acme Group has 100 child
// organizations" demo scenario: 90 inherit the IDP (and define their own
// claims mapping), 10 use their own IDP & claims mapping entirely. ────────────

const REGION_NAMES = [
  "Europe",
  "Americas",
  "Asia",
  "Middle East",
  "Africa",
  "Oceania",
  "Nordics",
  "Benelux",
  "Iberia",
  "DACH",
];

const OWN_IDP_NAMES = [
  "Okta",
  "Azure AD",
  "Ping Identity",
  "OneLogin",
  "Auth0",
];

function buildChildOrgs(): ChildOrgInheritance[] {
  const orgs: ChildOrgInheritance[] = [];

  // First 3 follow the exact examples from the spec.
  // Acme Europe intentionally has no claim value yet, to demonstrate the
  // "claims mapping required" state even though it inherits the IDP.
  orgs.push({ orgId: "acme-100-1", orgName: "Acme Europe", mode: "inherit_idp" });
  orgs.push({
    orgId: "acme-100-2",
    orgName: "Acme Americas",
    mode: "inherit_idp",
    orgClaimValue: "https://api.acme-americas.com",
  });
  orgs.push({
    orgId: "acme-100-3",
    orgName: "Acme Asia",
    mode: "own",
    ownIdpName: "Okta",
  });

  // Remaining 97 orgs — distributed to reach totals of 90 / 10
  let inheritLeft = 90 - 2;
  let ownLeft = 10 - 1;

  for (let i = 4; i <= 100; i++) {
    let mode: ChildOrgInheritance["mode"];
    if (inheritLeft > 0) {
      mode = "inherit_idp";
      inheritLeft--;
    } else {
      mode = "own";
      ownLeft--;
    }

    const region = REGION_NAMES[i % REGION_NAMES.length];
    const orgName = `Acme ${region} Subsidiary ${i - 3}`;

    orgs.push({
      orgId: `acme-100-${i}`,
      orgName,
      mode,
      ownIdpName:
        mode === "own" ? OWN_IDP_NAMES[i % OWN_IDP_NAMES.length] : undefined,
      // Organizations that inherit the IDP still always define their own
      // claims mapping — organization claim, access roles, admin roles and
      // scopes can never simply be shared across organizations.
      orgClaimValue:
        mode === "inherit_idp"
          ? `https://api.${orgName.toLowerCase().replace(/\s+/g, "-")}.com`
          : undefined,
    });
  }

  return orgs;
}

export const ACME_100_CHILD_ORGS: ChildOrgInheritance[] = buildChildOrgs();

/** Returns the demo 100-org inheritance list for a given (root) org id. */
export function getChildInheritanceForOrg(orgId: string): ChildOrgInheritance[] {
  if (orgId === "1") return ACME_100_CHILD_ORGS;
  return [];
}

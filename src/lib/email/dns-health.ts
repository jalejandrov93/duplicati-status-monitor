import dns from "dns";

const dnsPromises = dns.promises;

export interface DnsHealthResult {
  spf: {
    valid: boolean;
    record: string | null;
  };
  dkim: {
    valid: boolean;
    record: string | null;
    selector: string;
  };
  dmarc: {
    valid: boolean;
    record: string | null;
  };
  blacklist: {
    listed: boolean;
    details: Array<{ dnsbl: string; listed: boolean }>;
  };
}

const DNSBL_LISTS = [
  "zen.spamhaus.org",
  "b.barracudacentral.org",
  "dnsbl.sorbs.net",
  "bl.spamcop.net",
];

async function checkIpInDnsbl(ip: string, dnsbl: string): Promise<boolean> {
  const reversedIp = ip.split(".").reverse().join(".");
  const query = `${reversedIp}.${dnsbl}`;
  try {
    const addresses = await dnsPromises.resolve4(query);
    return addresses.length > 0;
  } catch {
    // ENOTFOUND means not listed
    return false;
  }
}

export async function checkDnsHealth(domain: string): Promise<DnsHealthResult> {
  const result: DnsHealthResult = {
    spf: { valid: false, record: null },
    dkim: { valid: false, record: null, selector: "default" },
    dmarc: { valid: false, record: null },
    blacklist: { listed: false, details: [] },
  };

  if (!domain) return result;

  // 1. SPF Check
  try {
    const txtRecords = await dnsPromises.resolveTxt(domain);
    const spfRecord = txtRecords.flat().find((r) => r.startsWith("v=spf1"));
    if (spfRecord) {
      result.spf.record = spfRecord;
      result.spf.valid = true;
    }
  } catch (e) {
    console.error("Error checking SPF:", e);
  }

  // 2. DMARC Check
  try {
    const txtRecords = await dnsPromises.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = txtRecords.flat().find((r) => r.startsWith("v=DMARC1"));
    if (dmarcRecord) {
      result.dmarc.record = dmarcRecord;
      result.dmarc.valid = true;
    }
  } catch (e) {
    console.error("Error checking DMARC:", e);
  }

  // 3. DKIM Check
  const selectors = ["default", "cpanel"];
  for (const selector of selectors) {
    try {
      const txtRecords = await dnsPromises.resolveTxt(
        `${selector}._domainkey.${domain}`,
      );
      const dkimRecord = txtRecords
        .flat()
        .find((r) => r.startsWith("v=DKIM1") || r.includes("p="));
      if (dkimRecord) {
        result.dkim.record = dkimRecord;
        result.dkim.valid = true;
        result.dkim.selector = selector;
        break;
      }
    } catch {
      // Sigue probando el siguiente selector
    }
  }

  // 4. Blacklist Check para IPs de MX
  try {
    const mxRecords = await dnsPromises.resolveMx(domain);
    const ipsToCheck = new Set<string>();

    for (const mx of mxRecords) {
      try {
        const addresses = await dnsPromises.resolve4(mx.exchange);
        for (const addr of addresses) {
          ipsToCheck.add(addr);
        }
      } catch {
        // Falló la resolución del registro A para este MX
      }
    }

    if (ipsToCheck.size === 0) {
      try {
        const addresses = await dnsPromises.resolve4(domain);
        for (const addr of addresses) {
          ipsToCheck.add(addr);
        }
      } catch {
        // Falló la resolución del registro A para el dominio
      }
    }

    const blacklistChecks: Array<{ dnsbl: string; listed: boolean }> = [];
    let isListed = false;

    for (const ip of ipsToCheck) {
      for (const dnsbl of DNSBL_LISTS) {
        const listed = await checkIpInDnsbl(ip, dnsbl);
        if (listed) {
          isListed = true;
        }
        blacklistChecks.push({ dnsbl, listed });
      }
    }

    result.blacklist.listed = isListed;
    result.blacklist.details = blacklistChecks;
  } catch (e) {
    console.error("Error checking blacklists:", e);
  }

  return result;
}

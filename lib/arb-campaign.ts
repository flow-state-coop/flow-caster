import { readFileSync } from "fs";
import { join } from "path";

export type ArbCampaignData = {
  escrowAddress: string | null;
  escrowActive: boolean;
  ethAddress: string;
  username: string;
  userpfp: string;
  fid: string;
  iconUrl: string;
  appName: string;
  appScore: string;
  appUrl: string;
};

type CsvRow = {
  username: string;
  fid: string;
  eth_address: string;
  app_name: string;
  icon_url: string;
  user_pfp_url: string;
  escrow_address: string;
  escrow_active: string;
  arbitrum_weighted_score: string;
  app_url: string;
};

let cachedData: CsvRow[] | null = null;

function parseCsv(): CsvRow[] {
  if (cachedData) {
    return cachedData;
  }

  const csvPath = join(process.cwd(), "lib", "data", "arb_members.csv");
  const fileContent = readFileSync(csvPath, "utf-8");
  const lines = fileContent.trim().split("\n");

  if (lines.length < 2) {
    return [];
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim());
  const usernameIdx = headers.indexOf("username");
  const fidIdx = headers.indexOf("fid");
  const userPfpIdx = headers.indexOf("user_pfp_url");
  const ethAddressIdx = headers.indexOf("eth_address");
  const appNameIdx = headers.indexOf("app_name");
  const iconUrlIdx = headers.indexOf("icon_url");
  const escrowAddressIdx = headers.indexOf("Escrow Address");
  const escrowActiveIdx = headers.indexOf("Escrow Active");
  const appScoreIdx = headers.indexOf("arbitrum_weighted_score");
  const appUrlIdx = headers.indexOf("app_url");

  const rows: CsvRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());

    rows.push({
      username: values[usernameIdx] || "",
      fid: values[fidIdx] || "",
      user_pfp_url: values[userPfpIdx] || "",
      eth_address: values[ethAddressIdx] || "",
      app_name: values[appNameIdx] || "",
      icon_url: values[iconUrlIdx] || "",
      escrow_address: values[escrowAddressIdx] || "",
      escrow_active: values[escrowActiveIdx] || "",
      arbitrum_weighted_score: values[appScoreIdx] || "",
      app_url: values[appUrlIdx] || "",
    });
  }

  cachedData = rows;
  return rows;
}

export function getArbCampaignDataForAddress(
  address: string
): ArbCampaignData[] {
  const rows = parseCsv();
  const normalizedAddress = address.toLowerCase();
  const matches: ArbCampaignData[] = [];

  // First, check for escrow address matches where escrow is active
  const escrowMatches = rows.filter(
    (row) =>
      row.escrow_address &&
      row.escrow_address.toLowerCase() === normalizedAddress &&
      row.escrow_active.toUpperCase() === "TRUE"
  );

  // If we found escrow matches, return only those
  if (escrowMatches.length > 0) {
    return escrowMatches.map((row) => ({
      escrowAddress: row.escrow_address || null,
      escrowActive: true,
      ethAddress: row.eth_address,
      username: row.username,
      fid: row.fid,
      userpfp: row.user_pfp_url,
      iconUrl: row.icon_url,
      appName: row.app_name,
      appScore: row.arbitrum_weighted_score,
      appUrl: row.app_url,
    }));
  }

  // Otherwise, match by eth_address
  const ethAddressMatches = rows.filter(
    (row) => row.eth_address.toLowerCase() === normalizedAddress
  );

  return ethAddressMatches.map((row) => ({
    escrowAddress: row.escrow_address || null,
    escrowActive: row.escrow_active.toUpperCase() === "TRUE",
    ethAddress: row.eth_address,
    username: row.username,
    fid: row.fid,
    userpfp: row.user_pfp_url,
    iconUrl: row.icon_url,
    appName: row.app_name,
    appScore: row.arbitrum_weighted_score,
    appUrl: row.app_url,
  }));
}

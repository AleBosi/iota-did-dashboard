import { generateMnemonic } from "@scure/bip39";
import * as englishWordlist from "@scure/bip39/wordlists/english";
import { ethers } from "ethers";
import { encryptSeed, decryptSeed } from "./seedUtils";

// Tipi
export type Member = {
  name?: string;
  matricola?: string;
  role: "Operatore" | "Macchinario";
  did: string;
  encryptedSeed: string;
  encryptionMethod: string;
  credits?: number;
};

export type Company = {
  companyName: string;
  companyDid: string;
  encryptedSeed: string;
  encryptionMethod: string;
  members: Member[];
};

// 🔐 Crea seed BIP39 (12 parole)
export function generateSeedPhrase(): string {
  // Usa .wordlist se presente, oppure default, oppure l'oggetto stesso (compatibilità)
  const wordlist = (englishWordlist as any).wordlist || (englishWordlist as any).default || englishWordlist;
  return generateMnemonic(wordlist, 128);
}

// 🔑 Deriva wallet EVM da seed (ethers v6!)
export function deriveWalletFromSeed(seedPhrase: string): { wallet: ethers.Wallet; address: string } {
  const wallet = ethers.Wallet.fromPhrase(seedPhrase);  // <-- FUNZIONA SOLO SU ethers v6!
  return { wallet, address: wallet.address };
}

// 🆔 Costruisce DID standard IOTA-EVM
export function buildDidFromAddress(address: string): string {
  return `did:iota:evm:${address}`;
}

// 📦 LocalStorage gestione aziende
export function getCompanies(): Company[] {
  return JSON.parse(localStorage.getItem("companies") || "[]");
}
export function saveCompanies(arr: Company[]) {
  localStorage.setItem("companies", JSON.stringify(arr));
}

// ✅ Crea nuova azienda (seed, DID, storage)
export function registerCompany(name: string): { company: Company; seed: string } {
  const seed = generateSeedPhrase();
  const encryptedSeed = encryptSeed(seed);
  const { address } = deriveWalletFromSeed(seed);
  const did = buildDidFromAddress(address);

  const newCompany: Company = {
    companyName: name,
    companyDid: did,
    encryptedSeed,
    encryptionMethod: "BIP39-AES",
    members: [],
  };

  const companies = getCompanies();
  saveCompanies([...companies, newCompany]);

  return { company: newCompany, seed };
}

// ✅ Crea membro (seed, DID, storage)
export function addMemberToCompany(companyDid: string, memberData: {
  name?: string;
  matricola?: string;
  role: "Operatore" | "Macchinario";
}): { member: Member; seed: string } {
  const seed = generateSeedPhrase();
  const encryptedSeed = encryptSeed(seed);
  const { address } = deriveWalletFromSeed(seed);
  const did = buildDidFromAddress(address);

  const newMember: Member = {
    ...memberData,
    did,
    encryptedSeed,
    encryptionMethod: "BIP39-AES",
    credits: 0, // campo opzionale, per compatibilità
  };

  const companies = getCompanies();
  const updated = companies.map(c =>
    c.companyDid === companyDid ? { ...c, members: [...c.members, newMember] } : c
  );
  saveCompanies(updated);

  return { member: newMember, seed };
}

// 🔍 Login: trova azienda o membro tramite seed
export function findEntityBySeed(inputSeed: string):
  | { type: "company"; company: Company }
  | { type: "member"; company: Company; member: Member }
  | null {
  const companies = getCompanies();
  for (const company of companies) {
    try {
      const dec = decryptSeed(company.encryptedSeed);
      if (dec === inputSeed.trim()) return { type: "company", company };
    } catch {}
    for (const member of company.members || []) {
      try {
        const dec = decryptSeed(member.encryptedSeed);
        if (dec === inputSeed.trim()) return { type: "member", company, member };
      } catch {}
    }
  }
  return null;
}

// 📄 Utility: genera hash SHA256 realistico (es. per VC o file)
export async function generateSHA256Hash(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getCurrentCompanyDid(): string {
  return localStorage.getItem("companyDid") || "";
}
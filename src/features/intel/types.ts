/** One statement about the company, and the page it came from. */
export type IntelFact = {
  claim: string;
  sourceUrl: string;
};

/** What gets stored in company_intel.data. */
export type IntelData = {
  summary: string;
  facts: IntelFact[];
  careersUrl: string | null;
  /** Only an address the company itself publishes for applicants. */
  recruitingContact: string | null;
};

export type CompanyIntel = {
  companyName: string;
  data: IntelData;
  fetchedAt: string;
};

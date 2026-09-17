import type { Metadata } from "next";

import { MaintenancePage } from "@/components/site/maintenance";
import { MAINTENANCE } from "@/data/maintenance";

const ROUTE = "/gpt-astra";
const INFO = MAINTENANCE[ROUTE];

export const metadata: Metadata = {
  title: INFO.title,
  description: INFO.blurb,
};

export default function Page() {
  return <MaintenancePage route={ROUTE} />;
}

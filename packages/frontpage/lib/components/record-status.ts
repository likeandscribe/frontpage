import useSWR from "swr";
import type { ApiRouteResponse } from "../api-route";
import type { GET as GetRecordStatus } from "@/app/api/get-record-status/route";

export function useRecordStatus(uri: string) {
  const { data: status } = useSWR(
    `/api/get-record-status?uri=${encodeURIComponent(uri)}`,
    getStatus,
    {
      suspense: true,
      // Stop polling if the status is "live"
      refreshInterval: (status) => (status === "live" ? 0 : 1000),
    },
  );

  return status;
}

async function getStatus(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const json = (await response.json()) as ApiRouteResponse<
    typeof GetRecordStatus
  >;

  const status = json.status;

  if (!status) {
    throw new Error("Failed to fetch data");
  }

  return status;
}

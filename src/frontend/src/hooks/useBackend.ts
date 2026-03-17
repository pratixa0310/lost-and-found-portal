import { HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

/**
 * Returns the backend actor for making canister calls.
 * The actor is null while initializing.
 */
export function useBackend() {
  const { actor } = useActor();
  return actor;
}

/**
 * Creates a StorageClient for file uploads.
 */
export async function createStorageClient(
  identity?: any,
): Promise<StorageClient> {
  const config = await loadConfig();
  const agent = new HttpAgent({
    identity,
    host: config.backend_host,
  });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.warn);
  }
  return new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
}

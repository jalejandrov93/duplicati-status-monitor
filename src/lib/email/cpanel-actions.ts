import { getCpanelConfig } from "@/lib/email/cpanel-client";

interface UapiGenericResponse {
  status: number;
  errors: string[] | null;
  data: any;
  metadata?: {
    result?: number;
    reason?: string | null;
  };
}

async function callUapi(
  moduleName: string,
  functionName: string,
  params: Record<string, string>,
): Promise<any> {
  const config = getCpanelConfig();
  const url = new URL(
    `https://${config.host}:${config.port}/execute/${moduleName}/${functionName}`,
  );

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `cpanel ${config.username}:${config.apiToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CPANEL_HTTP_ERROR_${response.status}`);
  }

  const payload = (await response.json()) as UapiGenericResponse;
  const isSuccess =
    payload.status === 1 || payload.metadata?.result === 1;

  if (!isSuccess) {
    const errorMsg =
      payload.errors?.join(", ") || payload.metadata?.reason || "unknown";
    throw new Error(`CPANEL_UAPI_ERROR: ${errorMsg}`);
  }

  return payload.data;
}

export async function suspendOutgoingEmail(email: string): Promise<boolean> {
  try {
    await callUapi("Email", "suspend_outgoing", { email });
    return true;
  } catch (error) {
    console.error(`Failed to suspend outgoing mail for ${email}:`, error);
    return false;
  }
}

export async function unsuspendOutgoingEmail(email: string): Promise<boolean> {
  try {
    await callUapi("Email", "unsuspend_outgoing", { email });
    return true;
  } catch (error) {
    console.error(`Failed to unsuspend outgoing mail for ${email}:`, error);
    return false;
  }
}

export async function suspendIncomingEmail(email: string): Promise<boolean> {
  try {
    await callUapi("Email", "suspend_incoming", { email });
    return true;
  } catch (error) {
    console.error(`Failed to suspend incoming mail for ${email}:`, error);
    return false;
  }
}

export async function unsuspendIncomingEmail(email: string): Promise<boolean> {
  try {
    await callUapi("Email", "unsuspend_incoming", { email });
    return true;
  } catch (error) {
    console.error(`Failed to unsuspend incoming mail for ${email}:`, error);
    return false;
  }
}

export async function getOutlookConfig(email: string): Promise<any> {
  try {
    const data = await callUapi("Email", "get_client_settings", {
      account: email,
    });
    return data;
  } catch (error) {
    console.error(`Failed to get client settings for ${email}:`, error);
    return null;
  }
}

export const ALL_ORDERS_QUERY = `
  query MyQuery {
    VaultFactory_OrderInventory {
      id
      destinationChainId
      status
      solverTransaction
      parameter
      platform
      platformAddress
      salt
      conditionValue
      orderId
      vault
      originChainId
      depositToken
      convertToken
    }
  }
`;

export const ACTIVE_ORDERS_QUERY = `query MyQuery {
  VaultFactory_OrderInventory(where: {status: {_eq: 1}}) {
    id
    destinationChainId
    status
    solverTransaction
    parameter
    platform
    platformAddress
    salt
    conditionValue
    orderId
    vault
    originChainId
    depositToken
    convertToken
  }
}`;

export function generateVaultOwnerQuery(vault: string) {
  return `query MyQuery {
    VaultFactory_VaultCreated(where: {vaultAddress: {_eq: "${vault}"}}) {
      owner
      vaultAddress
    }
  }`;
}

export const VAULT_OWNER_QUERY = ``;

export function getValueByKey<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export type Response = {
  VaultFactory_OrderInventory: Order[];
};

export type VaultOwnerResponse = {
  VaultFactory_VaultCreated: Vault[];
};

export type Vault = {
  owner: string;
  vaultAddress: string;
};

export type Order = {
  destinationChainId: string;
  platform: string;
  platformAddress: string;
  parameter: string;
  conditionValue: string;
  salt: string;
  vault: string;
  orderId: string;
  originChainId: string;
  depositToken: string;
  convertToken: string;
  [key: string]: string;
};

export async function fetchGraphQL(endpoint: string, query: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
    }),
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error("GraphQL errors:", errors);
    throw new Error("Failed to fetch data");
  }
  return data;
}

export async function getVaultOwner(endpoint: string, vault: string) {
  const query = generateVaultOwnerQuery(vault);
  const response: VaultOwnerResponse = await fetchGraphQL(endpoint, query);

  if (response.VaultFactory_VaultCreated) {
    console.log(response.VaultFactory_VaultCreated[0].owner);
    return response.VaultFactory_VaultCreated[0].owner;
  }
  return "";
}

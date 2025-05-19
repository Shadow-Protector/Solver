import { http, getContract, createWalletClient } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import dotenv from "dotenv";

import { handlerABI } from "../abi/handler";

// import { MarketId } from "@morpho-org/blue-sdk";
// /!\ Import AccrualPosition from the augmentation file (or simply import the file)
// import { MarketParams } from "@morpho-org/blue-sdk-viem/lib/augment/MarketParams";

import {
  ACTIVE_ORDERS_QUERY,
  // ALL_ORDERS_QUERY,
  Response,
  Order,
  fetchGraphQL,
  getValueByKey,
  getVaultOwner,
} from "../config/utils";

dotenv.config(); // Load variables from .env

const endpoint = process.env.ENVIO_ENDPOINT || "";

const privateKey = process.env.PRIVATE_KEY || "";

const payoutAddress = process.env.PAYOUT_ADDRESS || "";

const solverAccount = privateKeyToAccount(privateKey as `0x${string}`);

const client = createWalletClient({
  account: solverAccount,
  chain: base,
  transport: http(),
});
const handler = "0xdE8bb0fbcA6deE981c607C54f94bdd34A9D15362" as `0x${string}`;

const handlerContract = getContract({
  address: handler,
  abi: handlerABI,
  client,
});

async function startSolver(): Promise<void> {
  while (true) {
    try {
      console.log("Fetching Data Every 10 seconds");
      const data: Response = await fetchGraphQL(endpoint, ACTIVE_ORDERS_QUERY);
      const active_orders = getValueByKey(data, "VaultFactory_OrderInventory");

      if (active_orders) {
        for (const order of active_orders) {
          console.log(order);
          const vaultOwner = await getVaultOwner(
            endpoint,
            order.vault ? order.vault : "",
          );
          if (vaultOwner) {
            const conditionResult = await evaluateCondition(order, vaultOwner);
            console.log("condition", conditionResult);
            if (conditionResult) {
              console.log("Execute Order");
              const hash = await executeOrder(order);
              console.log(`${order.orderId} has been executed with ${hash}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during task:", error);
    }

    // Wait before next iteration (e.g., 10 seconds)
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

// Start the loop
startSolver().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

async function evaluateCondition(order: Order, vaultOwner: string) {
  return await handlerContract.read.evaluateCondition([
    BigInt(order.platform),
    order.platformAddress as `0x${string}`,
    vaultOwner as `0x${string}`,
    BigInt(order.parameter),
    BigInt(order.conditionValue),
  ]);
}

async function executeOrder(order: Order) {
  return await handlerContract.write.executeOrder([
    order.vault as `0x${string}`,
    order.orderId,
    payoutAddress as `0x${string}`,
    [],
  ]);
}

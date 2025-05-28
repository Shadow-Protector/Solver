import dotenv from "dotenv";

// import { MarketId } from "@morpho-org/blue-sdk";
// /!\ Import AccrualPosition from the augmentation file (or simply import the file)
// import { MarketParams } from "@morpho-org/blue-sdk-viem/lib/augment/MarketParams";

import {
  ACTIVE_ORDERS_QUERY,
  // ALL_ORDERS_QUERY,
  Response,
  fetchGraphQL,
  getValueByKey,
  getVaultOwner,
} from "../config/utils";

import { evaluateCondition, executeOrder } from "./multichain";

dotenv.config(); // Load variables from .env

const endpoint = process.env.ENVIO_ENDPOINT || "";

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
              try {
                const hash = await executeOrder(order);
                console.log(`${order.orderId} has been executed with ${hash}`);
              } catch (e) {
                console.log("Operation Failed", e);
              }
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

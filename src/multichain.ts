import { http, getContract, createWalletClient, WalletClient } from "viem";
import { arbitrum, base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import dotenv from "dotenv";

import { HandlerContracts } from "../config/contracts";
import { handlerABI } from "../abi/handler";
import { Order } from "../config/utils";

dotenv.config(); // Load variables from .env

const privateKey = process.env.PRIVATE_KEY || "";
const payoutAddress = process.env.PAYOUT_ADDRESS || "";

const solverAccount = privateKeyToAccount(privateKey as `0x${string}`);

const BaseClient: WalletClient = createWalletClient({
  account: solverAccount,
  chain: base,
  transport: http(),
});

const BaseHandlerContract = getContract({
  address: HandlerContracts[base.id.toString()] as `0x${string}`,
  abi: handlerABI,
  client: BaseClient,
});

const ArbitrumClient = createWalletClient({
  account: solverAccount,
  chain: arbitrum,
  transport: http(),
});

const ArbitrumHandlerContract = getContract({
  address: HandlerContracts[arbitrum.id.toString()] as `0x${string}`,
  abi: handlerABI,
  client: ArbitrumClient,
});

export function getHandlerContract(chainId: string) {
  switch (chainId) {
    case base.id.toString():
      return BaseHandlerContract;

    case arbitrum.id.toString():
      return ArbitrumHandlerContract;
  }
}

export async function evaluateCondition(order: Order, vaultOwner: string) {
  const handlerContract = getHandlerContract(order.originChainId);
  if (handlerContract) {
    return await handlerContract.read.evaluateCondition([
      BigInt(order.platform),
      order.platformAddress as `0x${string}`,
      vaultOwner as `0x${string}`,
      BigInt(order.parameter),
      BigInt(order.conditionValue),
    ]);
  }
  return false;
}

export async function executeOrder(order: Order) {
  const handlerContract = getHandlerContract(order.originChainId);
  if (handlerContract) {
    return await handlerContract.write.executeOrder([
      order.vault as `0x${string}`,
      order.orderId,
      payoutAddress as `0x${string}`,
      [],
    ]);
  }
  throw new Error("HANDLER_CONTRACT_NOT_FOUND");
}

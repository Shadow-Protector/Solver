export const handlerABI = [
  {
    type: "function",
    name: "evaluateCondition",
    inputs: [
      {
        name: "_platform",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_platformAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_borrower",
        type: "address",
        internalType: "address",
      },
      {
        name: "_parameter",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "_conditionValue",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "executeOrder",
    inputs: [
      {
        name: "vault",
        type: "address",
        internalType: "address",
      },
      {
        name: "_orderId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_solver",
        type: "address",
        internalType: "address",
      },
      {
        name: "route",
        type: "tuple[]",
        internalType: "struct IRouter.Route[]",
        components: [
          {
            name: "from",
            type: "address",
            internalType: "address",
          },
          {
            name: "to",
            type: "address",
            internalType: "address",
          },
          {
            name: "stable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "factory",
            type: "address",
            internalType: "address",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
];

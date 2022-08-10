import path from "path"
import { buildWrapper } from "@polywrap/test-env-js"
import { tezosPlugin  } from "@blockwatch-cc/tezos-plugin-js"
import { InMemorySigner } from "@taquito/signer";
import { PolywrapClient } from "@polywrap/client-js"
import { up, down, deployContract, Account, DeployResponse, Node } from "@blockwatch-cc/tezos-test-env"

import { SIMPLE_CONTRACT, SIMPLE_CONTRACT_STORAGE } from "./utils/contract"

jest.setTimeout(150000);

describe("e2e", () => {
  let client: PolywrapClient;
  let tezosUri: string;
  let accounts: Account[];
  let node: Node;
  let deployResponse: DeployResponse;

  beforeAll(async () => {
    // build and deploy wrapper source
    const apiPath = path.join(__dirname, "/../../../");
    await buildWrapper(apiPath);
    tezosUri = `fs/${apiPath}/build`;
    // setup tezos node
    const response = await up()
    // initialise
    node = response.node
    accounts = response.accounts
    // deploy contract to tezos node 
    deployResponse = await deployContract(accounts[0], { code: SIMPLE_CONTRACT, storage: SIMPLE_CONTRACT_STORAGE }, 2)
    // get signer
    const signer = await InMemorySigner.fromSecretKey(accounts[0].secretKey)
    // initialize client
    client = new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/tezos.polywrap.eth",
          plugin: tezosPlugin({
            networks: {
              mainnet: {
                provider: "https://rpc.tzstats.com"
              },
              testnet: {
                provider: node.url,
                signer,
              }
            },
            defaultNetwork: "testnet"
          }),
        }
      ],
    });
  })

  afterAll(async () => {
    await down()
  })
   
  describe("Query", () => {
    it("Get initial value of storage", async () => {
      const response =  await client.query<{ getValue: string }>({
        uri: tezosUri,
        query: `
          query {
            getValue(
              address: $address,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
        }
      })
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.getValue).toBe('0')
    })
  })

  describe("Mutation", () => {
    it("Add 5 initial storage value", async () => {
      const numberToAdd = 5;
      let initialStorageValue, finalStorageValue;
      // assert initial value of storage
      const initResponse =  await client.query<{ getValue: string }>({
        uri: tezosUri,
        query: `
          query {
            getValue(
              address: $address,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
        }
      })
      expect(initResponse.errors).toBeUndefined()
      expect(initResponse.data?.getValue).toBeDefined()
      initialStorageValue = parseInt(initResponse.data?.getValue!)
      // Add initial storage by 5
      const response =  await client.query<{ increment: string }>({
        uri: tezosUri,
        query: `
          mutation {
            increment(
              address: $address,
              value: $value,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
          value: numberToAdd
        }
      })
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.increment).toBeDefined()
      // assert final storage value
      const finalResponse =  await client.query<{ getValue: string }>({
        uri: tezosUri,
        query: `
          query {
            getValue(
              address: $address,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
        }
      })
      expect(finalResponse.errors).toBeUndefined()
      expect(finalResponse.data?.getValue).toBeDefined()
      finalStorageValue = parseInt(finalResponse.data?.getValue!)
      expect(finalStorageValue-numberToAdd).toBe(initialStorageValue)
    })

    it("Decrements storage value by 5", async () => {
      const numberToSub = 5;
      let initialStorageValue, finalStorageValue;
      // assert initial value of storage
      const initResponse =  await client.query<{ getValue: string }>({
        uri: tezosUri,
        query: `
          query {
            getValue(
              address: $address,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
        }
      })
      expect(initResponse.errors).toBeUndefined()
      expect(initResponse.data?.getValue).toBeDefined()
      initialStorageValue = parseInt(initResponse.data?.getValue!)
      // Add initial storage by 5
      const response =  await client.query<{ decrement: string }>({
        uri: tezosUri,
        query: `
          mutation {
            decrement(
              address: $address,
              value: $value,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
          value: numberToSub
        }
      })
      expect(response.errors).toBeUndefined()
      expect(response.data).toBeDefined()
      expect(response.data?.decrement).toBeDefined()
      // assert final storage value
      const finalResponse =  await client.query<{ getValue: string }>({
        uri: tezosUri,
        query: `
          query {
            getValue(
              address: $address,
              connection: $connection
            )
          }
        `,
        variables: {
          address: deployResponse.contractAddress,
          connection: {
            networkNameOrChainId: "testnet"
          },
        }
      })
      expect(finalResponse.errors).toBeUndefined()
      expect(finalResponse.data?.getValue).toBeDefined()
      finalStorageValue = parseInt(finalResponse.data?.getValue!)
      expect(finalStorageValue+numberToSub).toBe(initialStorageValue)
    })
  })
})
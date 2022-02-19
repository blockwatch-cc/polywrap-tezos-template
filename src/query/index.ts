import {
  Tezos_Query,
  Input_getValue
} from "./w3";

/**
 * Return the value of the storage
 * @param input 
 * @returns 
 */
export function getValue(input: Input_getValue): string {
  return Tezos_Query.getContractStorage({
    address: input.address,
    connection: input.connection,
    key: '',
    field: '',
  });
}
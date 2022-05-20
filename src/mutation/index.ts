import { Nullable } from "@web3api/wasm-as";
import {
  Tezos_Mutation,
  Tezos_CallContractMethodConfirmationResponse,
  Input_increment,
  Input_decrement
} from "./w3";

/**
 * Increases the storage value
 * @param input 
 * @returns 
 */
export function increment(input: Input_increment): Tezos_CallContractMethodConfirmationResponse {
  return Tezos_Mutation.callContractMethodAndConfirmation({
    address: input.address,
    method: 'increment',
    args: "[" + input.value.toString() + "]",
    connection: input.connection,
    confirmations: <u32>1,
    timeout: Nullable.fromValue<u32>(200),
    params: null
  }).unwrap()
}
/**
 * Decreases the storage value
 * @param input 
 * @returns 
 */
export function decrement(input: Input_decrement): Tezos_CallContractMethodConfirmationResponse {
  return Tezos_Mutation.callContractMethodAndConfirmation({
    address: input.address,
    method: 'decrement',
    args: "[" + input.value.toString() + "]",
    connection: input.connection,
    confirmations: <u32>1,
    timeout: Nullable.fromValue<u32>(200),
    params: null
  }).unwrap()
}

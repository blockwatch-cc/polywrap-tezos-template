import { Option } from "@polywrap/wasm-as";
import {
  Tezos_Module,
  Args_getValue,
  Tezos_CallContractMethodConfirmationResponse,
  Args_increment,
  Args_decrement
} from "./wrap";

/**
 * Return the value of the storage
 * @param input 
 * @returns 
 */
export function getValue(input: Args_getValue): string {
  return Tezos_Module.getContractStorage({
    address: input.address,
    connection: input.connection,
    key: '',
    field: '',
  }).unwrap();
}

/**
 * Increases the storage value
 * @param input 
 * @returns 
 */
export function increment(input: Args_increment): Tezos_CallContractMethodConfirmationResponse {
  return Tezos_Module.callContractMethodAndConfirmation({
    address: input.address,
    method: 'increment',
    args: "[" + input.value.toString() + "]",
    connection: input.connection,
    confirmations: <u32>1,
    timeout: Option.Some<u32>(200),
    params: null
  }).unwrap()
}
/**
 * Decreases the storage value
 * @param input 
 * @returns 
 */
export function decrement(input: Args_decrement): Tezos_CallContractMethodConfirmationResponse {
  return Tezos_Module.callContractMethodAndConfirmation({
    address: input.address,
    method: 'decrement',
    args: "[" + input.value.toString() + "]",
    connection: input.connection,
    confirmations: <u32>1,
    timeout: Option.Some<u32>(200),
    params: null
  }).unwrap()
}

// Type declarations for merkletreejs and keccak256
declare module "merkletreejs" {
  export class MerkleTree {
    constructor(
      leaves: Buffer[],
      hashFunction: (data: any) => Buffer,
      options?: { sortPairs?: boolean }
    );
    getHexRoot(): string;
    getHexProof(leaf: Buffer): string[];
    getProof(leaf: Buffer): any[];
  }
}

declare module "keccak256" {
  function keccak256(data: string | Buffer): Buffer;
  export default keccak256;
}

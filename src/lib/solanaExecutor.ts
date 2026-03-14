import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

interface ExecutionResult {
  signature: string;
  explorerUrl: string;
  network: 'testnet' | 'devnet' | 'simulated';
  simulated: boolean;
}

interface ExecuteParams {
  uiAmount: number;
}

function pseudoSignature(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let value = '';
  for (let i = 0; i < 88; i += 1) value += alphabet[Math.floor(Math.random() * alphabet.length)];
  return value;
}

async function executeOnCluster(uiAmount: number, cluster: 'testnet' | 'devnet'): Promise<ExecutionResult> {
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');
  const sender = Keypair.generate();
  const recipient = Keypair.generate().publicKey;

  const airdropSignature = await connection.requestAirdrop(sender.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSignature, 'confirmed');

  // Keep demo execution cost low while still producing a real on-chain signature.
  const lamports = Math.max(5_000, Math.round(Math.min(uiAmount, 5_000) * 2_000));

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [sender], {
    commitment: 'confirmed',
    skipPreflight: false,
  });

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`,
    network: cluster,
    simulated: false,
  };
}

export async function executePaymentOnSolana(params: ExecuteParams): Promise<ExecutionResult> {
  try {
    return await executeOnCluster(params.uiAmount, 'testnet');
  } catch {
    try {
      return await executeOnCluster(params.uiAmount, 'devnet');
    } catch {
      const signature = pseudoSignature();
      return {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        network: 'simulated',
        simulated: true,
      };
    }
  }
}


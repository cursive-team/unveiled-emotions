import { generate, verify } from "@zk-kit/poseidon-proof";
import { sha256 } from "js-sha256";

async function runZKProof(emotion) {
  // A public value used to contextualize the cryptographic proof and calculate the nullifier.
  const scope = "unveiled-emotions";

  // The message (preimage) to prove (secret).
  const messageHash = BigInt("0x" + sha256(emotion));

  // Generate the proof.
  const fullProof = await generate([messageHash], scope);

  /*
        nb. scope, digest and nullifier are always the same - proof is variable.
        {
            scope: '2',
            digest: '13713635907739611880977640264956372443229506353728466835599871320028961887800',
            nullifier: '4995263610384888704435371233168916617325583088652670186865584118891394144999',
            proof: [
                '4344680442683455359115899095464919042642166233886432616638435348359080260980',
                '20569010229031596977566212621532395450352277701036306316464269899598925981651',
                '19318221594436336163085169568471746851468100277321435282188061183430353155289',
                '13863222659316400652438453097923451250965656325472339120118358727133180331649',
                '2718553541880998786976126630362604850217726344847462841516918030540821216281',
                '11960084231774590415377471656397863783771599717615252119734899677642065267169',
                '10666072962579546268534775428261696356732715643486735369393626224913301307278',
                '4251217137130113647513155953595492143724626859298741948572817563032672674599'
            ]
        }
    */
  // If not specified, the Snark artifacts are downloaded automatically.
  // You can specify them as follows.

  // const fullProof = await generate(message, scope, {
  //     wasm: "<your-path>/poseidon-proof.wasm",
  //     zkey: "<your-path>/poseidon-proof.zkey"
  // })

  // Verify the proof.
  const response = await verify(fullProof);

  console.log(
    emotion,
    fullProof.digest,
    response,
    "0x" + BigInt(fullProof.digest).toString(16)
  );
}

runZKProof("happy");

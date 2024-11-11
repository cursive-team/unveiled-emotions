import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { verify, PoseidonProof } from "@zk-kit/poseidon-proof";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { photoId, fullProof } = req.body as {
      photoId: string;
      fullProof: PoseidonProof;
    };

    // Verify the proof
    const isValid = await verify(fullProof);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid proof" });
    }

    // Store the submission with the digest from the proof
    const submission = await prisma.submission.create({
      data: {
        photoId: parseInt(photoId),
        digest: "0x" + BigInt(fullProof.digest).toString(16),
      },
    });

    res.status(200).json(submission);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

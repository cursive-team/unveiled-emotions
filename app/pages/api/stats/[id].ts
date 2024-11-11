import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const responses = await prisma.submission.groupBy({
    by: ["digest"],
    where: {
      photoId: Number(id),
    },
    _count: {
      digest: true,
    },
  });

  const stats = responses.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.digest]: curr._count.digest,
    }),
    {}
  );

  res.status(200).json(stats);
}

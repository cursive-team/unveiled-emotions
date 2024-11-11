import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import { generate, PoseidonProof } from "@zk-kit/poseidon-proof";
import { sha256 } from "js-sha256";
import { jura } from "../../styles/fonts";
import { PieChart } from "react-minimal-pie-chart";

const artIds = ["1", "2", "3", "4", "5", "6"];

const artWorkName: Record<string, string> = {
  "1": "0xe761be04f45373e0206a3fa2e56dd7650fadf457de098ce1ade717f1199bef3",
  "2": "0x1be2cb2c4128c38261b7d550032944d5c7072dc5d4367458d1acfbb03dbfee75",
  "3": "0x63cd959da74f531c29ed7b2a73a643a179b39025e6b3ab3c2fcda5da38469f2",
  "4": "0x2482733b4f49911cb6d56c081c5a78ab80a3d3dad7cdae4940979f4c3468b0b1",
  "5": "0x20aa66b1a1b546ddfadd9ca28d9a8a8fdbd08245d55c371b09a38dd5aecbf4e1",
  "6": "0x92fdff7dd4ee8e6f2c6d630c9f9794bf1b4cd2e304fa07af51b1bd447c85b68",
};

export default function PhotoPage() {
  const router = useRouter();
  const { id } = router.query;
  const [emotion, setEmotion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(null);
  const [userHash, setUserHash] = useState<string | null>(null);
  const [digestStats, setDigestStats] = useState<Record<string, number>>({});
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (showStats && id) {
      // Fetch stats for this specific photo
      fetch(`/api/stats/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setDigestStats(data);
          console.log(data);
        });
    }
  }, [showStats, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotion || !id) return;

    setIsSubmitting(true);
    try {
      // Convert emotion to lowercase before processing
      const normalizedEmotion = emotion.toLowerCase().trim();

      // Create message hash from normalized emotion
      const messageHash = BigInt("0x" + sha256(normalizedEmotion));

      // Generate the ZK proof
      const fullProof: PoseidonProof = await generate(
        [messageHash],
        "unveiled-emotions"
      );

      console.log(id, fullProof);

      setUserEmotion(normalizedEmotion);
      setUserHash("0x" + BigInt(fullProof.digest).toString(16));

      const response = await fetch("/api/submit-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoId: id,
          fullProof,
        }),
      });

      if (response.ok) {
        setShowStats(true);
      } else {
        alert("Failed to verify proof");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating proof");
    }
    setIsSubmitting(false);
  };

  // Convert title hash to hex format for comparison
  const titleHashHex = id
    ? "0x" + artWorkName[id as keyof typeof artWorkName]
    : "";

  const getDigestColor = (digest: string) => {
    if (!userEmotion || !showStats || !userHash) return "#4B5563"; // gray-600

    if (digest === userHash) {
      return "#059669"; // cyan-600 - user's emotion
    } else if (userHash === titleHashHex) {
      return "#059669"; // emerald-600 - correct emotion
    }

    // Generate random hex color for other emotions
    const randomColor =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    return randomColor;
  };

  if (!id || !artIds.includes(id.toString())) return null;

  return (
    <>
      <Head>
        <title>Unveiling Emotions</title>
      </Head>
      {!showStats && (
        <div
          className={`min-h-screen bg-gradient-to-b from-[#1b1b1b] to-[#535353] py-6 flex flex-col justify-center sm:py-12 ${jura.className}`}
        >
          <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4 sm:px-0">
            <div className="flex flex-col items-center space-y-1">
              <h1 className="text-2xl font-bold font-jura text-center text-white tracking-widest">
                {`'Unveiling Emotions'`}
              </h1>
              <p className="text-white font-bold font-jura">by Gordon Berger</p>

              <div className="relative w-4/5 max-w-md mx-auto pt-6 pb-6">
                <Image
                  src={`/${id}.jpg`}
                  alt="Emotion artwork"
                  width={400}
                  height={400}
                  className="rounded-lg w-full"
                />
                <p className="text-xs text-gray-500 font-mono text-center mt-4 break-words whitespace-pre-wrap max-w-[300px] mx-auto">
                  Artwork Title (Hash):
                  <br />
                  {artWorkName[id as keyof typeof artWorkName]}
                </p>
              </div>

              <div className="w-4/5 max-w-md space-y-4">
                <div>
                  <p className="text-xl text-white font-jura tracking-wider text-center">
                    Looking at this artwork...
                  </p>
                  <p className="text-xl text-white font-jura tracking-wider text-center">
                    What do you feel?
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input
                    type="text"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value)}
                    className="w-full bg-[#5d6c69] text-white px-4 py-3 rounded-md font-jura 
                           border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Choose 1 emotion"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !emotion.trim()}
                    className="w-full py-3 px-4 font-jura tracking-wider text-white 
                           bg-gradient-to-r from-blue-600 to-indigo-600
                           rounded-md hover:from-blue-700 hover:to-indigo-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>

                  <p className="text-sm text-gray-400 font-mono text-center">
                    You will submit the hash of your emotion & a ZKP that you
                    know the pre-image. This way we can determine if you felt
                    the same as the artist while maintaning privacy over your
                    own experience of the art.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div
          className={`min-h-screen bg-gradient-to-b from-[#1b1b1b] to-[#535353] py-6 flex flex-col items-center ${jura.className}`}
        >
          <div className="flex flex-col items-center w-full space-y-8">
            <div className="flex flex-col items-center space-y-1">
              <h1 className="text-2xl font-bold font-jura text-center text-white tracking-widest">
                {`'Unveiling Emotions'`}
              </h1>
              <p className="text-white font-bold font-jura">by Gordon Berger</p>
            </div>

            <div className="relative w-2/5 aspect-square mb-8">
              <Image
                src={`/${id}.jpg`}
                alt="Emotion artwork"
                width={400}
                height={400}
                className="rounded-lg w-full"
              />
              <p className="text-xs text-gray-500 font-mono text-center mt-4 break-words whitespace-pre-wrap">
                Title Hash:
                <br />
                {artWorkName[id as keyof typeof artWorkName]}
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="mb-8">
                <p className="text-white text-xl mb-2">
                  Your Answer:{" "}
                  <span className="text-cyan-400">{userEmotion}</span>
                </p>
                <p className="text-xs text-gray-500 font-mono text-center mt-4 break-words whitespace-pre-wrap max-w-[300px] mx-auto">
                  Hash: {userHash}
                </p>
              </div>

              <div className="mb-8">
                <p className="text-white text-xl mb-2">
                  Other People That Felt Same:{" "}
                  <span className="text-cyan-400">
                    {(
                      ((digestStats[userHash || ""] || 0) /
                        Object.values(digestStats).reduce((a, b) => a + b, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </p>
              </div>

              <p className="text-white mb-4 text-xl">
                Distribution of All Answers:
              </p>

              <div className="relative w-full aspect-square mb-8">
                <PieChart
                  data={Object.entries(digestStats).map(([digest, count]) => ({
                    title: digest,
                    value: count,
                    color: getDigestColor(emotion),
                  }))}
                  radius={42}
                  segmentsStyle={{ transition: "stroke .3s" }}
                  labelPosition={75}
                />
              </div>

              <div className="flex flex-col items-center w-full">
                <p className="text-white text-xl text-center break-words whitespace-pre-wrap max-w-[300px]">
                  Your Answer{" "}
                  {userHash === artWorkName[id as keyof typeof artWorkName]
                    ? "Matches With The Artist!"
                    : "Doesn't Match With The Artist's Emotion."}{" "}
                  Only{" "}
                  <span className="text-cyan-400">
                    {(
                      ((digestStats[
                        artWorkName[id as keyof typeof artWorkName]
                      ] || 0) /
                        Object.values(digestStats).reduce((a, b) => a + b, 0)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>{" "}
                  Guessed It
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setUserEmotion(null);
                    setShowStats(false);
                    setEmotion("");
                  }}
                  className="px-6 py-3 bg-[#2d2d2d] text-white rounded-full hover:bg-[#3d3d3d] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

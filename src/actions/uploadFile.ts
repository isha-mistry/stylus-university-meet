// "use client";
import lighthouse from "@lighthouse-web3/sdk";
import { NFT_LIGHTHOUSE_BASE_API_KEY } from "@/config/constants";
import { Buffer } from "buffer";

export const uploadFile = async (
  arrayBuffer: ArrayBuffer | any,
  roomId: string | undefined
) => {
  // const arrayBuffer = await arrayBuffer.arrayBuffer();
  try {
    const apiKey = NFT_LIGHTHOUSE_BASE_API_KEY || "";
    if (!apiKey) {
      throw new Error("Lighthouse API key is not set");
    }

    const buffer = Buffer.from(arrayBuffer);

    // const file = new File([buffer], "image.png", { type: "image/png" });
    const blob = new Blob([buffer], { type: "image/jpeg" });
    const file = new File([blob], `${roomId}-nft.jpg`, {
      type: "image/jpeg",
    });

    const uploadResponse = await lighthouse.upload([file], apiKey);

    if (!uploadResponse || !uploadResponse.data) {
      throw new Error("Upload failed: Invalid response from Lighthouse");
    }

    return uploadResponse.data;
  } catch (error: any) {
    console.error("Error uploading to Lighthouse:", error.message);
    throw error;
  }
};

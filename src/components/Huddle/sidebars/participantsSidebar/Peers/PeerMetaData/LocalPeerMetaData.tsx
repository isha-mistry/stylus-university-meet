// import { NestedPeerListIcons, PeerListIcons } from "@/assets/PeerListIcons";
import Dropdown from "@/components/ui/Dropdown";
// import { cn } from "@/components/utils/helpers";
import Image from "next/image";
import HostData from "../PeerRole/HostData";
import CoHostData from "../PeerRole/CoHostData";
import SpeakerData from "../PeerRole/SpeakerData";
import ListenersData from "../PeerRole/ListenersData";
import {
  useLocalAudio,
  useLocalPeer,
  useRemotePeer,
} from "@huddle01/react/hooks";
// import useStore from "@/components/store/slices";
import { Role } from "@huddle01/server-sdk/auth";
import { memo, useState } from "react";
import clsx from "clsx";
import { cn } from "@/utils/helpers";
import { NestedPeerListIcons, PeerListIcons } from "@/utils/PeerListIcons";
import { useStudioState } from "@/store/studioState";
import { useAccount } from "wagmi";
import { useWalletAddress } from "@/app/hooks/useWalletAddress";
import { getAccessToken } from "@privy-io/react-auth";
import GuestData from "../PeerRole/GuestData";
import { IoCopy } from "react-icons/io5";
import { Tooltip } from "@nextui-org/react";
interface PeerMetaDatProps {
  isRequested?: boolean;
  className?: string;
}

const PeerMetaData: React.FC<PeerMetaDatProps> = ({
  className,
  isRequested,
}) => {
  const { metadata, peerId, role, updateRole, updateMetadata } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
    walletAddress: string;
  }>();
  const { name, avatarUrl } = useStudioState();
  const me = useLocalPeer();
  const [tooltipContent, setTooltipContent] = useState("Copy");
  const [animatingButtons, setAnimatingButtons] = useState<{
    [key: string]: boolean;
  }>({});

  const RoleData = {
    host: peerId && <HostData peerId={peerId} />,
    coHost: peerId && <CoHostData peerId={peerId} />,
    speaker: peerId && <SpeakerData peerId={peerId} />,
    listener: peerId && <ListenersData peerId={peerId} />,
    guest: peerId && <GuestData peerId={peerId} />,
  } as const;

  const {
    enableAudio,
    disableAudio,
    stream: micStream,
    isAudioOn,
  } = useLocalAudio();

  const { address } = useAccount();
  const { walletAddress } = useWalletAddress();

  // const { peerId: remotePeerIds } = useRemotePeer({ peerId });

  // const removeRequestedPeers = useStore((state) => state.removeRequestedPeers);

  const handleAddrCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setTooltipContent("Copied");

    setAnimatingButtons((prev) => ({
      ...prev,
      [addr]: true,
    }));

    setTimeout(() => {
      setTooltipContent("Copy");
      setAnimatingButtons((prev) => ({
        ...prev,
        [addr]: false,
      }));
    }, 4000);
  };

  return (
    <div className={cn(className, "flex items-center justify-between w-full")}>
      <div className="flex items-center gap-2">
        {metadata?.avatarUrl &&
        metadata.avatarUrl !== "/avatars/avatars/0.png" ? (
          <div className="w-6 h-6">
            <Image
              src={metadata?.avatarUrl}
              alt="image"
              className="maskAvatar object-cover"
              width={100}
              height={100}
            />
          </div>
        ) : (
          <div className="flex text-sm font-semibold items-center justify-center w-6 h-6 bg-[#004DFF] text-gray-200 rounded-full">
            {metadata?.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex text-slate-400 text-sm font-normal">
          {metadata?.displayName} (You)
          <Tooltip
            content={tooltipContent}
            placement="right"
            closeDelay={1}
            showArrow
          >
            <div
              className={`pl-2 pt-[2px] cursor-pointer  ${
                animatingButtons[metadata?.walletAddress || ""]
                  ? "text-blue-500"
                  : "text-[#3E3D3D]"
              }`}
            >
              <IoCopy
                onClick={() => handleAddrCopy(`${metadata?.walletAddress}`)}
              />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          onClick={() => {
            // if (peerId === localPeerId) {
            updateMetadata({
              displayName: metadata?.displayName ?? "Guest",
              avatarUrl: metadata?.avatarUrl ?? "/avatars/avatars/0.png",
              isHandRaised: !metadata?.isHandRaised,
              walletAddress: metadata?.walletAddress || walletAddress || "",
            });
            // }
          }}
          className="cursor-pointer"
        >
          {metadata?.isHandRaised
            ? NestedPeerListIcons.active.hand
            : NestedPeerListIcons.inactive.hand}
        </div>
        {role !== "listener" && (
          <div
            onClick={() => {
              if (role && ["host", "guest"].includes(role)) {
                isAudioOn ? disableAudio() : enableAudio();
              }
            }}
            className="cursor-pointer"
          >
            {isAudioOn
              ? NestedPeerListIcons.active.mic
              : NestedPeerListIcons.inactive.mic}
          </div>
        )}
        {/* {me.role === Role.HOST && ( */}
        <div className="flex items-center cursor-pointer">
          <Dropdown
            triggerChild={<div>{NestedPeerListIcons.inactive.more}</div>}
            align="end"
          >
            {role && RoleData[role as keyof typeof RoleData]}
          </Dropdown>
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default memo(PeerMetaData);

interface IAcceptDenyProps {
  onAccept?: () => void;
  onDeny?: () => void;
}

const AcceptDenyGroup: React.FC<IAcceptDenyProps> = ({ onAccept, onDeny }) => (
  <div className="flex items-center gap-4">
    <div role="presentation" onClick={onAccept}>
      {PeerListIcons.accept}
    </div>
    <div role="presentation" onClick={onDeny}>
      {PeerListIcons.deny}
    </div>
  </div>
);

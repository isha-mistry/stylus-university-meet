import { APP_BASE_URL } from "@/config/constants";
import { SessionInterface } from "@/types/MeetingTypes";
import { fetchApi } from "@/utils/api";
import toast from "react-hot-toast";

export const startRecording = async (
  roomId: string | undefined,
  setIsRecording: (val: boolean | null) => void,
  address: string,
  token: string
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (address) {
      myHeaders.append("x-wallet-address", address);
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        roomId: roomId,
      }),
    };

    const status = await fetchApi(`/startRecording/${roomId}`, requestOptions);
    if (!status.ok) {
      console.error(`Request failed with status: ${status.status}`);
      toast.error("Failed to start recording");
      return;
    }
    setIsRecording(true);
    toast.success("Recording started");
  } catch (error) {
    console.error("Error starting recording:", error);
    toast.error("Error starting recording");
  }
};

export const handleStopRecording = async (
  roomId: string | undefined,
  address: string | undefined,
  token: string | undefined,
  setIsRecording: (val: boolean | null) => void
) => {
  if (!roomId) {
    console.error("roomId is undefined");
    return;
  }

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (address) {
      myHeaders.append("x-wallet-address", address);
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        roomId: roomId,
      }),
    };
    const response = await fetchApi(`/stopRecording/${roomId}`, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error(`Request failed with status: ${response.status}`);
      toast.error("Failed to stop recording");
      return;
    }

    // setIsRecording(false);
    if (data.success === true) {
      toast.success("Recording stopped");
      const success = true;
      return success;
    }
  } catch (error) {
    console.error("Error during stop recording:", error);
    toast.error("Error during stop recording");
  }
};

export const handleCloseMeeting = async (
  address: string | undefined,
  token: string | null,
  meetingCategory: string,
  roomId: string | undefined,
  hostAddress: string,
  meetingData: SessionInterface | undefined,
  isRecording: boolean | null
) => {
  // if (role === "host") {
  let meetingType;
  if (meetingCategory === "officehours") {
    meetingType = 2;
  } else if (meetingCategory === "session") {
    meetingType = 1;
  } else {
    meetingType = 0;
  }

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (address) {
      myHeaders.append("x-wallet-address", address);
      myHeaders.append("Authorization", `Bearer ${token}`);
    }
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        roomId: roomId,
        meetingType: meetingType,
        hostAddress: hostAddress,
        token: token,
      }),
    };

    const response = await fetchApi(`/end-call`, requestOptions);
    const result = await response.json();

    // const storedStatus = sessionStorage.getItem("meetingData");
    // let meetingStatus;

    // if (storedStatus) {
    //   const parsedStatus = JSON.parse(storedStatus);
    //
    //   if (parsedStatus.meetingId === roomId) {
    //     meetingStatus = parsedStatus.isMeetingRecorded;
    //   }
    // }

    if (
      meetingCategory === "session" &&
      isRecording === true &&
      result.success
    ) {
      try {
        toast.success("Giving Attestations");
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        if (address) {
          myHeaders.append("x-wallet-address", address);
          myHeaders.append("Authorization", `Bearer ${token}`);
        }
        const response = await fetchApi(`/get-attest-data`, {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            roomId: roomId,
            connectedAddress: address,
            meetingData: meetingData,
          }),
        });
        const response_data = await response.json();
        if (response_data.success) {
          toast.success("Attestation successful");
        }
      } catch (e) {
        console.log("Error in attestation: ", e);
        toast.error("Attestation denied");
      }
    }
  } catch (error) {
    console.error("Error handling end call:", error);
  }
  // }
};

export const handleRecording = async (
  roomId: string | undefined,
  address: string | undefined,
  privyToken: string | undefined,
  isRecording: boolean | null,
  setIsRecording: (val: boolean | null) => void,
  meetingRecordingStatus: boolean,
  setMeetingRecordingStatus: (val: boolean) => void
) => {
  if (meetingRecordingStatus) {
    setMeetingRecordingStatus(false);
    handleStopRecording(roomId, address, privyToken, setIsRecording);
    let existingValue = sessionStorage.getItem("meetingData");
    if (existingValue) {
      let parsedValue = JSON.parse(existingValue);
      parsedValue.recordingStatus = false;

      // Step 3: Store the updated value back in sessionStorage
      sessionStorage.setItem("meetingData", JSON.stringify(parsedValue));
    }
  } else {
    setMeetingRecordingStatus(true);

    startRecording(
      roomId,
      setIsRecording,
      address ? address : "",
      privyToken ? privyToken : ""
    );
    let existingValue = sessionStorage.getItem("meetingData");
    if (existingValue) {
      let parsedValue = JSON.parse(existingValue);
      if (parsedValue.meetingId === roomId) {
        if (parsedValue.isMeetingRecorded === false) {
          parsedValue.isMeetingRecorded = true;
        }
        parsedValue.recordingStatus = true;
      }

      // Step 3: Store the updated value back in sessionStorage
      sessionStorage.setItem("meetingData", JSON.stringify(parsedValue));
    }
  }
};

import UpdateSessionDetails from "@/components/MeetingPreview/UpdateSessionDetails";
import React from "react";

function page({ params }: { params: { roomId: string } }) {
  return (
    <div>
      <UpdateSessionDetails roomId={params.roomId} meetingType={"session"} />
    </div>
  );
}

export default page;

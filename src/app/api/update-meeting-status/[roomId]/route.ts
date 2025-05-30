import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";
import { SOCKET_BASE_URL } from "@/config/constants";
import { io } from "socket.io-client";
import { getDisplayNameOrAddr } from "@/utils/NotificationUtils";

export async function PUT(req: NextRequest, res: NextResponse) {
  const { meetingId, meetingType, additionalData } = await req.json();

  const {
    sessionType,
    callerAddress,
    hostAddress,
    attendeeAddress,
    hostJoinedStatus,
    attendeeJoinedStatus,
    meetingData,
  } = await additionalData;

  try {
    // Connect to MongoDB database
    const client = await connectDB();

    const collectionName =
      meetingType === "session" ? "sessions" : "office_hours";
    const db = client.db();
    const collection = db.collection(collectionName);

    if (collectionName === "office_hours") {
      const officeHours = await collection.findOneAndUpdate(
        { meetingId },
        { $set: { meeting_status: "ongoing" } }
      );

      client.close();

      return NextResponse.json(officeHours, { status: 200 });
    } else if (collectionName === "sessions") {
      if (sessionType === "session") {
        const userENSNameOrAddress = await getDisplayNameOrAddr(
          attendeeAddress
        );
        const hostENSNameOrAddress = await getDisplayNameOrAddr(hostAddress);
        if (callerAddress === hostAddress) {
          const sessions = await collection.findOneAndUpdate(
            { meetingId },
            {
              $set: {
                meeting_status: "Ongoing",
                host_joined_status: "Joined",
              },
            },
            {
              returnDocument: "after",
            }
          );
          if (hostJoinedStatus === "Pending") {
            const notificationToGuest = {
              receiver_address: attendeeAddress,
              content: `Your session on ${meetingData.dao_name} titled "${meetingData.title}" has been started by the host ${hostENSNameOrAddress}.`,
              createdAt: Date.now(),
              read_status: false,
              notification_name: "sessionStartedByHost",
              notification_title: "Session Started",
              notification_type: "newBooking",
              additionalData: meetingData,
            };

            const notificationCollection = db.collection("notifications");

            const notificationResult = await notificationCollection.insertOne(
              notificationToGuest
            );

            if (notificationResult.insertedId) {
              const insertedNotification = await notificationCollection.findOne(
                { _id: notificationResult.insertedId }
              );
            }

            const dataToSendGuest = {
              ...notificationToGuest,
              _id: notificationResult.insertedId,
            };

            const socket = io(`${SOCKET_BASE_URL}`, {
              withCredentials: true,
            });
            socket.on("connect", () => {
              socket.emit("session_started_by_host", {
                attendeeAddress,
                dataToSendGuest,
              });
              socket.disconnect();
            });

            socket.on("connect_error", (err) => {
              console.error("WebSocket connection error:", err);
            });

            socket.on("error", (err) => {
              console.error("WebSocket error:", err);
            });
          }
          client.close();
          return NextResponse.json(sessions, { status: 200 });
        } else if (callerAddress === attendeeAddress) {
          const sessions = await collection.findOneAndUpdate(
            { meetingId },
            {
              $set: {
                // meeting_status: "Ongoing",
                "attendees.$[elem].attendee_joined_status": "Joined",
              },
            },
            {
              arrayFilters: [{ "elem.attendee_address": attendeeAddress }],
              returnDocument: "after",
            }
          );
          if (attendeeJoinedStatus === "Pending") {
            const notificationToHost = {
              receiver_address: hostAddress,
              content: `Your session on ${meetingData.dao_name} titled "${meetingData.title}" has been started by the attendee ${userENSNameOrAddress}.`,
              createdAt: Date.now(),
              read_status: false,
              notification_name: "sessionStartedByGuest",
              notification_title: "Session Started",
              notification_type: "newBooking",
              additionalData: meetingData,
            };

            const notificationCollection = db.collection("notifications");

            const notificationResult = await notificationCollection.insertOne(
              notificationToHost
            );

            if (notificationResult.insertedId) {
              const insertedNotification = await notificationCollection.findOne(
                { _id: notificationResult.insertedId }
              );
            }

            const dataToSendHost = {
              ...notificationToHost,
              _id: notificationResult.insertedId,
            };

            const socket = io(`${SOCKET_BASE_URL}`, {
              withCredentials: true,
            });
            socket.on("connect", () => {
              console.log("Connected to WebSocket server from API");
              socket.emit("session_started_by_guest", {
                hostAddress,
                dataToSendHost,
              });
              console.log("Message sent from API to socket server");
              socket.disconnect();
            });

            socket.on("connect_error", (err) => {
              console.error("WebSocket connection error:", err);
            });

            socket.on("error", (err) => {
              console.error("WebSocket error:", err);
            });
          }
          client.close();
          return NextResponse.json(sessions, { status: 200 });
        }
      } else if (sessionType === "instant-meet") {
        const sessions = await collection.findOneAndUpdate(
          { meetingId },
          {
            $set: {
              meeting_status: "Ongoing",
              host_joined_status: hostJoinedStatus,
            },
          },
          { returnDocument: "after" }
        );
        client.close();
        return NextResponse.json(sessions, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error fetching office hours:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import GameApi from "@/app/api/game";
import AppLoader from "@/app/components/loader/loader";
import { Game, initialGame } from "@/app/store/gameSlice";
import CustomTextField from "@/app/utils/CustomTextField";
import { formatNaira } from "@/app/utils/utils";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import QuestionBox from "./questionBox";

function Page() {
  const params = useParams();
  const [fetchedData, setFetchedData] = useState<Game>(initialGame);
  const [fetchingData, setFetchingData] = useState(false);

  React.useEffect(() => {
    const fetchGames = async () => {
      if (!params.id) return;
      try {
        const res = await GameApi.getGameById(`${params.id}`);
        console.log(res.data.result);
        setFetchedData(res.data.result);
        setFetchingData(false);
      } catch (error: any) {
        console.log(error);
        toast.error("An error occurred loading games, please refresh.");
        setFetchingData(false);
      }
    };

    fetchGames();
  }, [params.id]);

  if (fetchingData) {
    return <AppLoader />;
  }
  console.log(fetchedData);
  if (!fetchedData) return <p>No Data</p>;
  const isoString = fetchedData?.startDate?.iso;
  const dateObj = isoString ? new Date(isoString) : null;
  const options = { timeZone: "Africa/Lagos", hour12: false };

  const formattedDate = dateObj
    ? new Intl.DateTimeFormat("en-CA", {
        ...options,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(dateObj)
    : "";
  const formattedTime = dateObj
    ? new Intl.DateTimeFormat("en-GB", {
        ...options,
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj)
    : "";

  return (
    <>
      <div className="space-y-10">
        <div className="w-full bg-white p-4 rounded-lg space-y-8">
          <h3 className="font-medium text-xl font-heading">Game Details</h3>

          <div className="font-heading grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CustomTextField
              label="Game Name"
              placeholder="Trivia"
              type="text"
              name="name"
              value={fetchedData?.name}
              readOnly
              className="capitalize"
            />

            <CustomTextField
              label="Entry Fee"
              placeholder="₦1,000"
              type="text"
              name="entryFee"
              value={formatNaira(Number(fetchedData?.entryFee))}
              // inputMode="numeric"
              // pattern="[0-9]*"
              readOnly
            />

            <CustomTextField
              label="Game Prize"
              type="string"
              placeholder="₦1,000"
              name="gamePrize"
              value={formatNaira(Number(fetchedData?.gamePrize))}
              //   inputMode="numeric"
              readOnly
            />
            <CustomTextField
              label="Start Date"
              type="date"
              name="fullDate"
              value={formattedDate}
              readOnly
            />
            <CustomTextField
              label="Game Time"
              type="time"
              name="time"
              value={formattedTime}
              readOnly
            />
            <CustomTextField
              label="Share Prize Between"
              name="numOfShare"
              type="text"
              value={`${fetchedData?.numOfShare}`}
              readOnly
            />
          </div>
        </div>

        {/* Questions   */}

        <>
          {fetchedData?.questions?.length > 0 ? (
            <>
              {fetchedData?.questions?.map((question, index) => (
                <QuestionBox
                  key={index}
                  questionNumber={index}
                  questions={fetchedData?.questions}
                />
              ))}
            </>
          ) : (
            <div className="bg-white rounded-lg p-4">
              <p>No Questions Set!</p>
            </div>
          )}
        </>
      </div>
    </>
  );
}

export default Page;

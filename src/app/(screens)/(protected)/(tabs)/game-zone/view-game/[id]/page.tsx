/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import GameApi from '@/app/api/game';
import AppLoader from '@/app/components/loader/loader';
import {
  Game,
  initialGame,
  setCurrentGame,
  clearCurrentGame,
} from '@/app/store/gameSlice';
import { useAppDispatch } from '@/app/hooks/useAuth';
import CustomTextField from '@/app/utils/CustomTextField';
import { formatNaira } from '@/app/utils/utils';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import QuestionBox from './questionBox';

function Page() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [fetchedData, setFetchedData] = useState<Game>(initialGame);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      if (!params.id) return;

      try {
        setFetchingData(true);
        const res = await GameApi.getGameByIdV2(`${params.id}`);
        const result = res?.data?.data;

        const transformedGame: Game = {
          objectId: result.gameId,
          name: result.name,
          startDate: {
            iso: result.startTime,
          },
          completed: false,
          entryFee: String(result?.fee ?? 0),
          gamePrize: result.prize,
          coinPrize: result.coinPrize,
          prizeBetween: result?.prizeBetween ?? 0,
          coinPrizeBetween: result?.coinPrizeBetween ?? 0,
          winners: [],
          users: [],
          userTimes: [],
          videoAds: { name: '', url: '' },
          music: { name: '', url: '' },
          createdAt: '',
          updatedAt: '',
          questions: result.questions.map((apiQuestion) => ({
            number: String(apiQuestion.order),
            question: apiQuestion.question,
            options: apiQuestion.options.map((option) => option.option),
            correctAnswer:
              apiQuestion.options.find((opt) => opt.answer)?.option || '',
          })),
          gameDescription: result.description || '',
          leaderboardLimit: result.leaderboardLimit || 0,
          leaderboardPercentage: result.leaderboardPercentage || 0,
        };

        setFetchedData(transformedGame);
        dispatch(setCurrentGame(transformedGame));

        setFetchingData(false);
      } catch (error: any) {
        console.error('error: ', error);
        toast.error('An error occurred loading games, please refresh.');
        setFetchingData(false);
      }
    };

    fetchGames();

    return () => {
      dispatch(clearCurrentGame());
    };
  }, [params.id, dispatch]);

  if (fetchingData) {
    return <AppLoader />;
  }

  if (!fetchedData) return <p>No Data</p>;

  const isoString = fetchedData?.startDate?.iso;
  const dateObj = isoString ? new Date(isoString) : null;

  const formattedDateTime = dateObj
    ? new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : '';

  return (
    <>
      <div className="space-y-10">
        <div className="w-full space-y-8 rounded-lg bg-white p-4">
          <h3 className="font-heading text-xl font-medium">Game Details</h3>

          <div className="font-heading grid grid-cols-1 gap-5 lg:grid-cols-2">
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
              readOnly
            />

            <CustomTextField
              label="Game Prize"
              type="string"
              placeholder="₦1,000"
              name="gamePrize"
              value={formatNaira(Number(fetchedData?.gamePrize))}
              readOnly
            />

            <CustomTextField
              label="Coin Prize"
              type="string"
              placeholder="₦1,000"
              name="coinPrize"
              value={formatNaira(Number(fetchedData?.coinPrize))}
              readOnly
            />

            <CustomTextField
              label="Game Date & Time"
              type="datetime-local"
              name="startDateTime"
              value={formattedDateTime}
              readOnly
            />

            <CustomTextField
              label="Share Prize Between Winners (%)"
              name="prizeBetween"
              type="text"
              value={`${fetchedData?.prizeBetween}`}
              readOnly
            />

            <CustomTextField
              label="Share Coin Prize Between Winners (%)"
              name="coinPrizeBetween"
              type="text"
              value={`${fetchedData?.coinPrizeBetween}`}
              readOnly
            />
            <CustomTextField
              label="Leaderboard Limit"
              name="leaderboardLimit"
              type="text"
              value={`${fetchedData?.leaderboardLimit ?? 0}`}
              readOnly
            />
            <CustomTextField
              label="Leaderboard Percentage"
              name="leaderboardPercentage"
              type="text"
              value={`${fetchedData?.leaderboardPercentage ?? 0}`}
              readOnly
            />
          </div>
        </div>

        {/* Questions */}
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
            <div className="rounded-lg bg-white p-4">
              <p>No Questions Set!</p>
            </div>
          )}
        </>
      </div>
    </>
  );
}

export default Page;

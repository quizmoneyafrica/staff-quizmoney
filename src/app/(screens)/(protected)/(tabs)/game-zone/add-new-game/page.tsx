'use client';
import { useAppDispatch, useAppSelector } from '@/app/hooks/useAuth';
import { Game, setCreateGameField } from '@/app/store/gameSlice';
import CustomButton from '@/app/utils/CustomBtn';
import CustomTextField from '@/app/utils/CustomTextField';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AddGameQuestions from './AddGameQuestions';
import { CircleArrowLeft } from '@/app/icons/icons';

function Page() {
  const [step, setStep] = React.useState<number>(0);
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.game.createGame);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  React.useEffect(() => {
    if (dateInput && timeInput) {
      const nigerianTimeString = `${dateInput}T${timeInput}:00`;
      const localDate = new Date(nigerianTimeString);
      const utcDate = new Date(localDate.getTime() - 60 * 60 * 1000);

      dispatch(
        setCreateGameField({
          field: 'startDate',
          value: { iso: utcDate.toISOString() },
        }),
      );
    }
  }, [dateInput, timeInput, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Temporary local state
    if (name === 'fullDate') {
      setDateInput(value);
      return;
    }

    if (name === 'time') {
      setTimeInput(value);
      return;
    }

    // Allowed fields in Game interface
    const allowedFields: (keyof Game)[] = [
      'name',
      'entryFee',
      'gamePrize',
      'numOfShare',
    ];
    if (allowedFields.includes(name as keyof Game)) {
      dispatch(
        setCreateGameField({
          field: name as keyof Game,
          value: ['entryFee', 'gamePrize', 'numOfShare'].includes(name)
            ? Number(value)
            : value,
        }),
      );
    }
  };
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'music' | 'videoAds',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size limit for music (10MB)
    if (type === 'music' && file.size > 10 * 1024 * 1024) {
      toast.error('Music file size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];

      dispatch(
        setCreateGameField({
          field: 'videoAds',
          value: {
            name: file.name,
            url: base64,
          },
        }),
      );
    };

    reader.readAsDataURL(file);
  };

  const handleStep = (step: number) => {
    setStep(step);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleStep(1);
    // handle saving game logic here
  };
  console.log(game);

  return (
    <>
      {step === 1 && (
        <div className="mb-3" onClick={() => handleStep(0)}>
          <button className="flex items-center gap-1">
            <CircleArrowLeft /> Back
          </button>
        </div>
      )}
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
            <h2 className="text-base font-black">Add New Game</h2>
          </div>

          <div className="w-full space-y-8 rounded-lg bg-white p-4">
            <h3 className="font-heading text-xl font-medium">
              Enter Game Details
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="font-heading grid grid-cols-1 gap-5 lg:grid-cols-2">
                <CustomTextField
                  label="Game Name"
                  placeholder="Trivia"
                  type="text"
                  name="name"
                  value={game.name}
                  className="capitalize"
                  onChange={handleChange}
                  required
                />

                <CustomTextField
                  label="Entry Fee (₦)"
                  placeholder="1000"
                  type="number"
                  name="entryFee"
                  value={game.entryFee}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={handleChange}
                  required
                />
                <CustomTextField
                  label="Game Prize (₦)"
                  name="gamePrize"
                  type="text"
                  value={`${game.gamePrize}`}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />

                <CustomTextField
                  label="Start Date"
                  type="date"
                  name="fullDate"
                  value={dateInput}
                  onChange={handleChange}
                  required
                />

                <CustomTextField
                  label="Game Time"
                  type="time"
                  name="time"
                  value={timeInput}
                  onChange={handleChange}
                  required
                />

                <CustomTextField
                  label="Share Prize Between"
                  name="numOfShare"
                  type="text"
                  value={`${game.numOfShare}`}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />

                <CustomTextField
                  label="Game Background music (Ad)"
                  type="file"
                  accept="audio/mpeg"
                  name="music"
                  onChange={(e) => handleFileChange(e, 'music')}
                />

                <CustomTextField
                  label="Game Video Ad"
                  type="file"
                  accept="video/mp4"
                  name="videoAds"
                  onChange={(e) => handleFileChange(e, 'videoAds')}
                />
              </div>

              <div className="pb-5 pt-8">
                <CustomButton type="submit">Create Game</CustomButton>
              </div>
            </form>
          </div>
        </div>
      )}
      {step === 1 && <AddGameQuestions />}
    </>
  );
}

export default Page;

import { getAuthUser } from '@/app/api/userApi';
// import { useAppDispatch, useAppSelector } from "@/app/hooks/useAuth";
import React from 'react';

function AddGameQuestions() {
  const user = getAuthUser();
  console.log('user: ', user);

  //   const dispatch = useAppDispatch();
  //   const game = useAppSelector((state) => state.game.createGame);
  return <div></div>;
}

export default AddGameQuestions;

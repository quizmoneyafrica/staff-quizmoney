/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useAppDispatch } from '@/app/hooks/useAuth';
import { useEffect } from 'react';
import { liveQueryClient } from '@/app/api/parse/parseClient';
import Parse from 'parse';

function HomeQueries() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let gameSubscription: any;
    let topGamersSubscription: any;

    const gameDataLiveQuery = async () => {
      const query = new Parse.Query('Game');
      gameSubscription = await liveQueryClient.subscribe(query);

      gameSubscription?.on('create', (object: Parse.Object) => {
        console.log('this object was updated: ', object.toJSON());
        // dispatch(setDashboardDetails(object.toJSON()));
      });
      gameSubscription?.on('update', (object: Parse.Object) => {
        console.log('this object was updated: ', object.toJSON());
        // dispatch(setNextGameData(object.toJSON()));
      });
    };

    gameDataLiveQuery();
    return () => {
      if (gameSubscription) gameSubscription.unsubscribe();
      if (topGamersSubscription) topGamersSubscription.unsubscribe();
    };
  }, [dispatch]);
  return null;
}

export default HomeQueries;

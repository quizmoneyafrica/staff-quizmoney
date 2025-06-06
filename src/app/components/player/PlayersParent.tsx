'use client'
import React, { useEffect } from 'react'
import PlayersTable from './PlayersTable'
import UserStatsComponent from './UserStatsComponent'
import { selectPlayers, setLoadingPlayers, setPlayersData } from '@/app/store/playersSlice';
import { store } from '@/app/store/store';
import PlayersApi from '@/app/api/playersApi';
import { useSelector } from 'react-redux';


export default function PlayersParent() {
  const {playersData}=useSelector(selectPlayers)
  const fetchPlayersData = async () => {
      if (!playersData)
        try {
          store.dispatch(setLoadingPlayers(true));
          const res = await PlayersApi.fetchAdminPlayers();
          console.log('Player daata');
          
          console.log(JSON.stringify(res?.data?.result,null,2));
          
          if (res.data.result) {
            store?.dispatch(setPlayersData(res.data.result));
          }
        } catch (error) {
          console.log(error, "Sales Error");
        } finally {
          store.dispatch(setLoadingPlayers(false));
        }
    };
useEffect(()=>{
  fetchPlayersData()
},[])
  return (
       <div className="w-full max-w-full overflow-x-hidden flex flex-col gap-5   py-6">
     <UserStatsComponent/>
      <PlayersTable /></div>
  )
}
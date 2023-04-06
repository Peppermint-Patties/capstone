import { useUser } from "@supabase/auth-helpers-react";
import {useSelector} from 'react-redux'
import { useState, useEffect } from "react";
import {supabase} from '@/lib/supabase'
const Chat = () => {
    const userData = useSelector((state)=>{
        return state.user.user
    })

    const username = userData.username
    const [users, setUsers] = useState();

    const channel = supabase.channel('presenceCheck',{
        config:{
            presence:{
                key:'username'
            }
        }
    })
    useEffect(()=>{
        channel
        .subscribe(async (status)=>{
            if (status === 'SUBSCRIBED'){
                const presenceTrackStatus = await channel.track({
                    user: username
                })
                console.log(presenceTrackStatus)
            }
        })
        .on('presence',{event: 'sync'}, ()=>{
            const state = channel.presenceState()
            const usersInLobby = state.username ? state.username.map((user)=> user.user) : []
            setUsers(usersInLobby)
            console.log('this is state',state)
        })
        .on('presence',{event:'join'},({key, newPresences})=>{
            console.log(key, newPresences,"has joined")
        })
        .on('presence',{event:'leave'},({key, leftPresences})=>{
            console.log(key, leftPresences,"has left")
        })
        return()=>{
            channel.unsubscribe()
        }
    }, [])
   
    console.log('this is my username:',username)
    console.log('this is users in lobby', users)
    return(
        <div>
            <h1>{users ? users.join(', '): 'loading'}</h1>
        </div>
    )
};

export default Chat;

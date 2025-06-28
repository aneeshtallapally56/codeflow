
import {io} from "socket.io-client";

export const editorSocketInit = async () => {
const option = {
    'force new connection': true,
    reconnectionAttempts: 5,
    transports: ['websocket'],
    timeout : 10000,
    withCredentials: true, 
};
return io(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/editor`, option);
}
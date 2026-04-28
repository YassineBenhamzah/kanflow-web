import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from './axios';

let echoInstance = null;

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_APP_KEY) {
    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        forceTLS: true,
        authorizer: (channel, options) => {
            return {
                authorize: (socketId, callback) => {
                    axios.post('/broadcasting/auth', {
                        socket_id: socketId,
                        channel_name: channel.name
                    })
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        callback(true, error);
                    });
                }
            };
        },
    });
    
    window.Echo = echoInstance;
}

export default echoInstance;

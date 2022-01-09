#!/usr/bin/env python

import asyncio
import json
import pathlib
import ssl
import websockets

from room import Room

# setup
require_key = True
pass_key = 'acfd0422-feff-4869-bf32-acbda6b7445c'
max_users_per_room = None  # None or positive integer

rooms = {}  # {room_id: Room}


def verify_data(data):
    try:
        keys = data.keys()
        if 'id' not in keys or 'message' not in keys or 'language' not in keys:
            return False
    except Exception as e:
        print(e)
        return False

    return True


def user_event(room):
    return json.dumps({"users": room.get_user_count()})


async def serve(websocket, path):
    # handle query
    query = await websocket.recv()
    data = json.loads(query)

    # verify access (not really secure as it is sent in plain text, but good enough for prototyping)
    if require_key:
        if 'pass_key' not in data.keys() or data['pass_key'] != pass_key:
            print('YOU SHALL NOT PASS!')
            await websocket.send('{"error": "Closed connection due to invalid key!"}')
            return

    # verify data
    if not verify_data(data):
        print('Missing data!')
        await websocket.send('{"error": "Missing data!"}')
        return

    # get the room ID and check that it is not empty
    room_id = data['id']
    if not room_id:
        await websocket.send('{"error": "Invalid room ID!"}')
        return

    # create or get a room
    if room_id not in rooms.keys():
        print('Create room: ' + room_id)
        room = Room(max_users_per_room)
        rooms[room_id] = room
    else:
        room = rooms[room_id]

    # check if the room is full
    if room.is_full():
        print('Room "' + room_id + '" is full!')
        await websocket.send('{"error": "Room is full!"}')
        return

    # add the user to the room
    room.add_user(websocket)
    print('Added user to "' + room_id + '"')

    try:
        # inform clients of new user count
        websockets.broadcast(room.users, user_event(room))

        # keep clients updated (this is where the magic happens)
        async for message in websocket:
            try:
                data = json.loads(message)
                if verify_data(data) and data['id'] in rooms.keys():
                    room = rooms[data['id']]
                    msg = data['message']
                    lang = data['language']

                    recipients = room.get_recipients(websocket)

                    if msg and lang and recipients:
                        payload = {
                            'message': msg,
                            'language': lang,
                        }

                        websockets.broadcast(recipients, json.dumps(payload))

            except Exception as e:
                print(e)
    finally:
        try:
            if room_id in rooms.keys():
                rooms[room_id].remove_user(websocket)
                print('Removed user from: ' + room_id)
                if rooms[room_id].is_empty():
                    del rooms[room_id]
                    print('Deleted room: ' + room_id)
        except Exception as e:
            print(e)
        finally:
            if not room.is_empty():
                websockets.broadcast(room.users, user_event(room))


# ssl_cert = pathlib.Path(__file__).with_name("fullchain.pem")
# ssl_key = pathlib.Path(__file__).with_name("privkey.pem")
# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# ssl_context.load_cert_chain(ssl_cert, keyfile=ssl_key)


async def main():
    async with websockets.serve(serve, "localhost", 8081):
        print('Server running at localhost:8081')
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())

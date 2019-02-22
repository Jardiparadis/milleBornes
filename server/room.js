const uid = require('uid');

const maxPlayer = 4;

class Client {
    constructor() {
        this.uid = uid(7);
    }
}

class Room {
    constructor(uid) {
        this._players = new Map();
        this.uid = uid;
    }

    join(client) {
        this._players.set(client.uid, client);
    }

    leave(clientUid) {
        this._players.delete(clientUid);
    }
}

class RoomManager {
    constructor() {
        this._rooms = new Map();
    }

    createRoom(client, newRoomId) {
        let room = new Room(newRoomId);

        room.join(client);
        this._rooms.set(newRoomId, room)
    }

    deleteRoom(roomId) {
        this._rooms.delete(roomId);
    }

    hasRoom(roomId) {
        return this._rooms.has(roomId);
    }

    joinRoom(client, roomId) {
        this._rooms.get(roomId).join(client);
    }

    leaveRoom(client, roomId) {
        this._rooms.get(roomId).leave(client.uid);
    }

    getAllRooms() {

    }
}

module.exports = {
    RoomManager,
    Room,
    Client
};

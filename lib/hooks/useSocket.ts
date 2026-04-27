'use client'

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3004'
    socket = io(url, { withCredentials: true })
  }
  return socket
}

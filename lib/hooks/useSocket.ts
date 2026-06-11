'use client'

import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

// The socket service is always reachable at `sockets.<client-host>` (staging and
// prod both follow this pattern), so derive it from the current origin at runtime
// rather than baking it in at build time — a single client image then works in
// every environment. NEXT_PUBLIC_SOCKET_URL stays as a local-dev override only.
function socketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//sockets.${window.location.host}`
  }
  return ''
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl(), { withCredentials: true })
  }
  return socket
}

package mc

import (
	"fmt"

	"github.com/libp2p/go-libp2p-core/peer"
	pstore "github.com/libp2p/go-libp2p-core/peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

// HandleFoundPeer is called by the native driver when a new peer is found.
// Adds the peer in the PeerStore and initiates a connection with it
func HandleFoundPeer(sRemotePID string) bool {
	logger.Debug("HandleFoundPeer", zap.String("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		logger.Error("HandleFoundPeer: wrong remote peerID")
		return false
	}

	remoteMa, err := ma.NewMultiaddr(fmt.Sprintf("/mc/%s", sRemotePID))
	if err != nil {
		// Should never occur
		panic(err)
	}

	// Checks if a listener is currently running.
	gLock.RLock()

	if gListener == nil || gListener.ctx.Err() != nil {
		gLock.RUnlock()
		logger.Error("HandleFoundPeer: listener not running")
		return false
	}

	// Get snapshot of gListener
	listener := gListener

	// unblock here to prevent blocking other APIs of Listener or Transport
	gLock.RUnlock()

	// Adds peer to peerstore.
	listener.transport.host.Peerstore().AddAddr(remotePID, remoteMa,
		pstore.TempAddrTTL)

	// Peer with lexicographical smallest peerID inits libp2p connection.
	if listener.Addr().String() < sRemotePID {
		logger.Debug("HandleFoundPeer: outgoing libp2p connection")
		// Async connect so HandleFoundPeer can return and unlock the native driver.
		// Needed to read and write during the connect handshake.
		go func() {
			// Need to use listener than gListener here to not have to check valid value of gListener
			err := listener.transport.host.Connect(listener.ctx, peer.AddrInfo{
				ID:    remotePID,
				Addrs: []ma.Multiaddr{remoteMa},
			})
			if err != nil {
				logger.Error("HandleFoundPeer: async connect error", zap.Error(err))
			}
		}()

		return true
	}

	logger.Debug("HandleFoundPeer: incoming libp2p connection")
	// Peer with lexicographical biggest peerID accepts incoming connection.
	// FIXME : consider to push this code in go routine to prevent blocking native driver
	select {
	case listener.inboundConnReq <- connReq{
		remoteMa:  remoteMa,
		remotePID: remotePID,
	}:
		return true
	case <-listener.ctx.Done():
		return false
	}
}

// HandleLostPeer is called by the native driver when the connection with the peer is lost.
// Closes connections with the peer.
func HandleLostPeer(sRemotePID string) {
	logger.Debug("HandleLostPeer", zap.String("remotePID", sRemotePID))
	remotePID, err := peer.Decode(sRemotePID)
	if err != nil {
		logger.Error("HandleLostPeer: wrong remote peerID")
		return
	}

	// Checks if a listener is currently running.
	gLock.RLock()

	if gListener == nil || gListener.ctx.Err() != nil {
		gLock.RUnlock()
		logger.Error("HandleLostPeer: listener not running")
		return
	}

	// Get snapshot of gListener
	listener := gListener

	// unblock here to prevent blocking other APIs of Listener or Transport
	gLock.RUnlock()

	// Close connections with the peer.
	if err = listener.transport.host.Network().ClosePeer(remotePID); err != nil {
		logger.Error("HandleLostPeer: ClosePeer error", zap.Error(err))
	}
}

/**
 * Minimal WHEP client: POST local SDP offer, apply SDP answer from response body.
 */

/**
 * Fixes `origin + absoluteUrl` misconfiguration, e.g.
 * `http://localhost:8889/http://localhost:8889/mystream/whep` → inner WHEP URL.
 */
function normalizeWhepEndpoint(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  const stitched = /^(https?:\/\/[^/?#]+)\/+((?:https?:|\/\/).+)$/i.exec(s);
  const inner = stitched?.[2];
  if (!inner) return s;
  if (inner.startsWith("//")) {
    const proto = typeof globalThis.location?.protocol === "string" ? globalThis.location.protocol : "http:";
    return `${proto}${inner}`;
  }
  return inner;
}

export async function attachWhepPlayback(
  video: HTMLVideoElement,
  whepUrl: string,
  iceServers?: RTCIceServer[]
): Promise<() => void> {
  const pc = new RTCPeerConnection({
    iceServers: iceServers?.length ? iceServers : [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  pc.addTransceiver('video', { direction: 'recvonly' });
  pc.addTransceiver('audio', { direction: 'recvonly' });

  const stream = new MediaStream();
  pc.ontrack = (ev) => {
    ev.streams[0]?.getTracks().forEach((t) => {
      if (!stream.getTracks().includes(t)) stream.addTrack(t);
    });
    video.srcObject = stream;
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  await new Promise<void>((resolve, reject) => {
    if (pc.iceGatheringState === 'complete') {
      resolve();
      return;
    }
    const t = window.setTimeout(() => resolve(), 2500);
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        window.clearTimeout(t);
        resolve();
      }
    };
    pc.onicecandidateerror = () => {
      window.clearTimeout(t);
      reject(new Error('ICE gathering failed'));
    };
  });

  const local = pc.localDescription;
  if (!local?.sdp) {
    pc.close();
    throw new Error('No local SDP for WHEP');
  }

  const endpoint = normalizeWhepEndpoint(whepUrl);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: local.sdp,
  });

  if (!res.ok) {
    pc.close();
    throw new Error(`WHEP request failed: ${res.status} ${res.statusText}`);
  }

  const answerSdp = await res.text();
  await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

  const cleanup = () => {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    video.srcObject = null;
    pc.close();
  };

  return cleanup;
}

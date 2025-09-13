import React, { useEffect, useRef, useState } from 'react'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

// AirWrite App: Webcam + MediaPipe Hands + Canvas
export default function App() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null) // stroke canvas
  const overlayRef = useRef(null) // overlay for hand landmarks
  const [running, setRunning] = useState(false)
  const [strokes, setStrokes] = useState([]) // array of arrays of points
  const currentStroke = useRef([])
  const cameraRef = useRef(null)
  const handsRef = useRef(null)
  const emaPos = useRef({ x: 0, y: 0, z: 0 })


  useEffect(() => {
    // init MediaPipe Hands
    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    })
    hands.onResults(onResults)
    handsRef.current = hands

    const videoEl = videoRef.current
    if (!videoEl) return

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        await hands.send({ image: videoEl })
      },
      width: 720,
      height: 540,
    })
    cameraRef.current = camera

    return () => {
      camera.stop()
      hands.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function start() {
    cameraRef.current?.start()
    setRunning(true)
  }
  function stop() {
    cameraRef.current?.stop()
    setRunning(false)
  }

  function clearCanvas() {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.clearRect(0,0,c.width,c.height)
    currentStroke.current = []
    setStrokes([])
    // also clear overlay
    const o = overlayRef.current
    const octx = o.getContext('2d')
    octx.clearRect(0,0,o.width,o.height)
  }

  function exportImage() {
    // export stroke canvas as PNG
    const c = canvasRef.current
    const url = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'strokes.png'
    a.click()
  }

  function distance(a, b){
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2 + (a.z - b.z)**2)
  }

  function onResults(results) {
    // draw overlay landmarks
    const overlay = overlayRef.current
    const octx = overlay.getContext('2d')
    octx.clearRect(0,0,overlay.width, overlay.height)

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0]
      // draw connectors & landmarks for debugging
      drawConnectors(octx, landmarks, Hands.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 })
      drawLandmarks(octx, landmarks, { color: '#FF0000', lineWidth: 1 })

      // index fingertip is landmark 8
      const tip = landmarks[8]
      // tip.x, tip.y are normalized [0,1]
      const rawX = tip.x * overlay.width
      const rawY = tip.y * overlay.height
      const rawZ = tip.z || 0
      
      // Simple EMA smoothing (α = 0.3)
      const alpha = 0.2
      emaPos.current.x = alpha * rawX + (1 - alpha) * emaPos.current.x
      emaPos.current.y = alpha * rawY + (1 - alpha) * emaPos.current.y
      emaPos.current.z = alpha * rawZ + (1 - alpha) * emaPos.current.z
      
      const x = emaPos.current.x
      const y = emaPos.current.y

      // threshold: if index fingertip is extended (simple heuristic: check distance to pip joint)
      const pip = landmarks[6]
      const isExtended = (landmarks[8].y < landmarks[6].y - 0.02) // finger up (screen coords)
      const isPinched = (distance(landmarks[8], landmarks[4]) < 0.08) // finger pinched (screen coords)
      console.log(distance(landmarks[8], landmarks[4]))
      const isDown = isPinched

      // Draw small dot where tip is
      octx.fillStyle = 'rgba(255,0,0,0.8)'
      octx.beginPath(); octx.arc(x,y,6,0,Math.PI*2); octx.fill()

      // if extended, append to current stroke
      if (isDown) {
        // convert to canvas coords for stroke canvas
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const cx = 720 - x  // Mirror
        const cy = y
        // simple drawing
        if (currentStroke.current.length === 0) {
          currentStroke.current.push({x:cx,y:cy})
        } else {
          const last = currentStroke.current[currentStroke.current.length-1]
          // draw line from last to new point
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 4
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          currentStroke.current.push({x:cx,y:cy})
        }
      } else {
        // finger not extended -> end of stroke if we have points
        if (currentStroke.current.length > 0) {
          setStrokes(prev => [...prev, currentStroke.current.slice()])
          currentStroke.current = []
        }
      }
    } else {
      // no hand detected - finish any current stroke
      if (currentStroke.current.length > 0) {
        setStrokes(prev => [...prev, currentStroke.current.slice()])
        currentStroke.current = []
      }
    }
  }

  // resize canvases to match video size
  useEffect(() => {
    const v = videoRef.current
    const c = canvasRef.current
    const o = overlayRef.current
    if (!v || !c || !o) return
    v.width = 720; v.height = 540
    c.width = 720; c.height = 540
    o.width = 720; o.height = 540
  }, [])

  return (
    <div style={{padding:18}}>
      <h2>AirWrite — Webcam Air-Writing (frontend prototype)</h2>
      <div className="app">
        <div className="leftPane">
          <video ref={videoRef} className="videoElement" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="canvasOverlay" style={{pointerEvents:'none'}} />
          <canvas ref={overlayRef} className="canvasOverlay" style={{pointerEvents:'none'}} />
        </div>
        <div className="controls">
          <button className="btn" onClick={() => running ? stop() : start()}>{running ? 'Stop' : 'Start'}</button>
          <button className="btn small" onClick={clearCanvas}>Clear Strokes</button>
          <button className="btn small" onClick={exportImage}>Export PNG</button>

          <div style={{width:420}}>
            <h4>Strokes captured: {strokes.length + (currentStroke.current.length>0?1:0)}</h4>
            <div className="output">
              <strong>Stroke preview (points):</strong>
              <pre style={{fontSize:12}}>{JSON.stringify(strokes.concat(currentStroke.current.length>0?[currentStroke.current]:[]).map(s=>s.slice(0,10)), null, 2)}</pre>
            </div>
            <p style={{marginTop:10}}>Next steps: send canvas PNG to backend for MathPix/ML OCR to get text/LaTeX.</p>
          </div>
        </div>
      </div>
      <p style={{marginTop:18}}>Notes: This is a starting point. MediaPipe is used for reliable fingertip detection. The app draws strokes where the index finger is extended. For hackathon, you can snapshot the canvas (exportImage) and send it to MathPix or your backend for recognition.</p>
    </div>
  )
}
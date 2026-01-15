Voice-Triggered Profile Card Display - Updated Spec

  Key Requirements Confirmed

  1. ✅ Voice API: xAI Realtime API
  2. ❓ Data Source: To be determined (JSON file? Database? API?)
  3. ✅ Profile Card Design: Already exists in your app
  4. ✅ Display Duration: Manual close only (stays until user clicks X)
  5. ✅ Multiple Requests: Replace current profile (no queuing)

  ---
  Modified Code Sections

  1. Remove Queue System, Add Instant Replace

  // VoiceWidget.tsx - UPDATED

  const checkForProfileRequest = useCallback((text) => {
    const patterns = [
      /(?:show me|display|pull up)\s+([a-z\s]+?)(?:\s|$|'s|\.)/i,
      /(?:tell me about|who is)\s+([a-z\s]+?)(?:\s|$|'s|\.)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const requestedName = match[1].trim().toLowerCase();

        // Find person in data
        const person = peopleData.find(p => {
          const fullName = p.name.toLowerCase();
          const firstName = p.name.split(' ')[0].toLowerCase();
          const lastName = p.name.split(' ').pop().toLowerCase();

          return requestedName.includes(firstName) ||
                 requestedName.includes(lastName) ||
                 fullName.includes(requestedName);
        });

        if (person) {
          // 🎯 INSTANTLY REPLACE - no queue, no duplicate check
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showProfile', {
              detail: { person }
            }));
          }, 600); // Just audio sync delay
        }
      }
    }
  }, [peopleData]);

  What Changed:
  - ❌ Removed shownPeopleRef (no duplicate prevention)
  - ❌ Removed profileQueueRef (no queuing)
  - ❌ Removed isShowingProfileRef (no queue management)
  - ❌ Removed showNextProfile() function
  - ✅ Direct dispatch after 600ms audio sync

  ---
  2. Manual Close Only (No Auto-Dismiss)

  // ProfileContainer.tsx - UPDATED

  import { useState, useEffect } from 'react';
  import ProfileCard from './ProfileCard'; // Your existing component

  export default function ProfileContainer() {
    const [selectedPerson, setSelectedPerson] = useState(null);

    useEffect(() => {
      const handleShowProfile = (event) => {
        if (event.detail.person) {
          // Replace whatever is currently showing
          setSelectedPerson(event.detail.person);
        }
      };

      window.addEventListener('showProfile', handleShowProfile);

      return () => {
        window.removeEventListener('showProfile', handleShowProfile);
      };
    }, []);

    const closeProfile = () => {
      setSelectedPerson(null);
    };

    return (
      <>
        {selectedPerson && (
          <div className="profile-overlay">
            {/* Close button */}
            <button 
              onClick={closeProfile} 
              className="close-button"
              aria-label="Close profile"
            >
              ✕
            </button>

            {/* Your existing ProfileCard component */}
            <ProfileCard person={selectedPerson} />
          </div>
        )}
      </>
    );
  }

  What Changed:
  - ❌ No auto-dismiss timer
  - ✅ Profile stays until user clicks X
  - ✅ New voice request replaces current profile instantly

  ---
  3. Simplified VoiceWidget (Full Component)

  // VoiceWidget.tsx - COMPLETE SIMPLIFIED VERSION

  import { useState, useRef, useCallback } from 'react';

  export default function VoiceWidget({ peopleData }) {
    const [isActive, setIsActive] = useState(false);
    const [transcript, setTranscript] = useState('');

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);

    // Pattern matching - instant replace
    const checkForProfileRequest = useCallback((text) => {
      const patterns = [
        /(?:show me|display|pull up)\s+([a-z\s]+?)(?:\s|$|'s|\.)/i,
        /(?:tell me about|who is)\s+([a-z\s]+?)(?:\s|$|'s|\.)/i,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const requestedName = match[1].trim().toLowerCase();
          const person = peopleData.find(p => {
            const fullName = p.name.toLowerCase();
            const firstName = p.name.split(' ')[0].toLowerCase();
            const lastName = p.name.split(' ').pop().toLowerCase();

            return requestedName.includes(firstName) ||
                   requestedName.includes(lastName) ||
                   fullName.includes(requestedName);
          });

          if (person) {
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('showProfile', {
                detail: { person }
              }));
            }, 600);
          }
        }
      }
    }, [peopleData]);

    // WebSocket handlers
    const handleMessage = useCallback((event) => {
      const data = JSON.parse(event.data);

      // Handle transcript chunks
      if (data.type === 'response.output_audio_transcript.delta') {
        const newTranscript = transcript + data.delta;
        setTranscript(newTranscript);
        checkForProfileRequest(newTranscript);
      }

      // Handle audio playback
      if (data.type === 'response.audio.delta') {
        playAudioChunk(data.audio);
      }
    }, [transcript, checkForProfileRequest]);

    const connect = async () => {
      // Connect to your server's WebSocket endpoint
      wsRef.current = new WebSocket('ws://localhost:3000/voice');
      wsRef.current.onmessage = handleMessage;

      // Start audio capture
      await startAudioCapture();
    };

    const startAudioCapture = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 24000, channelCount: 1 }
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1,
  1);

      processorRef.current.onaudioprocess = (e) => {
        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = floatTo16BitPCM(float32);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(int16.buffer);
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
    };

    const floatTo16BitPCM = (float32Array) => {
      const int16Array = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return int16Array;
    };

    const playAudioChunk = (base64Audio) => {
      // Implement audio playback
      const audioData = atob(base64Audio);
      // ... convert to audio buffer and play
    };

    const toggleVoice = async () => {
      if (isActive) {
        wsRef.current?.close();
        audioContextRef.current?.close();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        setIsActive(false);
        setTranscript('');
      } else {
        await connect();
        setIsActive(true);
      }
    };

    return (
      <div className="voice-widget">
        <button onClick={toggleVoice}>
          {isActive ? 'Stop' : 'Start'} Voice AI
        </button>
        {transcript && <p>{transcript}</p>}
      </div>
    );
  }

  ---
  4. Backend Server (xAI Specific)

  // server.js - xAI CONFIGURATION

  const express = require('express');
  const WebSocket = require('ws');
  const http = require('http');

  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server, path: '/voice' });

  const XAI_API_KEY = process.env.XAI_API_KEY;

  wss.on('connection', (clientWs) => {
    console.log('Client connected');

    // Connect to xAI Realtime API
    const xaiWs = new WebSocket('wss://api.x.ai/v1/realtime', {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'X-Api-Version': '2024-10-01'
      }
    });

    xaiWs.on('open', () => {
      // Configure xAI session
      xaiWs.send(JSON.stringify({
        type: 'session.update',
        session: {
          voice: 'Sage', // or 'Alloy', 'Echo', 'Shimmer'
          instructions: 'You are a helpful assistant. When users ask about people, 
  provide brief helpful information.',
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500
          },
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          temperature: 0.8
        }
      }));
    });

    // Forward client audio to xAI
    clientWs.on('message', (audioData) => {
      if (xaiWs.readyState === WebSocket.OPEN) {
        xaiWs.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: audioData.toString('base64')
        }));
      }
    });

    // Forward xAI responses to client
    xaiWs.on('message', (data) => {
      const message = JSON.parse(data);
      clientWs.send(JSON.stringify(message));
    });

    clientWs.on('close', () => xaiWs.close());
    xaiWs.on('error', (err) => console.error('xAI error:', err));
  });

  server.listen(3000, () => {
    console.log('Server running on port 3000');
  });

  ---
  Behavior Examples

  Scenario 1: First Request

  User: "Show me Jane Doe"
  → Profile card appears after 600ms
  → Stays on screen until user clicks X

  Scenario 2: Replace While Showing

  User: "Show me Jane Doe"
  → Jane's card appears
  User: (without closing) "Show me John Smith"
  → Jane's card instantly replaced with John's card
  → John's card stays until user clicks X

  Scenario 3: Multiple Quick Requests

  User: "Show me Jane... actually show me John"
  → Only John's card appears (latest request wins)
  → No queuing, no stacking

  ---
  Critical Configuration Notes for Developer

  Environment Variables Needed

  # .env file
  XAI_API_KEY=your_xai_api_key_here

  xAI API Documentation

  Point them to: https://docs.x.ai/api/realtime

  Audio Settings (Must Match xAI)

  // These are required by xAI
  sampleRate: 24000      // 24kHz
  channelCount: 1        // Mono
  format: 'pcm16'        // 16-bit PCM

  ---
  Data Source - Need Clarification

  Developer needs to know:

  Where is the people data coming from?

  Option A: JSON File
  import peopleData from './data/people.json';
  <VoiceWidget peopleData={peopleData} />

  Option B: Database Query
  const [peopleData, setPeopleData] = useState([]);

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.json())
      .then(setPeopleData);
  }, []);

  <VoiceWidget peopleData={peopleData} />

  Option C: Existing State/Context
  // If already loaded in your app
  import { usePeople } from './context/PeopleContext';

  const peopleData = usePeople();
  <VoiceWidget peopleData={peopleData} />

  ❗ Developer should ask you: "Where do I get the people data from?"

  ---
  Integration Checklist for Developer

  - Set up xAI API key in environment variables
  - Create WebSocket server on backend
  - Implement VoiceWidget component
  - Implement ProfileContainer component
  - Connect to your existing ProfileCard component
  - Clarify where people data comes from
  - Test voice commands: "show me [name]"
  - Test profile replacement (multiple requests)
  - Style close button and overlay
  - Handle edge cases (person not found)

  ---
  Simplified Architecture Diagram

  User speaks "Show me Jane"
      ↓
  [Microphone] → PCM16 audio
      ↓
  [WebSocket Client] → Server
      ↓
  [Server] → xAI API
      ↓
  [xAI] → Audio + Transcript back
      ↓
  [VoiceWidget] → Pattern match "show me Jane"
      ↓
  [600ms delay] → Sync with audio
      ↓
  [CustomEvent('showProfile')] → { person: Jane }
      ↓
  [ProfileContainer] → setState(Jane)
      ↓
  [Your ProfileCard] → Renders Jane
      ↓
  [User clicks X] → Close

  ---
  Questions Developer Should Ask You

  1. ✅ Voice API? → xAI
  2. ❓ Where is people data stored/fetched from?
  3. ✅ Profile card design? → Already exists
  4. ✅ Display duration? → Manual close
  5. ✅ Multiple profiles? → Replace current
  6. ❓ What exact fields does ProfileCard component expect? (name, photo, title,
  bio, etc.)

  ---
  That's the complete updated spec! The main changes are:
  - No queuing - instant replace
  - No auto-dismiss - manual close only
  - xAI specific configuration
  - Simpler code - removed queue management
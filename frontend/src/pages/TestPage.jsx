import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from '@vladmandic/face-api';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
export default function TestPage() {
  const { subject } = useParams();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || 'easy';
  const navigate = useNavigate();

  const [phase, setPhase] = useState('disclaimer'); // 'disclaimer', 'loading', 'active', 'submitting', 'terminated'
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);

  const questionStartRef = useRef(Date.now());
  const timePerQuestionRef = useRef([]);
  const terminatedRef = useRef(false);

  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isWebcamGranted, setIsWebcamGranted] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [faceStatus, setFaceStatus] = useState('MISSING');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const faceMissingContinuousStartRef = useRef(null);
  const baselineDescriptorRef = useRef(null);
  const gazeOffContinuousStartRef = useRef(null);

  // Anti-cheat Listeners
  useEffect(() => {
    if (phase !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden && !terminatedRef.current) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) {
            terminateExam('Tab switching or leaving the assessment area is strictly prohibited.');
          } else {
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      if (!terminatedRef.current) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) terminateExam('Repeated unauthorized right-click attempts.');
          else setShowWarningModal(true);
          return next;
        });
      }
    };
    const handleCopyPaste = (e) => {
      e.preventDefault();
      if (!terminatedRef.current) {
        terminateExam('Clipboard shortcuts (Copy/Paste) are strictly disabled.');
      }
    };

    const handleKeyDown = (e) => {
      // Prevent Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        terminateExam('Escape key pressed.');
        return;
      }
      // Prevent F5 or Ctrl+R / Cmd+R
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
      }
      // Prevent DevTools F12 or Ctrl+Shift+I / Cmd+Option+I
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') || ((e.metaKey) && e.altKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        terminateExam('Developer tools access is not allowed.');
        return;
      }
      // Prevent Copy/Paste overrides just in case (Ctrl+C, V, X, A)
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        terminateExam('Clipboard shortcuts are strictly disabled.');
        return;
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !terminatedRef.current) {
        terminateExam('Exited fullscreen mode.');
      }
    };

    const handleBeforeUnload = (e) => {
      if (!terminatedRef.current) {
        const msg = 'Are you sure you want to leave? Your exam will be terminated.';
        e.returnValue = msg;
        return msg;
      }
    };

    // Maximum Anti-Extension Countermeasures (Interval Scrubber)
    const enforceAntiCheat = setInterval(() => {
      if (terminatedRef.current) return;

      // 1. Force overwrite native object handlers (fights SuperCopy & Allow Right-Click)
      window.oncontextmenu = (e) => { e.preventDefault(); terminateExam('Right-click is strictly disabled.'); return false; };
      document.oncontextmenu = (e) => { e.preventDefault(); terminateExam('Right-click is strictly disabled.'); return false; };
      window.oncopy = (e) => { e.preventDefault(); terminateExam('Copy shortcuts disabled.'); return false; };
      document.oncopy = (e) => { e.preventDefault(); terminateExam('Copy shortcuts disabled.'); return false; };
      document.onpaste = (e) => { e.preventDefault(); terminateExam('Paste shortcuts disabled.'); return false; };
      window.onpaste = (e) => { e.preventDefault(); terminateExam('Paste shortcuts disabled.'); return false; };
      document.onselectstart = (e) => { e.preventDefault(); return false; }; // Prevent text highlighting
      
      // Force Global Keydown Overwrite (Because div events fail if not focused)
      window.onkeydown = document.onkeydown = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); terminateExam('Escape key pressed.'); return false; }
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's', 'r'].includes(e.key.toLowerCase())) {
          e.preventDefault(); terminateExam('Clipboard shortcuts are prohibited.'); return false;
        }
        if (e.key === 'F12' || e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
          e.preventDefault(); terminateExam('Developer tools / Refresh access is not allowed.'); return false;
        }
      };

      // 1b. Actively wipe any text selections made by CSS-stripping extensions (SuperCopy)
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        selection.removeAllRanges();
        terminateExam('Unauthorized text selection or copying detected.');
      }

      // 2. Scan and destroy active extension nodes injected into DOM
      const suspiciousNodes = document.querySelectorAll('grammarly-extension, grammarly-desktop-integration, loom-container, iframe, [id*="extension"], [class*="extension"]');
      if (suspiciousNodes.length > 0) {
        suspiciousNodes.forEach(node => {
          if (node.id !== 'root' && node.nodeName !== 'IFRAME') {
            node.remove(); // Force delete
            terminateExam('Unauthorized Browser Extension detected and deleted.');
          }
        });
      }
      
      // 3. DevTools / Window spoof check (Threshold increased for accessibility/scaling)
      if (document.fullscreenElement) {
        if (window.outerWidth - window.innerWidth > 250 || window.outerHeight - window.innerHeight > 250) {
          terminateExam('Developer tools or active window spoofing detected.');
        }
      }
    }, 500);

    let blurTimeout = null;
    const handleBlur = () => {
      if (terminatedRef.current) return;
      // 1.5s grace period to filter out transient OS focus losses or system notifications
      blurTimeout = setTimeout(() => {
        if (!document.hasFocus() && !terminatedRef.current) {
          setWarnings(prev => {
            const next = prev + 1;
            if (next >= 3) {
              terminateExam('Multiple window focus loss violations detected.');
            } else {
              setShowWarningModal(true);
            }
            return next;
          });
        }
      }, 1500);
    };

    const handleFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };

    // Standard Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });
    window.addEventListener('blur', handleBlur, { capture: true });
    window.addEventListener('focus', handleFocus, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(enforceAntiCheat);
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
      window.removeEventListener('blur', handleBlur, { capture: true });
      window.removeEventListener('focus', handleFocus, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase]);

  const terminateExam = (reason) => {
    if (terminatedRef.current) return;
    terminatedRef.current = true;
    setTerminationReason(reason);
    setPhase('terminated');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    stopWebcam();
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const requestWebcamAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamGranted(true);
    } catch (err) {
      console.error('Webcam access denied', err);
      setNotification({ message: 'You must grant webcam access to start the exam.' });
    }
  };

  const loadModel = async () => {
    try {
      await tf.ready();
      setNotification({ message: 'Initializing Advanced AI Proctoring Models. This may take a moment...' });
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      
      const [cocoModel] = await Promise.all([
        cocoSsd.load(),
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      modelRef.current = { coco: cocoModel };
    } catch (err) {
      console.error('Error loading AI models:', err);
      setNotification({ message: 'Failed to initialize AI engines.' });
    }
  };

  const detectFaces = async () => {
    if (!videoRef.current || !modelRef.current || phase !== 'active' || terminatedRef.current) return;
    
    if (videoRef.current.readyState === 4 && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      try {
        const [faceDetections, cocoDetections] = await Promise.all([
          faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })).withFaceLandmarks().withFaceDescriptors(),
          modelRef.current.coco.detect(videoRef.current)
        ]);

        // 1. Mobile Phone Detection
        const phoneDetected = cocoDetections.find(c => c.class === 'cell phone');
        if (phoneDetected) {
          terminateExam('Unauthorized object detected: Mobile Phone.');
          return;
        }

        // Canvas drawing
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          if (faceDetections.length > 0) {
            faceDetections.forEach(face => {
              const { x, y, width, height } = face.detection.box;
              
              // Draw dynamic green bounding box
              ctx.strokeStyle = '#2ecc71';
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);
              
              // Draw internal crosshair (approx on the nose)
              const nose = face.landmarks.getNose();
              if (nose && nose.length > 3) {
                const noseTip = nose[3];
                ctx.beginPath();
                ctx.moveTo(noseTip.x - 10, noseTip.y);
                ctx.lineTo(noseTip.x + 10, noseTip.y);
                ctx.moveTo(noseTip.x, noseTip.y - 10);
                ctx.lineTo(noseTip.x, noseTip.y + 10);
                ctx.stroke();
              }
            });
          }
        }
        
        // 2. Face Count Check
        if (faceDetections.length !== 1) {
          setFaceStatus(faceDetections.length === 0 ? 'MISSING' : 'MULTIPLE');
          if (!faceMissingContinuousStartRef.current) {
            faceMissingContinuousStartRef.current = Date.now();
          } else {
            const missingDuration = Date.now() - faceMissingContinuousStartRef.current;
            if (missingDuration > 5000) {
              terminateExam(faceDetections.length === 0 ? 'Face missing from relay for over 5 seconds.' : 'Multiple faces detected in relay for over 5 seconds.');
              return;
            }
          }
        } else {
          setFaceStatus('DETECTED');
          faceMissingContinuousStartRef.current = null;

          const activeFace = faceDetections[0];

          // 3. Identity Check (Compare Descriptor against Baseline)
          if (baselineDescriptorRef.current) {
            const distance = faceapi.euclideanDistance(baselineDescriptorRef.current, activeFace.descriptor);
            if (distance > 0.6) {
              terminateExam('Identity mismatch detected. The person taking the exam changed.');
              return;
            }
          }

          // 4. Head/Gaze Pose Tracking (Heuristic based on eyes and nose)
          const landmarks = activeFace.landmarks;
          const nose = landmarks.getNose()[0];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[0];
          
          const leftEyeToNose = Math.abs(leftEye.x - nose.x);
          const rightEyeToNose = Math.abs(rightEye.x - nose.x);
          
          // If the ratio between eye distances to the nose is highly skewed, the face is turned sharply
          const ratio = leftEyeToNose / rightEyeToNose;
          const isLookingAway = ratio > 2.5 || ratio < 0.4;
          
          if (isLookingAway) {
            if (!gazeOffContinuousStartRef.current) {
              gazeOffContinuousStartRef.current = Date.now();
            } else if (Date.now() - gazeOffContinuousStartRef.current > 4000) {
              terminateExam('Gaze directed off-screen for an extended period.');
              return;
            }
          } else {
            gazeOffContinuousStartRef.current = null;
          }
        }
      } catch (err) {
        console.error('AI Detection error:', err);
      }
    }
    
    if (phase === 'active' && !terminatedRef.current) {
      requestAnimationFrame(detectFaces);
    }
  };

  useEffect(() => {
    if (phase === 'active' && isWebcamGranted) {
      if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      detectFaces();
    }
  }, [phase, isWebcamGranted]);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  const startExam = async () => {
    if (!isWebcamGranted) {
      setNotification({ message: 'Please grant webcam access first.' });
      return;
    }
    try {
      setPhase('loading');
      
      // Load AI models
      await loadModel();

      // Establish Baseline Identity Descriptor
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })).withFaceLandmarks().withFaceDescriptor();
        if (!detection) {
          setNotification({ message: 'Could not establish clear Identity Baseline. Please look directly into the camera with good lighting and try again.' });
          setPhase('disclaimer');
          return;
        }
        baselineDescriptorRef.current = detection.descriptor;
      }

      // Enter Fullscreen (Catch non-user gesture or permission errors)
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (fsErr) {
        console.warn('Fullscreen request failed:', fsErr);
      }

      const res = await API.post('/start-test', { subject, level });
      setQuestions(res.data.questions);
      setTimeLeft(res.data.timeLimit);
      setPhase('active');
      questionStartRef.current = Date.now();
      faceMissingContinuousStartRef.current = null;
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Failed to start exam. Please try again.', redirect: '/quizzes' });
    }
  };

  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const submitTest = async (finalAnswers) => {
    setPhase('submitting');
    try {
      stopWebcam();
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(err => console.log(err));
      }
      const res = await API.post('/submit-test', {
        subject,
        answers: finalAnswers,
        timePerQuestion: timePerQuestionRef.current,
        questions: questions // ADDED: Send questions back for AI verification
      });
      navigate('/results', { state: { results: res.data, subject } });
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Error submitting test', redirect: '/quizzes' });
    }
  };

  const handleSubmit = useCallback(() => {
    const finalAnswers = [...answers];
    if (selected && questions[current]) {
      finalAnswers.push({
        questionId: questions[current].id,
        answer: selected,
        responseTime: Math.round((Date.now() - questionStartRef.current) / 1000)
      });
    }
    submitTest(finalAnswers);
  }, [answers, selected, current, questions]);

  const handleSelect = (option) => {
    setSelected(option);
  };

  const handleNext = () => {
    if (selected === null) return;
    const responseTime = Math.round((Date.now() - questionStartRef.current) / 1000);
    timePerQuestionRef.current.push(responseTime);

    const newAnswers = [...answers, {
      questionId: questions[current].id,
      answer: selected,
      responseTime
    }];
    setAnswers(newAnswers);
    setSelected(null);
    questionStartRef.current = Date.now();

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  if (phase === 'disclaimer') {
    return (
      <div className="quiz-container animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        
        {notification && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div className="animate-fade" style={{ background: '#0B0B0E', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(52, 152, 219, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span style={{ fontSize: 32 }}>ℹ️</span>
              </div>
              <p style={{ color: '#f1f2f6', marginBottom: 32, fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>
                {notification.message}
              </p>
              <button className="btn btn-primary" style={{ padding: '14px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, width: '100%', fontSize: 15, cursor: 'pointer', letterSpacing: 1 }} onClick={() => {
                const redirect = notification.redirect;
                setNotification(null);
                if (redirect) navigate(redirect);
              }}>
                GOT IT
              </button>
            </div>
          </div>
        )}

        <div className="card" style={{ maxWidth: 650, width: '100%', padding: '48px 40px', borderRadius: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, background: 'rgba(231, 76, 60, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Important Exam Rules</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 16 }}>Please read the following rules before starting your assessment.</p>
          </div>
          <div style={{ background: 'rgba(231, 76, 60, 0.05)', border: '1px solid rgba(231, 76, 60, 0.2)', padding: '24px 32px', borderRadius: '16px', marginBottom: 40 }}>
            <h3 style={{ color: '#e74c3c', marginBottom: 20, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛑</span> Strict Validation Active
            </h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16, lineHeight: 1.6 }}>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>⛔ Fullscreen Required</strong><br/><span style={{ color: 'var(--text-secondary)' }}>Exiting fullscreen at ANY time will IMMEDIATELY terminate your exam. No warnings.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>🚫 Escape Key Blocked</strong><br/><span style={{ color: 'var(--text-secondary)' }}>Pressing ESC will INSTANTLY terminate the exam. Do not attempt to exit.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>🔒 No Tab Switching</strong><br/><span style={{ color: 'var(--text-secondary)' }}>Switching tabs or losing window focus is monitored. Excessive violations will terminate your exam.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>📋 No Copy/Paste</strong><br/><span style={{ color: 'var(--text-secondary)' }}>All clipboard shortcuts (Ctrl/⌘ + C, V, X, A) are disabled and will terminate the exam.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>🔄 No Refresh</strong><br/><span style={{ color: 'var(--text-secondary)' }}>F5, Ctrl/⌘+R, and back navigation are blocked. Do not attempt to refresh.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>🛡️ Dev Tools Blocked</strong><br/><span style={{ color: 'var(--text-secondary)' }}>F12, Ctrl/⌘+Shift+I, and similar shortcuts are blocked and will terminate the exam.</span></div>
              </li>
              <li style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: '#e74c3c', marginTop: 2 }}>•</span>
                <div><strong>📸 Webcam Proctoring</strong><br/><span style={{ color: 'var(--text-secondary)' }}>AI will monitor your face. No face detected for 5s or multiple faces = termination.</span></div>
              </li>
            </ul>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#e74c3c', marginBottom: 12, fontSize: 13, fontWeight: 700, padding: '0 20px', letterSpacing: 0.5 }}>
              ⚠️ STRICT MODE: FULLSCREEN EXIT OR ESC KEY = INSTANT TERMINATION.<br/>NO SECOND CHANCES.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 13, fontWeight: 800, padding: '0 20px', textTransform: 'uppercase', letterSpacing: 2 }}>
              By clicking "Start Exam", you agree to these rules. Violations = score of 0 and no XP.
            </p>
            
            {!isWebcamGranted ? (
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '16px', marginBottom: 24, borderColor: '#2ecc71', color: '#2ecc71', borderRadius: '16px', fontSize: 14, fontWeight: 800, background: 'rgba(46, 204, 113, 0.05)' }} 
                onClick={requestWebcamAccess}
              >
                1. GRANT WEBCAM ACCESS TO CONTINUE
              </button>
            ) : (
              <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.08)', color: '#2ecc71', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.2)', marginBottom: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>✓</span> WEBCAM ACCESS GRANTED
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '16px', borderRadius: '16px', fontSize: 14, fontWeight: 800, background: 'rgba(255,255,255,0.02)' }} onClick={() => navigate('/quizzes')}>
                GO BACK
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '16px', background: isWebcamGranted ? '#f03e3e' : 'rgba(231, 76, 60, 0.2)', border: 'none', borderRadius: '16px', cursor: isWebcamGranted ? 'pointer' : 'not-allowed', color: isWebcamGranted ? 'white' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 800 }} onClick={startExam} disabled={!isWebcamGranted}>
                2. START EXAM
              </button>
            </div>
          </div>
          {/* Video tag for detecting faces silently here as well if needed, but it's okay to just load stream */}
          <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

  if (phase === 'terminated') {
    return (
      <div className="quiz-container animate-fade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', padding: '56px 40px', textAlign: 'center', borderRadius: '24px', background: 'var(--bg-secondary)', border: '1px solid rgba(231, 76, 60, 0.2)', boxShadow: '0 25px 50px -12px rgba(231, 76, 60, 0.15)' }}>
          <div style={{ width: 100, height: 100, background: 'rgba(231, 76, 60, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ fontSize: 56 }}>🛑</span>
          </div>
          <h1 style={{ margin: '0 0 16px 0', color: '#f03e3e', fontSize: 36, fontWeight: 900 }}>TERMINATED</h1>
          <div style={{ color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            <span style={{ color: '#f03e3e', fontSize: 24, marginRight: 8 }}>✕</span> Security Violation: {terminationReason || 'A rules violation was detected.'}
          </div>
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16, background: '#f03e3e', color: 'white', border: 'none', width: '100%', borderRadius: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }} onClick={() => navigate('/quizzes')}>
            EXIT TERMINAL
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>{phase === 'loading' ? 'Setting up secure environment...' : 'Analyzing your performance...'}</p>
      </div>
    );
  }

  const q = questions[current];
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 180 ? 'warning' : '';

  return (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0B0B0E', zIndex: 9999, overflowY: 'auto', userSelect: 'none' }}
    >
      
      {notification && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="animate-fade" style={{ background: '#0B0B0E', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(52, 152, 219, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 32 }}>ℹ️</span>
            </div>
            <p style={{ color: '#f1f2f6', marginBottom: 32, fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>
              {notification.message}
            </p>
            <button className="btn btn-primary" style={{ padding: '14px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, width: '100%', fontSize: 15, cursor: 'pointer', letterSpacing: 1 }} onClick={() => {
              const redirect = notification.redirect;
              setNotification(null);
              if (redirect) navigate(redirect);
            }}>
              GOT IT
            </button>
          </div>
        </div>
      )}

      <div className="quiz-container animate-fade" style={{ userSelect: 'none', maxWidth: 1200, margin: '0 auto', padding: '40px', position: 'relative', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
      
      {showWarningModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="animate-fade" style={{ background: '#0B0B0E', padding: '48px', borderRadius: '24px', border: '1px solid #e74c3c', width: '100%', maxWidth: 450, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(231,76,60,0.25)' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(231, 76, 60, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
            </div>
            <h2 style={{ color: '#e74c3c', margin: '0 0 16px 0', fontSize: 24, fontWeight: 800 }}>WARNING ({warnings}/3)</h2>
            <p style={{ color: '#f1f2f6', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
              Tab switching or losing window focus is <strong style={{color: '#e74c3c'}}>strictly prohibited</strong> during the assessment.<br/><br/>
              <span style={{opacity: 0.8}}>Further violations will result in immediate termination of your exam.</span>
            </p>
            <button className="btn btn-primary" style={{ padding: '16px 24px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, width: '100%', fontSize: 16, cursor: 'pointer', letterSpacing: 1 }} onClick={() => {
              if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(e => console.log(e));
              }
              setShowWarningModal(false);
            }}>
              I UNDERSTAND, RETURN TO TEST
            </button>
          </div>
        </div>
      )}

      {/* AI Monitor Sidebar Card - Moved to Left */}
      <div style={{ width: 280, flexShrink: 0, position: 'sticky', top: 40 }}>
        <div style={{ background: '#12121A', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e74c3c', boxShadow: '0 0 10px #e74c3c', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1, color: '#f1f2f6' }}>AI MONITOR</span>
            </div>
            <span style={{ opacity: 0.4, fontSize: 14 }}>🛡️</span>
          </div>

          <div style={{ position: 'relative', width: '100%', padding: '0 12px 12px 12px' }}>
            <div style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-secondary)', padding: '10px 0', fontWeight: 600, letterSpacing: 0.5 }}>
              LOCALLY PROCESSED • NOT RECORDED
            </div>
            
            <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3', backgroundColor: '#000' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror image
                  filter: 'grayscale(100%) contrast(120%) brightness(80%)'
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Flip logically to map onto flipped video
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ padding: '12px', background: faceStatus === 'DETECTED' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: faceStatus === 'DETECTED' ? '1px solid rgba(46, 204, 113, 0.2)' : '1px solid rgba(231, 76, 60, 0.2)', transition: 'all 0.3s' }}>
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, color: faceStatus === 'DETECTED' ? '#2ecc71' : '#e74c3c' }}>
              {faceStatus === 'DETECTED' ? 'FACE DETECTED ✅' : faceStatus === 'MULTIPLE' ? 'MULTIPLE FACES ❌' : 'FACE MISSING ❌'}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Main Area - Moved to Right */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="quiz-header" style={{ background: 'var(--bg-secondary)', padding: '24px 32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
        <div className="quiz-progress-info" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{subject.replace(/-/g, ' ')} <span style={{ opacity: 0.5, fontWeight: 400 }}>({level})</span></span>
          <span style={{ color: 'var(--text-secondary)' }}>•</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>Question {current + 1} of {questions.length}</span>
        </div>
        <div className={`quiz-timer ${timerClass}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 40, height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ width: `${((current) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="question-card" key={current} style={{ background: 'var(--bg-secondary)', padding: '48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="question-number" style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Question {current + 1}</div>
          <div className="question-topic" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{q.topic}</div>
        </div>

        <div className="question-text" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.6, marginBottom: 40, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{q.question}</div>

        <div className="options-grid" style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${selected === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                background: selected === opt ? 'rgba(52, 152, 219, 0.1)' : 'rgba(255,255,255,0.03)',
                border: selected === opt ? '2px solid #3498db' : '2px solid rgba(255,255,255,0.05)',
                borderRadius: 16,
                fontSize: 16,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                gap: '16px',
                lineHeight: 1.5
              }}
              onMouseEnter={(e) => { if (selected !== opt) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; } }}
              onMouseLeave={(e) => { if (selected !== opt) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; } }}
            >
              <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: 10, background: selected === opt ? '#3498db' : 'rgba(255,255,255,0.1)', color: selected === opt ? '#fff' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span style={{ fontWeight: 500, letterSpacing: '0.2px' }}>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={selected === null}
          style={{ padding: '16px 32px', fontSize: 16, borderRadius: 16, opacity: selected === null ? 0.5 : 1, transition: 'all 0.2s', width: '100%', maxWidth: 300 }}
        >
          {current < questions.length - 1 ? 'Next Question →' : 'Submit Exam ✓'}
        </button>
      </div>
    </div>
    </div>
    </div>
  );
}

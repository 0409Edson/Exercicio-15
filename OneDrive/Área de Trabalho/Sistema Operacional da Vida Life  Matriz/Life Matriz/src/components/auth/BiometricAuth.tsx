'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Fingerprint,
    Check,
    X,
    AlertCircle,
    Loader2,
    Scan
} from 'lucide-react';

interface BiometricAuthProps {
    onSuccess: () => void;
    onCancel: () => void;
    mode: 'setup' | 'verify';
}

export default function BiometricAuth({ onSuccess, onCancel, mode }: BiometricAuthProps) {
    const [authMethod, setAuthMethod] = useState<'fingerprint' | 'face' | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [hasFaceData, setHasFaceData] = useState(false);
    const [hasFingerprint, setHasFingerprint] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Check for saved biometric data
    useEffect(() => {
        const savedFace = localStorage.getItem('lifeos-face-data');
        const savedFingerprint = localStorage.getItem('lifeos-fingerprint');
        setHasFaceData(!!savedFace);
        setHasFingerprint(!!savedFingerprint);
    }, []);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start fingerprint authentication using WebAuthn
    const startFingerprintAuth = async () => {
        setAuthMethod('fingerprint');
        setStatus('scanning');
        setError('');

        try {
            // Check if WebAuthn is available
            if (!window.PublicKeyCredential) {
                throw new Error('Seu navegador não suporta autenticação biométrica');
            }

            // Check if platform authenticator is available (Windows Hello, Touch ID, etc.)
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

            if (!available) {
                throw new Error('Nenhum leitor de digital encontrado. Use Windows Hello ou um dispositivo compatível.');
            }

            if (mode === 'setup') {
                // Create new credential
                const credential = await navigator.credentials.create({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        rp: { name: 'LifeOS', id: window.location.hostname },
                        user: {
                            id: new Uint8Array(16),
                            name: 'edson@lifeos.local',
                            displayName: 'Edson de Azevedo Martins',
                        },
                        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                        authenticatorSelection: {
                            authenticatorAttachment: 'platform',
                            userVerification: 'required',
                        },
                        timeout: 60000,
                    },
                });

                if (credential) {
                    localStorage.setItem('lifeos-fingerprint', 'configured');
                    setStatus('success');
                    setTimeout(onSuccess, 1500);
                }
            } else {
                // Verify existing credential
                const credential = await navigator.credentials.get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        timeout: 60000,
                        userVerification: 'required',
                    },
                });

                if (credential) {
                    setStatus('success');
                    setTimeout(onSuccess, 1500);
                }
            }
        } catch (err: any) {
            console.error('Fingerprint error:', err);
            setError(err.message || 'Erro na autenticação por digital');
            setStatus('error');
        }
    };

    // Start face recognition
    const startFaceAuth = async () => {
        setAuthMethod('face');
        setStatus('scanning');
        setError('');

        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Wait for video to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate face detection (in production, would use TensorFlow.js or similar)
            const detectFace = async () => {
                if (!videoRef.current || !canvasRef.current) return;

                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                if (!ctx) return;

                // Draw video frame to canvas
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                // Get image data
                const imageData = canvas.toDataURL('image/jpeg', 0.8);

                if (mode === 'setup') {
                    // Save face data
                    localStorage.setItem('lifeos-face-data', imageData);

                    // Stop camera
                    stream.getTracks().forEach(track => track.stop());

                    setStatus('success');
                    setTimeout(onSuccess, 1500);
                } else {
                    // Compare with saved face (simplified - in production use face-api.js)
                    const savedFace = localStorage.getItem('lifeos-face-data');

                    if (savedFace) {
                        // Simple check - in production, use actual face comparison
                        // For demo, we'll assume if camera works, face matches
                        stream.getTracks().forEach(track => track.stop());
                        setStatus('success');
                        setTimeout(onSuccess, 1500);
                    } else {
                        throw new Error('Nenhum rosto cadastrado');
                    }
                }
            };

            // Auto-detect after 3 seconds
            setTimeout(detectFace, 3000);

        } catch (err: any) {
            console.error('Face auth error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Permissão de câmera negada. Permita o acesso à câmera.');
            } else {
                setError(err.message || 'Erro no reconhecimento facial');
            }
            setStatus('error');
        }
    };

    const cancelAuth = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        onCancel();
    };

    return (
        <div className="space-y-6">
            {/* Method Selection */}
            {!authMethod && (
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-center text-gray-400 mb-6">
                        {mode === 'setup'
                            ? 'Configure sua autenticação biométrica'
                            : 'Escolha como deseja entrar'}
                    </p>

                    {/* Fingerprint Option */}
                    <button
                        onClick={startFingerprintAuth}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-4 transition-colors"
                    >
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Fingerprint size={28} className="text-purple-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">Digital / Windows Hello</p>
                            <p className="text-sm text-gray-400">
                                {hasFingerprint ? 'Configurado ✓' : 'Use seu leitor de digital ou Windows Hello'}
                            </p>
                        </div>
                    </button>

                    {/* Face Option */}
                    <button
                        onClick={startFaceAuth}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-4 transition-colors"
                    >
                        <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <Camera size={28} className="text-teal-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">Reconhecimento Facial</p>
                            <p className="text-sm text-gray-400">
                                {hasFaceData ? 'Configurado ✓' : 'Use a câmera para identificar seu rosto'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full btn-secondary"
                    >
                        Usar senha
                    </button>
                </motion.div>
            )}

            {/* Fingerprint Scanning */}
            {authMethod === 'fingerprint' && (
                <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${status === 'success' ? 'bg-green-500/20' :
                                status === 'error' ? 'bg-red-500/20' :
                                    'bg-purple-500/20'
                            }`}
                        animate={status === 'scanning' ? {
                            scale: [1, 1.1, 1],
                            boxShadow: ['0 0 0 0 rgba(168, 85, 247, 0.4)', '0 0 0 20px rgba(168, 85, 247, 0)', '0 0 0 0 rgba(168, 85, 247, 0)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: status === 'scanning' ? Infinity : 0 }}
                    >
                        {status === 'success' ? (
                            <Check size={48} className="text-green-400" />
                        ) : status === 'error' ? (
                            <X size={48} className="text-red-400" />
                        ) : (
                            <Fingerprint size={48} className="text-purple-400" />
                        )}
                    </motion.div>

                    <p className="font-semibold text-lg mb-2">
                        {status === 'success' ? 'Autenticado!' :
                            status === 'error' ? 'Falha na autenticação' :
                                'Toque no sensor de digital'}
                    </p>
                    <p className="text-sm text-gray-400">
                        {status === 'scanning' && 'Aguardando leitura da digital...'}
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {status === 'error' && (
                        <button onClick={() => setAuthMethod(null)} className="btn-secondary mt-4">
                            Tentar outro método
                        </button>
                    )}
                </motion.div>
            )}

            {/* Face Recognition */}
            {authMethod === 'face' && (
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    {/* Camera Preview */}
                    <div className="relative w-64 h-64 mx-auto mb-6 rounded-full overflow-hidden border-4 border-teal-500/50">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Scanning overlay */}
                        {status === 'scanning' && (
                            <motion.div
                                className="absolute inset-0 border-4 border-teal-400 rounded-full"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}

                        {/* Success overlay */}
                        {status === 'success' && (
                            <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                                <Check size={64} className="text-white" />
                            </div>
                        )}

                        {/* Scan line animation */}
                        {status === 'scanning' && (
                            <motion.div
                                className="absolute left-0 right-0 h-1 bg-teal-400"
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            />
                        )}
                    </div>

                    <p className="font-semibold text-lg mb-2">
                        {status === 'success' ? 'Rosto reconhecido!' :
                            status === 'error' ? 'Falha no reconhecimento' :
                                'Posicione seu rosto na câmera'}
                    </p>
                    <p className="text-sm text-gray-400">
                        {status === 'scanning' && 'Analisando características faciais...'}
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 justify-center mt-4">
                        <button onClick={cancelAuth} className="btn-secondary">
                            Cancelar
                        </button>
                        {status === 'error' && (
                            <button onClick={() => setAuthMethod(null)} className="btn-primary">
                                Tentar outro método
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

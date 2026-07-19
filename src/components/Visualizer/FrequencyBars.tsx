import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FrequencyBarsProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  color?: string;
  height?: number;
}

// 基于 Web Audio API 的频谱可视化
export default function FrequencyBars({
  audioElement,
  isPlaying,
  barCount = 48,
  className,
  color = '#00F0FF',
  height = 80,
}: FrequencyBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    // 创建 AudioContext
    if (!audioCtxRef.current) {
      try {
        const AudioCtx =
          window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = barCount * 4;
        analyser.smoothingTimeConstant = 0.78;
        const source = audioCtxRef.current.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        console.warn('AudioContext init failed', e);
      }
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [audioElement, barCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const data = dataRef.current;
    const ctx = canvas?.getContext('2d') ?? null;

    // 降级模式：无 AnalyserNode 时绘制模拟频谱
    const drawIdle = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const barWidth = w / barCount - 2;
      const t = Date.now() / 400;
      for (let i = 0; i < barCount; i++) {
        const v = isPlaying
          ? 0.3 + 0.25 * Math.sin(t + i * 0.4) + 0.15 * Math.sin(t * 1.7 + i * 0.7)
          : 0.08;
        const barH = Math.max(2, Math.abs(v) * h);
        const x = i * (barWidth + 2);
        const y = h - barH;
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(123, 47, 247, 0.3)');
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillRect(x, y, barWidth, barH);
      }
      if (!analyser) {
        rafRef.current = requestAnimationFrame(drawIdle);
      }
    };

    if (!canvas || !analyser || !data || !ctx) {
      drawIdle();
      return;
    }

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const step = Math.floor(data.length / barCount);
      const barWidth = w / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const v = data[i * step] / 255;
        const barH = Math.max(2, v * h);
        const x = i * (barWidth + 2);
        const y = h - barH;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, 'rgba(123, 47, 247, 0.4)');
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth, barH);
      }
    };

    if (isPlaying && audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    cancelAnimationFrame(rafRef.current);
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, color, barCount]);

  // 设置 canvas 像素比
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx?.scale(dpr, dpr);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full', className)}
      style={{ height: `${height}px` }}
    />
  );
}

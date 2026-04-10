'use client';

import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// Simple QR code generator using canvas
// This creates a deterministic pattern based on the input string
export default function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate a deterministic pattern from the value
    const modules = generateQRMatrix(value);
    const moduleCount = modules.length;
    const moduleSize = size / moduleCount;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Draw modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    // Draw finder patterns (the three corner squares)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, (moduleCount - 7) * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, (moduleCount - 7) * moduleSize, moduleSize);
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`border border-border rounded-lg ${className}`}
    />
  );
}

// Generate a QR-like matrix from a string
function generateQRMatrix(value: string): boolean[][] {
  const moduleCount = 25; // Standard QR size
  const matrix: boolean[][] = Array(moduleCount).fill(null).map(() => 
    Array(moduleCount).fill(false)
  );

  // Create a hash from the value
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Use the hash to seed a simple pseudo-random generator
  const seed = Math.abs(hash);
  const random = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  // Fill the data area (avoiding finder patterns)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      // Skip finder pattern areas
      if (isFinderArea(row, col, moduleCount)) continue;
      
      // Generate pattern based on position and hash
      const idx = row * moduleCount + col;
      matrix[row][col] = random(idx) > 0.5;
    }
  }

  // Add finder patterns
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, moduleCount - 7, 0);
  addFinderPattern(matrix, 0, moduleCount - 7);

  // Add timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  return matrix;
}

function isFinderArea(row: number, col: number, size: number): boolean {
  // Top-left
  if (row < 8 && col < 8) return true;
  // Top-right
  if (row < 8 && col >= size - 8) return true;
  // Bottom-left
  if (row >= size - 8 && col < 8) return true;
  return false;
}

function addFinderPattern(matrix: boolean[][], startRow: number, startCol: number): void {
  // Outer black border
  for (let i = 0; i < 7; i++) {
    matrix[startRow][startCol + i] = true;
    matrix[startRow + 6][startCol + i] = true;
    matrix[startRow + i][startCol] = true;
    matrix[startRow + i][startCol + 6] = true;
  }
  // White border
  for (let i = 1; i < 6; i++) {
    matrix[startRow + 1][startCol + i] = false;
    matrix[startRow + 5][startCol + i] = false;
    matrix[startRow + i][startCol + 1] = false;
    matrix[startRow + i][startCol + 5] = false;
  }
  // Inner black square
  for (let i = 2; i < 5; i++) {
    for (let j = 2; j < 5; j++) {
      matrix[startRow + i][startCol + j] = true;
    }
  }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number): void {
  const size7 = moduleSize * 7;
  const size5 = moduleSize * 5;
  const size3 = moduleSize * 3;

  // Outer black
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, size7, size7);
  
  // White border
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + moduleSize, y + moduleSize, size5, size5);
  
  // Inner black
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, size3, size3);
}

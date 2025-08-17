import React, { useCallback, useEffect, useRef, useState } from "react";

const MainFrame = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingStateRef = useRef({
    isDrawing: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    selectRect: null,
    clickStartTime: 0,
    hasMoved: false,
    fillColor: "gray",
  });

  const [rectangles, setRectangles] = useState([]);
  const [tempRect, setTempRect] = useState(null);

  const FILE_COLORS = ["#95eda7", "#ede695", "#919df2", "#f291f1"];
  const BORDER_RADIUS = 15;
  const MIN_SIZE = 35;
  const CLICKTIME = 150;

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  // https://youtu.be/w7JDeeOVDWc?t=5176

  const drawCrosshair = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    // y-axis
    ctx.beginPath();
    ctx.moveTo(mousePos.x, 0);
    ctx.lineTo(mousePos.x, canvasRef.current?.height || 0);
    ctx.stroke();

    // x-axis
    ctx.beginPath();
    ctx.moveTo(0, mousePos.y);
    ctx.lineTo(canvasRef.current?.width, mousePos.y || 0);
    ctx.stroke();
  }, [mousePos]);

  const drawRoundedRect = useCallback((rect) => {
    const ctx = ctxRef.current;

    if (!ctx) return;

    const { x, y, width, height } = rect;

    const tl = rect.topLeftRadius || 0;
    const tr = rect.topRightRadius || 0;
    const bl = rect.bottomLeftRadius || 0;
    const br = rect.bottomRightRadius || 0;

    ctx.beginPath();
    // top left corner
    ctx.moveTo(x + tl, y);

    // top edge
    ctx.lineTo(x + width - tr, y);
    // top right corner
    if (tr > 0) {
      ctx.quandraticCurveTo(x + width, y, x + width, y + tr);
    } else {
      ctx.lineTo(x + width, y);
    }

    // right edge
    ctx.lineTo(x + width, y + height - br);
    // bottom right corner
    if (br > 0) {
      ctx.quandraticCurveTo(x + width, y + height, x + width - br, y + height);
    } else {
      ctx.lineTo(x + width, y + height);
    }

    // bottom edge
    ctx.lineTo(x + bl, y + height);
    // bottom left corner
    if (bl > 0) {
      ctx.quandraticCurveTo(x, y + height, x, y + height - bl);
    } else {
      ctx.lineTo(x, y + height);
    }

    // left edge
    ctx.lineTo(x, y + tl);
    // top left corner
    if (tl > 0) {
      ctx.quandraticCurveTo(x, y, x + tl, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillColor = rect.fillColor;
    ctx.fill();
  }, []);

  const drawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#99c2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (tempRect) {
      drawRoundedRect(tempRect);
    }

    drawCrosshair();
  }, [drawCrosshair, tempRect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    setMousePos({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });

    drawAll();
  }, []);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  });

  const handleMouseMove = useCallback(
    (e) => {
      const { x, y } = getMousePos(e);
      setMousePos({ x, y });
      const state = drawingStateRef.current;

      if (state.isDrawing) {
        state.hasMoved = true;

        const width = x - state.startX;
        const height = y - state.startY;

        setTempRect({
          x: Math.min(state.startX, x),
          y: Math.min(state.startY, y),
          width: Math.abs(width),
          height: Math.abs(height),
          topLeftRadius: BORDER_RADIUS,
          topRightRadius: BORDER_RADIUS,
          bottomLeftRadius: BORDER_RADIUS,
          bottomRightRadius: BORDER_RADIUS,
          fillColor: state.fillColor,
        });
      }
    },
    [getMousePos]
  );

  const handleMouseDown = useCallback(
    (e) => {
      const { x, y } = getMousePos(e);
      const state = drawingStateRef.current;

      state.clickStartTime = Date.now();
      state.hasMoved = false;
      state.startX = x;
      state.startY = y;
    },
    [getMousePos]
  );

  return (
    <canvas
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      ref={canvasRef}
    />
  );
};

export default MainFrame;
